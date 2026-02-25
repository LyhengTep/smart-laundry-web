"use client";

import { ToastContext } from "@/contexts/ToastProvider";
import { getDriverById, updateDriver } from "@/services/driverService";
import { DriverResponse } from "@/types/driver";
import { toToastMessage } from "@/utils/toast";
import { EditDriverSchema } from "@/validations/driverValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type DriverFormState = z.infer<typeof EditDriverSchema>;

const emptyForm: DriverFormState = {
  id: "",
  user_id: "",
  id_card_number: "",
  license_number: "",
  plate_number: "",
  vehicle_color: "",
  vehicle_type: "",
  user: {
    full_name: "",
    email: "",
    user_name: "",
    phone: "",
    role: "",
    status: "INACTIVE",
  },
};

export default function EditDriverPage() {
  const params = useParams();
  const driverId = params?.id as string;
  const toastCtx = useContext(ToastContext);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DriverFormState>({
    defaultValues: emptyForm,
    resolver: zodResolver(EditDriverSchema),
    mode: "onSubmit",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["driver", driverId],
    queryFn: () => getDriverById(driverId),
    enabled: Boolean(driverId),
  });

  useEffect(() => {
    console.log("Fetched driver data:", data);
    if (!data) return;
    const resolvedDriver = data as DriverResponse;

    const user = resolvedDriver?.user;
    setValue("id", resolvedDriver?.id ?? "");
    setValue("user_id", resolvedDriver?.user_id ?? "");
    setValue("id_card_number", resolvedDriver?.id_card_number ?? "");
    setValue("license_number", resolvedDriver?.license_number ?? "");
    setValue("plate_number", resolvedDriver?.plate_number ?? "");
    setValue("vehicle_color", resolvedDriver?.vehicle_color ?? "");
    setValue("vehicle_type", resolvedDriver?.vehicle_type ?? "");
    setValue("user.full_name", user?.full_name ?? "");
    setValue("user.email", user?.email ?? "");
    setValue("user.user_name", user?.user_name ?? "");
    setValue("user.phone", user?.phone ?? "");
    setValue("user.role", user?.role ?? "");
    setValue("user.status", user?.status ?? "INACTIVE");
  }, [data]);

  const { mutate: saveDriver, isPending } = useMutation({
    mutationFn: (payload: DriverFormState) =>
      updateDriver(driverId, {
        id_card_number: payload.id_card_number,
        license_number: payload.license_number || null,
        plate_number: payload.plate_number,
        vehicle_color: payload.vehicle_color,
        vehicle_type: payload.vehicle_type,
        user: payload.user,
      }),
    onSuccess: () => {
      toastCtx?.setToast?.({
        error: false,
        message: "Driver updated successfully",
      });
      toastCtx?.setIsVisible(true);
      // alert("Driver updated successfully");
    },
    onError: (e) => {
      const detail = axios.isAxiosError(e)
        ? ((e.response?.data as any)?.detail ?? e.message)
        : e;
      const message = toToastMessage(detail);
      toastCtx?.setToast?.({
        error: true,
        message,
      });
      toastCtx?.setIsVisible(true);
      // alert(message);
    },
  });

  return (
    <div>
      <header className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Edit Driver</h1>
          <p className="text-slate-500">Update driver profile and vehicle.</p>
        </div>
        <Link
          href="/admin/drivers"
          className="text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          Back to All Drivers
        </Link>
      </header>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
        {isLoading && (
          <p className="text-sm text-slate-400 mb-6">Loading driver...</p>
        )}
        <form
          className="space-y-8"
          onSubmit={handleSubmit((values) => {
            saveDriver(values);
          })}
        >
          <section>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              User Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="text-sm text-slate-500">
                Driver ID
                <input
                  className="mt-2 w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl outline-none text-slate-500"
                  {...register("id")}
                  readOnly
                />
              </label>
              <label className="text-sm text-slate-500">
                User ID
                <input
                  className="mt-2 w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl outline-none text-slate-500"
                  {...register("user_id")}
                  readOnly
                />
              </label>
              <label className="text-sm text-slate-500">
                Full name
                <input
                  className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500"
                  {...register("user.full_name")}
                />
                {errors.user?.full_name?.message && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.user.full_name.message}
                  </p>
                )}
              </label>
              <label className="text-sm text-slate-500">
                Email
                <input
                  className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500"
                  {...register("user.email")}
                />
                {errors.user?.email?.message && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.user.email.message}
                  </p>
                )}
              </label>
              <label className="text-sm text-slate-500">
                Username
                <input
                  className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500"
                  {...register("user.user_name")}
                />
                {errors.user?.user_name?.message && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.user.user_name.message}
                  </p>
                )}
              </label>
              <label className="text-sm text-slate-500">
                Phone
                <input
                  className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500"
                  {...register("user.phone")}
                />
                {errors.user?.phone?.message && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.user.phone.message}
                  </p>
                )}
              </label>
              <label className="text-sm text-slate-500">
                Status
                <select
                  className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500"
                  {...register("user.status")}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </label>
              <label className="text-sm text-slate-500">
                Role
                <input
                  className="mt-2 w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl outline-none text-slate-500"
                  readOnly
                  {...register("user.role")}
                />
                {errors.user?.role?.message && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.user.role.message}
                  </p>
                )}
              </label>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              Vehicle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="text-sm text-slate-500">
                Vehicle type
                <select
                  className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500"
                  {...register("vehicle_type")}
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="MOTORCYCLE">Motorcycle / Scooter</option>
                  <option value="TUK_TUK">
                    Tuk Tuk / Three-wheeled Transportation
                  </option>
                  <option value="E_BIKE">E-Bike / Bicycle</option>
                </select>
                {errors.vehicle_type?.message && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.vehicle_type.message}
                  </p>
                )}
              </label>
              <label className="text-sm text-slate-500">
                Vehicle color
                <input
                  className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500"
                  {...register("vehicle_color")}
                />
                {errors.vehicle_color?.message && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.vehicle_color.message}
                  </p>
                )}
              </label>
              <label className="text-sm text-slate-500">
                Plate number
                <input
                  className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500"
                  {...register("plate_number")}
                />
                {errors.plate_number?.message && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.plate_number.message}
                  </p>
                )}
              </label>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="text-sm text-slate-500">
                ID card number
                <input
                  className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500"
                  {...register("id_card_number")}
                />
                {errors.id_card_number?.message && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.id_card_number.message}
                  </p>
                )}
              </label>
              <label className="text-sm text-slate-500">
                License number
                <input
                  className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500"
                  {...register("license_number")}
                />
                {errors.license_number?.message && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.license_number.message}
                  </p>
                )}
              </label>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/drivers"
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
