"use client";
import { APP_NAME } from "@/config/common";
import { ArrowRight, Lock, Mail, Wind } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
export default function LoginPage() {
  const [role, setRole] = useState("Customer");

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
            Sign in to your {role} account
          </p>
        </div>

        <div className="p-8">
          {/* Role Segmented Control */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            {["Customer", "Shop Owner", "Driver"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  role === r
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
              <input
                type="email"
                placeholder="Email/Username"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 ring-blue-500"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 ring-blue-500"
              />
            </div>
            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all">
              Login as {role} <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
