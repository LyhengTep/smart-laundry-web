"use client";

import { UserAuthResponse } from "@/types/auth";
import { User } from "lucide-react";
import Link from "next/link";

interface NavProps {
  user?: UserAuthResponse | null;
  onLogout?: () => void;
}
export default function Navbar(props: NavProps) {
  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              Smart Laundry
            </span>
          </Link>
          <div className="hidden md:flex space-x-8 text-slate-600 font-medium">
            <Link href="#shops" className="hover:text-blue-600 transition">
              Browse Shops
            </Link>
            <Link href="/orders" className="hover:text-blue-600 transition">
              My Orders
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {props.user ? (
              <>
                <Link
                  href="/user/profile"
                  className="flex text-slate-600 font-medium hover:text-blue-600 transition"
                >
                  <User className="mx-1" />
                  My Profile
                </Link>
                <button
                  onClick={props?.onLogout}
                  className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition shadow-lg shadow-red-100 font-semibold"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-slate-600 font-medium hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-100 font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
