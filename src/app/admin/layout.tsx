"use client";

import {
  Bike,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { notFound, usePathname } from "next/navigation";
import { useState } from "react";

import { useDrivers } from "@/hooks/drivers/driverHook";
import { getCurrentUser } from "@/services/authService";

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
  const { data } = useDrivers({ page: 1, size: 1, status: "INACTIVE" });
  const pendingCount = data?.total ?? 0;
  const [collapsed, setCollapsed] = useState(false);

  const user = getCurrentUser();

  if (user && user.role !== "ADMIN") {
    console.log("Current User in Admin Layout:", user);
    notFound();
  }
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside
        className={[
          "bg-slate-900 text-white p-6 transition-all duration-200",
          collapsed ? "md:w-20" : "md:w-64",
          "w-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2 text-blue-400 font-black text-xl">
            <span className={collapsed ? "sr-only" : ""}>SmartWash</span>
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
        <nav className="space-y-2">
          {!collapsed && (
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Management
            </div>
          )}
          <Link
            href="/admin/customers"
            className={navItemClass(pathname === "/admin/customers", collapsed)}
          >
            <User size={collapsed ? 26 : 18} />
            {!collapsed && <span>Customers</span>}
          </Link>
          <Link
            href="/admin/drivers"
            className={navItemClass(pathname === "/admin/drivers", collapsed)}
          >
            <Bike size={collapsed ? 26 : 18} />
            {!collapsed && <span>All Drivers</span>}
          </Link>
          <Link
            href="/admin/drivers/approval"
            className={navItemClass(
              pathname === "/admin/drivers/approval",
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
            href="#"
            className={navItemClass(pathname === "/admin/orders", collapsed)}
          >
            <Clock size={collapsed ? 26 : 18} />
            {!collapsed && <span>Order Logs</span>}
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
