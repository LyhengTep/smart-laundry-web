import * as z from "zod";

export const RegistrationForm = z
  .object({
    fullName: z.string(),
    email: z.string().email("Invalid email"),
    username: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    phone: z.string().regex(/^[0-9+()\s-]+$/, "Invalid phone number"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginForm = z.object({
  login: z.string(),
  password: z.string(),
});
