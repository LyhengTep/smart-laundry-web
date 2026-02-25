import * as z from "zod";

export const EditDriverSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  id_card_number: z
    .string()
    .min(6, "ID card number is required (min 6 characters)."),
  license_number: z
    .string()
    .min(5, "License number must be at least 5 characters.")
    .or(z.literal("")),
  plate_number: z
    .string()
    .min(3, "Plate number is required (min 3 characters)."),
  vehicle_color: z.string().min(1, "Vehicle color is required."),
  vehicle_type: z.string().min(1, "Vehicle type is required."),
  user: z.object({
    full_name: z.string().min(2, "Full name is required (min 2 characters)."),
    email: z.email("Valid email is required."),
    user_name: z.string().min(3, "Username is required (min 3 characters)."),
    phone: z
      .string()
      .regex(/^[0-9+\-\s]{7,15}$/, "Valid phone number is required."),
    role: z.string().min(1, "Role is required."),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "REJECTED"]),
  }),
});
