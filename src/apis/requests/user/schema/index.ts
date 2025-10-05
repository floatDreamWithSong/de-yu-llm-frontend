import z from "zod";

export const AuthInfoSchema = z.object({
  authId: z.string(),
  authType: z.literal("phone-verify"),
});
export const CredentialsSchema = z.object({
  token: z.string(),
});
export type UserCredentials = z.infer<typeof CredentialsSchema>;
