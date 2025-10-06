import z from "zod";

export const AuthInfoSchema = z.object({
  authId: z.string(),
  authType: z.union([z.literal("phone-verify"), z.literal("phone-password")]),
});
export const CredentialsSchema = z.object({
  token: z.string(),
});
export type UserCredentials = z.infer<typeof CredentialsSchema>;
