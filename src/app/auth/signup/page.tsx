"use client";

import Loading from "@/components/Loading";
import {
  RoleKeys,
  RoleSelector,
  RoleSelectorValues,
} from "@/components/RoleSelector";
import { APP_NAME } from "@/config/common";
import { ToastContext } from "@/contexts/ToastProvider";
import { registerUser } from "@/services/authService";
import { RegisterUserDTO } from "@/types/auth";
import {
  CustomerSchema,
  DriverRegistrationForm,
  MerchantSchema,
} from "@/validations/authValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  FileText,
  IdCard,
  Lock,
  Mail,
  Palette,
  Truck,
  User,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import {
  FieldErrors,
  SubmitHandler,
  useForm,
  UseFormSetValue,
} from "react-hook-form";
import { z } from "zod";

interface IFormInput {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  idNumber: string;
  vehicleType: string;
  plateNumber: string;
  licenseNumber: string;
  vehicleColor: string;
}

const FormSchema = z.discriminatedUnion("role", [
  CustomerSchema,
  MerchantSchema,
  DriverRegistrationForm,
]);
type FormValues = z.infer<typeof FormSchema>;
// type FormValues =
//   | z.infer<typeof DriverRegistrationForm>
//   | z.infer<typeof RegistrationForm>;

const setEmpty = (setValue: UseFormSetValue<FormValues>) => {
  setValue("fullName", "");
  setValue("email", "");
  setValue("confirmPassword", "");
  setValue("password", "");
  setValue("username", "");
  setValue("phone", "");
};

const roles: Record<string, RoleSelectorValues> = {
  CUSTOMER: {
    value: "I'm a Customer",
    icon: "user",
  },
  MERCHANT: {
    value: "I'm a Shop Owner",
    icon: "store",
  },
  DRIVER: {
    value: "I'm a Rider",
    icon: "driver",
  },
};

export default function SignupPage() {
  const toastCtx = useContext(ToastContext);
  const [userType, setUserType] = useState<RoleKeys>("CUSTOMER");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: "onTouched",
  });
  const { mutate } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toastCtx.setIsVisible(true);

      setTimeout(() => {
        toastCtx.setIsVisible(false);
        router.push("/");
      }, 800);
    },
    onError: (e) => {
      console.log("Error from service", e);
      const message = axios.isAxiosError(e)
        ? ((e.response?.data as any)?.detail ?? e.message)
        : e instanceof Error
          ? e.message
          : "Something went wrong";
      if (toastCtx.setToast)
        toastCtx.setToast({
          error: true,
          message: message,
        });

      toastCtx.setIsVisible(true);

      setTimeout(() => {
        toastCtx.setIsVisible(false);
      }, 1000);
    },
  });

  useEffect(() => {
    setEmpty(setValue);
    clearErrors([
      "email",
      "fullName",
      "confirmPassword",
      "password",
      "username",
      "phone",
      "idNumber",
      "vehicleType",
      "plateNumber",
      "licenseNumber",
      "vehicleColor",
    ]);
    setValue("role", userType);
  }, [userType]);
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    let payload: RegisterUserDTO = {
      full_name: data.fullName,
      user_name: data.username,
      password: data.password,
      email: data.email,
      phone: data.phone,
      role: userType,
    };

    if (data.role === "DRIVER") {
      payload = {
        ...payload,
        id_number: data.idNumber,
        vehicle_type: data.vehicleType,
        plate_number: data.plateNumber,
        license_number: data.licenseNumber,
        vehicle_color: data.vehicleColor,
      } as RegisterUserDTO;
    }

    console.log("Payload signup ====>", payload);
    await mutate(payload);
    setIsLoading(false);
  };

  const role = watch("role");

  const driverErrors =
    role === "DRIVER"
      ? (errors as FieldErrors<Extract<FormValues, { role: "DRIVER" }>>)
      : undefined;

  // return null;
  return (
    <>
      <div className="min-h-screen relative bg-slate-50 flex items-center justify-center p-4 py-12">
        <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 overflow-hidden border border-slate-100">
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
            <h1 className="text-2xl font-bold text-slate-900">
              Create Account
            </h1>
            <p className="text-slate-500 mt-1">
              Join the smart laundry revolution
            </p>
          </div>

          <div className="p-8">
            {/* User Type Toggle - Important for your ERD Mapping */}

            <RoleSelector
              values={roles}
              setType={(v) => setUserType(v)}
              currentValue={userType}
            />
            {/* <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
              <button
                onClick={() => setUserType("CUSTOMER")}
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all ${
                  userType === "CUSTOMER"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <User size={16} /> I'm a Customer
              </button>
              <button
                onClick={() => setUserType("MERCHANT")}
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all ${
                  userType === "MERCHANT"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Store size={16} /> I'm a Shop Owner
              </button>
            </div> */}

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Common Fields */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                  <input
                    {...register("fullName")}
                    type="text"
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none"
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-sm">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                  <input
                    {...register("username")}
                    type="text"
                    placeholder="Username"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none"
                  />
                  {errors.username && (
                    <p className="text-red-600 text-sm">
                      {errors.username.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                  Phone
                </label>
                <div className="relative">
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="+855 (96) 000-0000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-600 text-sm">{errors.phone.message}</p>
                )}
              </div>

              {/* Conditional Field: Address for Customer / Shop Name for Owner */}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                  <input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                  Confirm
                </label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none"
                />
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              {role === "DRIVER" && (
                <>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                      ID Number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                      <input
                        {...register("idNumber")}
                        type="text"
                        placeholder="Government ID Number"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none"
                      />
                    </div>
                    {driverErrors?.idNumber && (
                      <p className="text-red-600 text-sm">
                        {driverErrors.idNumber.message}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Truck size={16} /> Vehicle & License
                    </h3>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                        Vehicle Type
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <select
                            {...register("vehicleType")}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-500 transition-all text-slate-500 appearance-none"
                          >
                            <option value="">Select Vehicle Type</option>
                            <option value="motorcycle">
                              Motorcycle / Scooter
                            </option>
                            <option value="car">
                              Tuk Tuk / Three-wheeled Transportation
                            </option>
                            <option value="bicycle">E-Bike / Bicycle</option>
                          </select>
                          {driverErrors?.vehicleType && (
                            <p className="text-red-600 text-sm">
                              {driverErrors.vehicleType.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 space-y-2">
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                            Plate Number
                          </label>
                          <div className="relative">
                            <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                            <input
                              {...register("plateNumber")}
                              type="text"
                              placeholder="Plate Number"
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-500 transition-all"
                            />
                          </div>
                          {driverErrors?.plateNumber && (
                            <p className="text-red-600 text-sm">
                              {driverErrors.plateNumber.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                            License Number
                          </label>
                          <div className="relative">
                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                            <input
                              {...register("licenseNumber")}
                              type="text"
                              placeholder="License Number"
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-500 transition-all"
                            />
                          </div>
                          {driverErrors?.licenseNumber && (
                            <p className="text-red-600 text-sm">
                              {driverErrors.licenseNumber.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                        Vehicle color
                      </label>
                      <div className="relative">
                        <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                        <input
                          {...register("vehicleColor")}
                          type="text"
                          placeholder="Input your vehicle color"
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none"
                        />
                      </div>
                      {driverErrors?.vehicleColor && (
                        <p className="text-red-600 text-sm">
                          {driverErrors.vehicleColor.message}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100"
                >
                  Register as {userType}
                  <ArrowRight size={20} />
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                Already have an account?
                <Link
                  href="/auth/login"
                  className="text-blue-600 font-bold ml-1 hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
        {isLoading && <Loading />}
        {/* {isSuccess && (
          <NotifcationToast
            onClose={() => {
              setIsSuccess(false);
            }}
            error={true}
          />
        )} */}
      </div>

      {/* {isLoading && } */}
      {/* <Loading /> */}
    </>
  );
}
