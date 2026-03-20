# Business Profile Edit Flow (Knowledge)

This note documents the edit flow in `src/app/businesses/[id]/profile/page.tsx`.

## Scope

- Edit business profile data.
- Upload and update **cover image** before saving.
- Update offered services + pricing.
- Keep phone/address read-only (currently frozen).
- Send final payload to `PUT /api/v1/businesses/{business_id}`.

## Main Files

- UI + form logic: `src/app/businesses/[id]/profile/page.tsx`
- API calls: `src/services/businessService.ts`
- Payload + domain types: `src/types/business.ts`
- Validation schemas: `src/validations/businessValidation.ts`

## Form Validation Standard

- Uses `react-hook-form` + `zodResolver`.
- Form schema: `UpdateBusinessProfileSchema`.
- Final API payload schema: `UpdateBusinessPayloadSchema`.
- Payload is validated with `safeParse(...)` before mutation.

## Edit Flow

1. Load business by id (`getBusinessById`).
2. Reset form with existing values.
3. Merge existing offered services with master laundry services list.
4. User edits name, hours, services, cover.
5. On save:
   - confirm dialog
   - upload cover if changed
   - build API payload
   - validate payload with `UpdateBusinessPayloadSchema`
   - call `updateBusiness(...)`
6. On success:
   - refresh query cache (`business` + `businesses`)
   - leave edit mode
   - show success toast

## Payload Shape (Current)

```json
{
  "name": "string",
  "address": "string",
  "phone": "string",
  "latitude": 0,
  "longitude": 0,
  "profile_image_url": "string",
  "cover_image_url": "string",
  "open_time": "11:19:00.276Z",
  "close_time": "11:19:00.276Z",
  "services": [
    {
      "business_id": "uuid",
      "service_id": 0,
      "base_price": 0,
      "pricing_type": "per_item",
      "id": "uuid"
    }
  ]
}
```

## Important Mapping Rules

- Time input (`HH:mm`) is converted to API format via `toApiTime()`:
  - Example: `08:30` -> `08:30:00.000Z`
- `service_id` is converted to number.
- Only enabled services are included in payload.
- Existing service relation `id` is forwarded when available.

## Current Constraints

- Profile image editing is temporarily disabled.
- Phone and address are read-only in edit screen.
- Cover image supports local preview and file upload.

## Troubleshooting

- If edit mode exits unexpectedly when toggling services, ensure service toggle buttons are `type="button"` in `src/components/ServicesPricing.tsx`.
- If payload fails validation, check:
  - UUID fields (`business_id`, optional `id`)
  - `service_id` is number
  - `base_price >= 0`
  - `pricing_type` in `per_kg | per_item | fixed`
