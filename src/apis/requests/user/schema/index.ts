import z from "zod";

export const AuthInfoSchema = z.object({
  authId: z.string(),
  authType: z.literal("phone"),
});
export const CredentialsSchema = z.object({
  expire: z.number(),
  token: z.string(),
  userId: z.string(),
});
export type UserCredentials = z.infer<typeof CredentialsSchema>;
