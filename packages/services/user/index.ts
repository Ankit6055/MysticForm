import bcrypt from "bcryptjs";
import { db, eq } from "@repo/database";
import { SelectUser, usersTable } from "@repo/database/schema";
import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import { GetAuthenticationMethodOutputSchema } from "./model";

export class UserServiceError extends Error {
  constructor(
    public readonly code: "CONFLICT" | "UNAUTHORIZED" | "BAD_REQUEST",
    message: string,
  ) {
    super(message);
  }
}

function linkProvider(providers: string[] | null | undefined, provider: "google" | "password") {
  return Array.from(new Set([...(providers ?? []), provider]));
}

class UserService {
  public async getAuthenticationMethods(): Promise<
    ReadonlyArray<GetAuthenticationMethodOutputSchema>
  > {
    const supportedAuthenticationProviders: GetAuthenticationMethodOutputSchema[] = [
      {
        provider: "EMAIL_PASSWORD",
        displayName: "Email",
        displayText: "Signin with email",
      },
    ];

    const isGoogleConfigured = !!(
      env.GOOGLE_OAUTH_CLIENT_ID &&
      env.GOOGLE_OAUTH_CLIENT_SECRET &&
      env.GOOGLE_OAUTH_REDIRECT_URI
    );

    if (isGoogleConfigured) {
      const url = this.getGoogleAuthUrl();
      supportedAuthenticationProviders.push({
        provider: "GOOGLE_OAUTH",
        displayName: "Google",
        displayText: "Signin with Google",
        authUrl: url,
      });
    }

    return supportedAuthenticationProviders;
  }

  public getGoogleAuthUrl(next?: string) {
    return googleOAuth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
      state: next,
    });
  }

  public async signUpWithPassword(input: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<SelectUser> {
    const localPart = input.email.split("@")[0];
    if (localPart && input.password.toLowerCase().includes(localPart.toLowerCase())) {
      throw new UserServiceError("BAD_REQUEST", "Password cannot contain the email username");
    }

    const existing = await this.findByEmail(input.email);
    const passwordHash = await bcrypt.hash(input.password, 10);

    if (existing) {
      if (existing.passwordHash || existing.authProvider.includes("password")) {
        throw new UserServiceError("CONFLICT", "Password account already exists");
      }

      const [linkedUser] = await db
        .update(usersTable)
        .set({
          fullName: existing.fullName || input.fullName,
          passwordHash,
          authProvider: linkProvider(existing.authProvider, "password"),
        })
        .where(eq(usersTable.id, existing.id))
        .returning();

      if (!linkedUser) throw new UserServiceError("BAD_REQUEST", "Unable to link account");
      return linkedUser;
    }

    const [user] = await db
      .insert(usersTable)
      .values({
        email: input.email,
        fullName: input.fullName,
        passwordHash,
        authProvider: ["password"],
      })
      .returning();

    if (!user) throw new UserServiceError("BAD_REQUEST", "Unable to create account");
    return user;
  }

  public async signInWithPassword(input: { email: string; password: string }): Promise<SelectUser> {
    const user = await this.findByEmail(input.email);
    if (!user?.passwordHash) {
      throw new UserServiceError("UNAUTHORIZED", "Invalid credentials");
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UserServiceError("UNAUTHORIZED", "Invalid credentials");
    }

    return user;
  }

  public async signInWithGoogleCode(code: string): Promise<SelectUser> {
    const { tokens } = await googleOAuth2Client.getToken(code);
    if (!tokens.id_token) {
      throw new UserServiceError("BAD_REQUEST", "Google did not return an id token");
    }

    const ticket = await googleOAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_OAUTH_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();

    if (!email) {
      throw new UserServiceError("BAD_REQUEST", "Google account has no email");
    }

    const existing = await this.findByEmail(email);
    if (existing) {
      const [linkedUser] = await db
        .update(usersTable)
        .set({
          fullName: existing.fullName || payload?.name || email,
          profileImageUrl: existing.profileImageUrl ?? payload?.picture ?? null,
          emailVerified: true,
          authProvider: linkProvider(existing.authProvider, "google"),
        })
        .where(eq(usersTable.id, existing.id))
        .returning();

      if (!linkedUser) throw new UserServiceError("BAD_REQUEST", "Unable to link account");
      return linkedUser;
    }

    const [user] = await db
      .insert(usersTable)
      .values({
        email,
        fullName: payload?.name || email,
        profileImageUrl: payload?.picture ?? null,
        emailVerified: true,
        authProvider: ["google"],
      })
      .returning();

    if (!user) throw new UserServiceError("BAD_REQUEST", "Unable to create account");
    return user;
  }

  public async findByEmail(email: string): Promise<SelectUser | null> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    return user ?? null;
  }

  public async findById(id: string): Promise<SelectUser | null> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return user ?? null;
  }
}

export default UserService;
