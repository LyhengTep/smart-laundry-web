"use client";

import { UserEditForm } from "@/components/admin/UserEditForm";
import { use } from "react";

export default function EditMerchantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <UserEditForm
      userId={id}
      backHref="/admin/merchants"
      backLabel="Back to Merchants"
    />
  );
}
