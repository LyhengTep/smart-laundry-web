import * as z from "zod";

export const CreateBusinessBasicSchema = z
  .object({
    name: z.string().min(1, "Shop name is required."),
    phone: z
      .string()
      .min(1, "Phone number is required.")
      .regex(/^[0-9+()\s-]+$/, "Invalid phone number."),
    address: z.string().min(1, "Location address is required."),
    openTime: z.string().min(1, "Opening time is required."),
    closeTime: z.string().min(1, "Closing time is required."),
    latitude: z.number(),
    longitude: z.number(),
    category: z.string(),
    basePrice: z.string(),
    hours: z.string(),
    services: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        unitType: z.enum(["per_kg", "per_item", "fixed"]),
        price: z.number().min(0),
        enabled: z.boolean(),
        image: z.string().url(),
      }),
    ),
    image: z.any().optional(),
  })
  .refine((data) => data.closeTime > data.openTime, {
    message: "Closing time must be later than opening time.",
    path: ["closeTime"],
  });

export const UpdateBusinessProfileSchema = z
  .object({
    name: z.string().min(1, "Shop name is required."),
    phone: z
      .string()
      .min(1, "Phone number is required.")
      .regex(/^[0-9+()\s-]+$/, "Invalid phone number."),
    address: z.string().min(1, "Location address is required."),
    openTime: z.string().min(1, "Opening time is required."),
    closeTime: z.string().min(1, "Closing time is required."),
    services: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        unitType: z.enum(["per_kg", "per_item", "fixed"]),
        price: z.number().min(0),
        enabled: z.boolean(),
        image: z.string().url(),
      }),
    ),
    image: z.any().optional(),
  })
  .refine((data) => data.closeTime > data.openTime, {
    message: "Closing time must be later than opening time.",
    path: ["closeTime"],
  });

export const UpdateBusinessPayloadSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1).regex(/^[0-9+()\s-]+$/),
  latitude: z.number(),
  longitude: z.number(),
  profile_image_url: z.string(),
  cover_image_url: z.string(),
  open_time: z.string().min(1),
  close_time: z.string().min(1),
  services: z.array(
    z.object({
      business_id: z.string().uuid(),
      service_id: z.number().int().nonnegative(),
      base_price: z.number().min(0),
      pricing_type: z.enum(["per_kg", "per_item", "fixed"]),
      id: z.string().uuid().optional(),
    }),
  ),
});
