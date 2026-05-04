"use client";

import {
  Bike,
  ChevronLeft,
  ChevronRight,
  Clock,
  LogOut,
  ShieldCheck,
  Store,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { STORAGE_KEYS } from "@/config/common";
import { useDrivers } from "@/hooks/drivers/driverHook";
import { useLocalStorage } from "@/hooks/localStorage";
import {
  clearAuthSession,
  getCurrentUser,
  logout,
} from "@/services/authService";
import { UserAuthResponse } from "@/types/auth";

const navItemClass = (active: boolean, collapsed: boolean) =>
  [
    "flex items-center gap-3 p-3 rounded-xl transition",
    collapsed ? "justify-center relative" : "",
    active ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400",
  ].join(" ");

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useDrivers({ page: 1, size: 1, status: "INACTIVE" });
  const pendingCount = data?.total ?? 0;
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const { value, setValue } = useLocalStorage<UserAuthResponse | null>(
    STORAGE_KEYS.AUTH_USER,
    null,
  );

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setReady(true);
      return;
    }
    const user = getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      router.replace("/admin/login");
    } else {
      setReady(true);
    }
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    try {
      if (value?.id && value?.role) {
        await logout({ user_id: value.id, role: value.role });
      }
    } catch {
      // continue regardless of API error
    } finally {
      clearAuthSession();
      setValue(null);
      router.replace("/admin/login");
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside
        className={[
          "bg-slate-900 text-white flex flex-col transition-all duration-200",
          "md:sticky md:top-0 md:h-screen md:overflow-y-auto",
          collapsed ? "md:w-20" : "md:w-64",
          "w-full",
        ].join(" ")}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-6 mb-4">
          <div className="flex items-center gap-2 text-blue-400 font-black text-xl">
            <span className={collapsed ? "sr-only" : ""}>Smart Laundry</span>
            {!collapsed && (
              <span className="text-white text-xs bg-slate-700 px-2 py-1 rounded">
                Admin
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="hidden md:inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 space-y-2">
          {!collapsed && (
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Management
            </div>
          )}
          <Link
            href="/admin/customers"
            className={navItemClass(pathname.startsWith("/admin/customers"), collapsed)}
          >
            <User size={collapsed ? 26 : 18} />
            {!collapsed && <span>Customers</span>}
          </Link>
          <Link
            href="/admin/merchants"
            className={navItemClass(pathname.startsWith("/admin/merchants"), collapsed)}
          >
            <Store size={collapsed ? 26 : 18} />
            {!collapsed && <span>Merchants</span>}
          </Link>
          <Link
            href="/admin/drivers"
            className={navItemClass(
              pathname === "/admin/drivers" ||
              (pathname.startsWith("/admin/drivers") && !pathname.startsWith("/admin/drivers/approval")),
              collapsed,
            )}
          >
            <Bike size={collapsed ? 26 : 18} />
            {!collapsed && <span>All Drivers</span>}
          </Link>
          <Link
            href="/admin/drivers/approval"
            className={navItemClass(
              pathname.startsWith("/admin/drivers/approval"),
              collapsed,
            )}
          >
            <ShieldCheck size={collapsed ? 26 : 18} />
            {!collapsed && <span>Driver Approval</span>}
            {pendingCount > 0 && (
              <span
                className={
                  collapsed
                    ? "absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-400"
                    : "ml-auto text-xs font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full"
                }
              >
                {!collapsed ? pendingCount : null}
              </span>
            )}
          </Link>
          <Link
            href="/admin/orders"
            className={navItemClass(pathname.startsWith("/admin/orders"), collapsed)}
          >
            <Clock size={collapsed ? 26 : 18} />
            {!collapsed && <span>Order Logs</span>}
          </Link>
          <Link
            href="/admin/admins/new"
            className={navItemClass(pathname.startsWith("/admin/admins"), collapsed)}
          >
            <UserPlus size={collapsed ? 26 : 18} />
            {!collapsed && <span>Register Admin</span>}
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-4 mt-auto border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className={[
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm font-medium",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <LogOut size={18} />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
