"use client";

import { UserEditForm } from "@/components/admin/UserEditForm";
import { use } from "react";

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <UserEditForm
      userId={id}
      backHref="/admin/customers"
      backLabel="Back to Customers"
    />
  );
}
