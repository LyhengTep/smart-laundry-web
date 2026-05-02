"use client";

import { APP_NAME, STORAGE_KEYS } from "@/config/common";
import { ToastContext } from "@/contexts/ToastProvider";
import { useLocalStorage } from "@/hooks/localStorage";
import { login } from "@/services/authService";
import { LoginDTO, UserAuthResponse } from "@/types/auth";
import { toToastMessage } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowRight, Lock, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const AdminLoginSchema = z.object({
  login: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof AdminLoginSchema>;

export default function AdminLoginPage() {
  const toastCtx = useContext(ToastContext);
  const router = useRouter();
  const { value, setValue } = useLocalStorage<UserAuthResponse | null>(
    STORAGE_KEYS.AUTH_USER,
    null,
  );

  useEffect(() => {
    if (value?.role === "ADMIN") {
      router.replace("/admin/customers");
    }
  }, [value, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(AdminLoginSchema),
    mode: "onTouched",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onError: (e) => {
      const message = axios.isAxiosError(e)
        ? ((e.response?.data as { detail?: unknown })?.detail ?? e.message)
        : e instanceof Error
          ? e.message
          : "Something went wrong";
      if (toastCtx?.setToast) {
        toastCtx.setToast({ error: true, message: toToastMessage(message) });
      }
      toastCtx?.setIsVisible(true);
    },
    onSuccess: (data) => {
      if (data.role !== "ADMIN") {
        if (toastCtx?.setToast) {
          toastCtx.setToast({
            error: true,
            message: "Access denied. This portal is for administrators only.",
          });
        }
        toastCtx?.setIsVisible(true);
        return;
      }
      setValue(data);
      router.replace("/admin/customers");
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const payload: LoginDTO = {
      login: data.login,
      password: data.password,
      role: "ADMIN",
    };
    mutate(payload);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-black text-2xl tracking-tight">
                {APP_NAME}
              </p>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                Admin Portal
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-[2rem] border border-slate-700 overflow-hidden shadow-2xl">
          <div className="px-8 pt-8 pb-4 border-b border-slate-700">
            <h1 className="text-xl font-black text-white">Administrator Login</h1>
            <p className="text-slate-400 text-sm mt-1">
              Restricted access — authorized personnel only.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-4">
            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                <input
                  {...register("login")}
                  placeholder="Username or Email"
                  autoComplete="username"
                  className="w-full pl-12 pr-4 py-4 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition"
                />
              </div>
              {errors.login && (
                <p className="text-red-400 text-sm mt-1">{errors.login.message}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                <input
                  type="password"
                  {...register("password")}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              {isPending ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-slate-500 text-sm">
          Not an admin?{" "}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
            Go to main login
          </Link>
        </p>
      </div>
    </div>
  );
}
