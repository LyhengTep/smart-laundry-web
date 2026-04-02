import { z } from "zod";

export const DeviceTokenSchema = z.object({
  user_id: z.number().int().positive().nullable().optional(),
  driver_id: z.number().int().positive().nullable().optional(),
  token: z.string().min(1, "Token is required"),
  device_type: z.string().min(1, "Device type is required"),
});

export type DeviceTokenForm = z.infer<typeof DeviceTokenSchema>;
