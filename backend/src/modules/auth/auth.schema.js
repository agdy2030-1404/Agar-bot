import { z } from "zod";

export const registerShcema = z.object({
  name: z.string({ required_error: "name is required" }),
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "invalid email" }),
  password: z
    .string({ required_error: "password is required" })
    .min(6, { message: "password should be at least 6" }),
});

export const loginShcema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "invalid email" }),
  password: z
    .string({ required_error: "password is required" })
    .min(6, { message: "password should be at least 6" }),
});