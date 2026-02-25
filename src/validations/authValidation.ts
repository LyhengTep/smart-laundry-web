import * as z from "zod";

export const RegistrationForm = z
  .object({
    fullName: z.string(),
    email: z.email("Invalid email"),
    username: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    phone: z.string().regex(/^[0-9+()\s-]+$/, "Invalid phone number"),
    // role: z.enum(["CUSTOMER", "MERCHANT"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginForm = z.object({
  login: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.string(),
});

export const CustomerSchema = RegistrationForm.extend({
  role: z.literal("CUSTOMER"),
});

export const MerchantSchema = RegistrationForm.extend({
  role: z.literal("MERCHANT"),
});

export const DriverRegistrationForm = RegistrationForm.extend({
  role: z.literal("DRIVER"),
  idNumber: z.string("Invalid ID number"),
  vehicleType: z.string("Invalid vehicle type"),
  plateNumber: z.string("Invalid plate number"),
  licenseNumber: z.string("Invalid license number"),
  vehicleColor: z.string("Invalid vehicle color"),
});
