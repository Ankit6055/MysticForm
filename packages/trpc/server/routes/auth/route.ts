import { z, zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import {
  getAuthenticationMethodOutputSchema,
  signInInputSchema,
  signUpInputSchema,
  userOutputSchema,
} from "@repo/services/user/model";
import { signSessionToken } from "@repo/services/user/jwt";
import { UserServiceError } from "@repo/services/user";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { TRPCError } from "@trpc/server";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

function mapUserServiceError(error: unknown): never {
  if (error instanceof UserServiceError) {
    throw new TRPCError({
      code: error.code,
      message: error.message,
    });
  }

  throw error;
}

export const authRouter = router({
  getSupportedAuthenticationProviders: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/supported-providers"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.readonly(z.array(getAuthenticationMethodOutputSchema)))
    .query(async () => {
      const supportedMethods = await userService.getAuthenticationMethods();
      return supportedMethods;
    }),
  signUp: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/signup"), tags: TAGS } })
    .input(signUpInputSchema)
    .output(userOutputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await userService.signUpWithPassword(input);
        ctx.setSessionCookie(signSessionToken(user));
        return user;
      } catch (error) {
        mapUserServiceError(error);
      }
    }),
  signIn: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/signin"), tags: TAGS } })
    .input(signInInputSchema)
    .output(userOutputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await userService.signInWithPassword(input);
        ctx.setSessionCookie(signSessionToken(user));
        return user;
      } catch (error) {
        mapUserServiceError(error);
      }
    }),
  me: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/me"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(userOutputSchema.nullable())
    .query(({ ctx }) => {
      return ctx.user;
    }),
  signOut: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/signout"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.object({ success: z.literal(true) }))
    .mutation(({ ctx }) => {
      ctx.clearSessionCookie();
      return { success: true as const };
    }),
});
