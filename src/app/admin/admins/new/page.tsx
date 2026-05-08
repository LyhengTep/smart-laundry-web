"use client";

import { ToastContext } from "@/contexts/ToastProvider";
import { registerAdmin } from "@/services/userService";
import { AdminRegisterRequest } from "@/types/user";
import { toToastMessage } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Lock, Mail, Phone, Save, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const AdminRegisterSchema = z
  .object({
    full_name: z.string().min(1, "Full name is required"),
    user_name: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Please confirm the password"),
  })
  .refine((v) => v.password === v.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof AdminRegisterSchema>;

const BACK_HREF = "/admin/customers";

export default function NewAdminPage() {
  const router = useRouter();
  const toastCtx = useContext(ToastContext);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(AdminRegisterSchema),
    defaultValues: {
      full_name: "",
      user_name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: AdminRegisterRequest) => registerAdmin(payload),
    onSuccess: (data) => {
      toastCtx?.setToast?.({
        error: false,
        message: `Admin "${data.full_name}" registered successfully.`,
      });
      toastCtx?.setIsVisible(true);
      reset();
    },
    onError: (e) => {
      const detail = axios.isAxiosError(e)
        ? ((e.response?.data as { detail?: unknown })?.detail ?? e.message)
        : e instanceof Error
          ? e.message
          : "Something went wrong";
      toastCtx?.setToast?.({ error: true, message: toToastMessage(detail) });
      toastCtx?.setIsVisible(true);
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate({
      full_name: values.full_name,
      user_name: values.user_name,
      email: values.email,
      phone: values.phone,
      password: values.password,
      role: "ADMIN",
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        type="button"
        onClick={() => router.push(BACK_HREF)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <header className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Register New Admin</h1>
        <p className="text-slate-500 text-sm mt-1">
          Create a new administrator account with full panel access.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Personal info */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Personal Information
          </p>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register("full_name")}
                placeholder="Full name"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition"
              />
            </div>
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                @
              </span>
              <input
                {...register("user_name")}
                placeholder="username"
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition"
              />
            </div>
            {errors.user_name && (
              <p className="text-red-500 text-xs mt-1">{errors.user_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register("email")}
                type="email"
                placeholder="admin@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Phone
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register("phone")}
                placeholder="+855..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Password
          </p>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register("password")}
                type="password"
                placeholder="At least 6 characters"
                autoComplete="new-password"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register("confirm_password")}
                type="password"
                placeholder="Re-enter password"
                autoComplete="new-password"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition"
              />
            </div>
            {errors.confirm_password && (
              <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>
            )}
          </div>
        </div>

        {/* Role badge — informational only */}
        <div className="bg-blue-50 border border-blue-100 rounded-[2rem] px-6 py-4 flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Role</span>
          <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            ADMIN
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.push(BACK_HREF)}
            className="px-6 py-3 rounded-2xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !isDirty}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isPending ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Register Admin
          </button>
        </div>
      </form>
    </div>
  );
}
