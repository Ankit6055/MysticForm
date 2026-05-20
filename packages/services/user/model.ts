import { z } from "zod";

export const getAuthenticationMethodOutputSchema = z.object({
  provider: z.enum(["GOOGLE_OAUTH", "EMAIL_PASSWORD"]),
  displayName: z.string().optional(),
  displayText: z.string().optional(),
  authUrl: z.string().optional(),
});
export type GetAuthenticationMethodOutputSchema = z.infer<
  typeof getAuthenticationMethodOutputSchema
>;

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must include at least one letter")
  .regex(/\d/, "Password must include at least one number");

export const signUpInputSchema = z
  .object({
    email: z.email().max(255).transform((value) => value.toLowerCase()),
    password: passwordSchema,
    fullName: z.string().trim().min(1).max(80),
  })
  .refine(({ email, password }) => {
    const localPart = email.split("@")[0];
    return !localPart || !password.toLowerCase().includes(localPart.toLowerCase());
  }, {
    message: "Password cannot contain the email username",
    path: ["password"],
  });

export const signInInputSchema = z.object({
  email: z.email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

export const userOutputSchema = z.object({
  id: z.uuid(),
  fullName: z.string(),
  email: z.email(),
  emailVerified: z.boolean().nullable(),
  profileImageUrl: z.string().nullable(),
  authProvider: z.array(z.string()),
});
