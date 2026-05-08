"use client";

import { ToastContext } from "@/contexts/ToastProvider";
import { useUser } from "@/hooks/users/userHook";
import { updateUser } from "@/services/userService";
import { UserUpdateRequest } from "@/types/user";
import { toToastMessage } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Lock, Mail, Phone, Save, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const UserEditSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  user_name: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  password: z.string().optional(),
  role: z.string().min(1),
  status: z.string().min(1),
});

type FormValues = z.infer<typeof UserEditSchema>;

interface UserEditFormProps {
  userId: string;
  backHref: string;
  backLabel: string;
}

const ROLES = ["ADMIN", "MERCHANT", "DRIVER", "CUSTOMER"] as const;
const STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED", "REJECTED"] as const;

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
  REJECTED: "Rejected",
};

export function UserEditForm({ userId, backHref, backLabel }: UserEditFormProps) {
  const router = useRouter();
  const toastCtx = useContext(ToastContext);
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useUser(userId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(UserEditSchema),
    defaultValues: {
      full_name: "",
      user_name: "",
      email: "",
      phone: "",
      password: "",
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  });

  // Populate form once user data is loaded
  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        user_name: user.user_name,
        email: user.email,
        phone: user.phone,
        password: "",
        role: user.role,
        status: user.status,
      });
    }
  }, [user, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UserUpdateRequest) => updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toastCtx?.setToast?.({ error: false, message: "User updated successfully." });
      toastCtx?.setIsVisible(true);
      router.push(backHref);
    },
    onError: (e) => {
      const detail = axios.isAxiosError(e)
        ? ((e.response?.data as { detail?: unknown })?.detail ?? e.message)
        : e instanceof Error ? e.message : "Something went wrong";
      toastCtx?.setToast?.({ error: true, message: toToastMessage(detail) });
      toastCtx?.setIsVisible(true);
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload: UserUpdateRequest = {
      full_name: values.full_name,
      user_name: values.user_name,
      email: values.email,
      phone: values.phone,
      role: values.role,
      status: values.status,
      password: values.password?.trim() ?? "",
    };
    mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-slate-100 rounded-2xl w-1/3" />
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-600 rounded-2xl px-6 py-5 text-sm font-medium">
        Failed to load user. Please go back and try again.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back nav */}
      <button
        type="button"
        onClick={() => router.push(backHref)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition"
      >
        <ArrowLeft size={16} />
        {backLabel}
      </button>

      <header className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Edit User</h1>
        <p className="text-slate-500 text-sm mt-1">
          Updating account for{" "}
          <span className="font-semibold text-slate-700">{user.full_name}</span>
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Personal info card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Personal Information
          </p>

          {/* Full name */}
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

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
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

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register("email")}
                type="email"
                placeholder="email@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
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

        {/* Password card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Password
          </p>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              New Password
              <span className="ml-1.5 text-slate-400 font-normal text-xs">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register("password")}
                type="password"
                placeholder="Enter new password"
                autoComplete="new-password"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Role & Status card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Account Settings
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Role
              </label>
              <div className="relative">
                <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  {...register("role")}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition appearance-none"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.push(backHref)}
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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
