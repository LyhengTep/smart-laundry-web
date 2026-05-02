"use client";

import Navbar from "@/components/Navbar";
import { NavDrawer } from "@/components/NavDrawer";
import { STORAGE_KEYS } from "@/config/common";
import { useLocalStorage } from "@/hooks/localStorage";
import { clearAuthSession, logout } from "@/services/authService";
import { UserAuthResponse } from "@/types/auth";
import {
  Calendar,
  LogOut,
  Mail,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const active = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
        active
          ? "bg-green-100 text-green-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-slate-400"}`}
      />
      {status}
    </span>
  );
};

export default function CustomerProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { value: authUser, setValue: setAuthUser } =
    useLocalStorage<UserAuthResponse | null>(STORAGE_KEYS.AUTH_USER, null);

  useEffect(() => {
    if (!authUser) {
      router.replace("/auth/login");
      return;
    }
    if (authUser.role !== "CUSTOMER" || authUser.id !== params.id) {
      router.replace("/");
    }
  }, [authUser, params.id, router]);

  const handleLogout = async () => {
    try {
      if (authUser?.id && authUser?.role) {
        await logout({ user_id: authUser.id, role: authUser.role });
      }
    } catch {
      // ignore
    } finally {
      clearAuthSession();
      setAuthUser(null);
      router.replace("/auth/login");
    }
  };

  if (!authUser) return null;

  const initials = authUser.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar
        user={authUser}
        onLogout={handleLogout}
        onDrawerClick={() => setIsDrawerOpen(true)}
      />
      <NavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={authUser}
        onLogout={handleLogout}
        onActionClick={(key) => {
          setIsDrawerOpen(false);
          if (key === "MY_ORDER")
            router.push(`/customers/${authUser.id}/my-orders`);
          if (key === "MY_PROFILE")
            router.push(`/customers/${authUser.id}/profile`);
        }}
      />

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Profile hero card */}
        <div className="relative rounded-3xl overflow-hidden shadow-sm">
          {/* Banner */}
          <div className="h-36 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 relative">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {/* Status badge pinned top-right inside banner */}
            <div className="absolute top-4 right-4">
              <StatusBadge status={authUser.status} />
            </div>
          </div>

          {/* White card below banner */}
          <div className="bg-white dark:bg-slate-900 border border-t-0 border-slate-200 dark:border-white/5 px-6 pt-14 pb-6 rounded-b-3xl">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {authUser.full_name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              @{authUser.user_name}
            </p>
          </div>

          {/* Avatar — absolutely positioned so it straddles the border */}
          <div className="absolute left-6 top-[88px] w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center">
            <span className="text-2xl font-black text-white">{initials}</span>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 p-6 shadow-sm space-y-5">
          <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            Account Details
          </h2>

          <InfoRow
            icon={<Mail size={18} />}
            label="Email"
            value={authUser.email}
          />
          <InfoRow
            icon={<Phone size={18} />}
            label="Phone"
            value={authUser.phone || "Not set"}
          />
          <InfoRow
            icon={<User size={18} />}
            label="Role"
            value={authUser.role}
          />
          <InfoRow
            icon={<Calendar size={18} />}
            label="Member since"
            value={formatDate(authUser.created_at)}
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => router.push(`/customers/${authUser.id}/my-orders`)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 flex flex-col items-start gap-3 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
          >
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
              <ShoppingBag size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-slate-800 dark:text-white">
                My Orders
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                View order history
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 flex flex-col items-start gap-3 shadow-sm hover:shadow-md hover:border-red-300 dark:hover:border-red-700 transition-all group"
          >
            <div className="p-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-500 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
              <LogOut size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-slate-800 dark:text-white">
                Log Out
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Sign out safely</p>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-4">
    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">
        {value}
      </p>
    </div>
  </div>
);
