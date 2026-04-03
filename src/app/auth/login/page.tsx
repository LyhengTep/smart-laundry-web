"use client";
import {
  RoleKeys,
  RoleSelector,
  RoleSelectorValues,
} from "@/components/RoleSelector";
import { APP_NAME, STORAGE_KEYS } from "@/config/common";
import { ToastContext } from "@/contexts/ToastProvider";
import { useLocalStorage } from "@/hooks/localStorage";
import { login } from "@/services/authService";
import { registerDeviceToken } from "@/services/deviceTokenService";
import {
  getFcmToken,
  requestFirebaseNotificationPermission,
} from "@/services/firebaseMessaging";
import { LoginDTO, UserAuthResponse } from "@/types/auth";
import { toToastMessage } from "@/utils/toast";
import { LoginForm } from "@/validations/authValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowRight, Lock, Mail, Wind } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { SubmitHandler, useForm, UseFormSetValue } from "react-hook-form";
import { z } from "zod";
const roles: Record<string, RoleSelectorValues> = {
  CUSTOMER: {
    value: "Customer",
    icon: "user",
  },
  MERCHANT: {
    value: "Shop Owner",
    icon: "store",
  },
  DRIVER: {
    value: "Driver",
    icon: "driver",
  },
};

interface IFormInput {
  login: string;
  password: string;
  role: string;
}

const setEmpty = (setValue: UseFormSetValue<FormValues>) => {
  setValue("login", "");
  setValue("password", "");
};

type FormValues = z.infer<typeof LoginForm>;

const detectDeviceType = () => {
  if (typeof navigator === "undefined") return "web";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "web";
};

export default function LoginPage() {
  const toastCtx = useContext(ToastContext);
  const [role, setRole] = useState<RoleKeys>("CUSTOMER");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue: setFormValue,
  } = useForm<FormValues>({
    resolver: zodResolver(LoginForm),
    mode: "onTouched",
  });

  const { setValue } = useLocalStorage<UserAuthResponse>(
    STORAGE_KEYS.AUTH_USER,
    null,
  );
  // const { setValue: setDriverProfile } = useLocalStorage<DriverResponse>(
  //   STORAGE_KEYS.DRIVER_PROFILE,
  //   null,
  // );

  useEffect(() => {
    setFormValue("role", role);
  }, [role, setFormValue]);
  const { mutate } = useMutation({
    mutationFn: login,
    onError: (e) => {
      console.log("Error on login", e);

      const message = axios.isAxiosError(e)
        ? ((e.response?.data as { detail?: unknown })?.detail ?? e.message)
        : e instanceof Error
          ? e.message
          : "Something went wrong";
      if (toastCtx?.setToast) {
        toastCtx.setToast({
          error: true,
          message: toToastMessage(message),
        });
      }
      toastCtx?.setIsVisible(true);
    },

    onSuccess: async (value) => {
      console.log("value return from the server", value);
      setValue(value);
      if (value.role === "DRIVER") {
        try {
          // const profile = await getDriverByUserId(value.id);
          // setDriverProfile(profile);

          const permission = await requestFirebaseNotificationPermission();
          if (permission === "granted") {
            const fcmToken = await getFcmToken();
            console.log("Obtained FCM token:", fcmToken);
            if (fcmToken) {
              const res = await registerDeviceToken({
                user_id: value.id,
                driver_id: value?.driver?.id || null,
                token: fcmToken,
                device_type: detectDeviceType(),
              });

              console.log("Device token registered:", res);
            }
          }
        } catch (e) {
          console.log("Failed to load/register driver profile token", e);
          // setDriverProfile(null);
        }
      } else {
        // setDriverProfile(null);
      }

      toastCtx.setIsVisible(true);
      setTimeout(() => {
        if (redirect && redirect.startsWith("/")) {
          router.replace(redirect);
          return;
        }

        if (value.role === "MERCHANT") {
          router.push("/businesses-admin");
          return;
        }

        if (value.role === "DRIVER") {
          router.push("/drivers/tasks");
          return;
        }
        router.push("/");
      }, 1000);
    },
  });

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    try {
      console.log("Form Data --->", data);
      const payload: LoginDTO = {
        login: data.login,
        password: data.password,
        role: data.role,
      };
      await mutate(payload);
    } catch (e) {
      console.log("Submit ===>", e);
    }
  };
  // return null;
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 text-center border-b border-slate-50">
          {/* Header */}
          <div className="p-8 text-center border-b border-slate-50">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <Wind size={24} />
              </div>
              <span className="text-2xl font-black text-slate-800 tracking-tight">
                {APP_NAME}
              </span>
            </Link>
          </div>

          <h2 className="text-2xl font-black text-slate-800">Welcome Back</h2>
          <p className="text-slate-400 text-sm">
            Sign in to your {roles[role].value} account
          </p>
        </div>

        <div className="p-8">
          {/* Role Segmented Control */}
          <RoleSelector
            values={roles}
            setType={(role) => {
              setRole(role);
              setEmpty(setFormValue);
            }}
            currentValue={role}
          />

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
              <input
                {...register("login")}
                // type="email"
                placeholder="Email/Username"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 ring-blue-500"
              />
            </div>
            {errors.login && (
              <p className="text-red-600 text-sm">{errors.login.message}</p>
            )}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 ring-blue-500"
              />
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm">{errors.password.message}</p>
            )}
            <button
              type="submit"
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
            >
              Login as {roles[role].value} <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
