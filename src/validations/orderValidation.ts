import { z } from "zod";

export const CreateOrderSchema = z
  .object({
    pickupAddress: z.string().min(1, "Pickup address is required."),
    deliveryAddress: z.string().optional(),
    pickupLatitude: z.number(),
    pickupLongitude: z.number(),
    deliveryLatitude: z.number(),
    deliveryLongitude: z.number(),
    scheduledPickupAt: z.string().min(1, "Pickup time is required."),
    scheduledDropoffAt: z.string().min(1, "Drop-off time is required."),
    notes: z.string().optional(),
    discount: z.number().min(0),
    services: z
      .array(
        z.object({
          business_service_id: z.string().min(1),
          service_name: z.string(),
          unit_price: z.number().min(0),
          measure_type: z.string(),
          selected: z.boolean(),
          quantity: z.number().min(0),
          note: z.string().optional(),
        }),
      )
      .min(1),
  })
  .superRefine((data, ctx) => {
    const selected = data.services.filter((service) => service.selected);
    if (selected.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["services"],
        message: "Please select at least one service.",
      });
    }

    selected.forEach((service, index) => {
      if (service.quantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["services", index, "quantity"],
          message: "Quantity must be greater than 0.",
        });
      }
    });

    if (data.scheduledDropoffAt <= data.scheduledPickupAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledDropoffAt"],
        message: "Drop-off time must be later than pickup time.",
      });
    }
  });
