"use client";

import { APP_NAME } from "@/config/common";
import {
  ArrowRight,
  Lock,
  Mail,
  MapPin,
  Store,
  User,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [userType, setUserType] = useState<"Customer" | "ShopOwner">(
    "Customer"
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
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
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-1">
            Join the smart laundry revolution
          </p>
        </div>

        <div className="p-8">
          {/* User Type Toggle - Important for your ERD Mapping */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            <button
              onClick={() => setUserType("Customer")}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all ${
                userType === "Customer"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <User size={16} /> I'm a Customer
            </button>
            <button
              onClick={() => setUserType("ShopOwner")}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all ${
                userType === "ShopOwner"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Store size={16} /> I'm a Shop Owner
            </button>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Common Fields */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                Phone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Conditional Field: Address for Customer / Shop Name for Owner */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                {userType === "Customer"
                  ? "Delivery Address"
                  : "Laundry Shop Name"}
              </label>
              <div className="relative">
                {userType === "Customer" ? (
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                ) : (
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                )}
                <input
                  type="text"
                  placeholder={
                    userType === "Customer"
                      ? "Dorm Room or Street Address"
                      : "e.g. Clean & Bright Laundry"
                  }
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                Confirm
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2 pt-4">
              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100">
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
    </div>
  );
}
