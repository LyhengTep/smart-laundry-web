"use client";

import { Clock, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useContext, useState } from "react";

import { DriverTable } from "@/components/DriverTable";
import { DialogCtx } from "@/contexts/DialogProvider";
import { useDrivers } from "@/hooks/drivers/driverHook";

// Mock Data representing your Driver table in the ERD
const INITIAL_DRIVERS = [
  {
    id: "DRV-001",
    name: "James Wilson",
    email: "james.w@delivery.com",
    vehicle: "Motorcycle",
    joinedAt: "2026-01-28",
    status: "Pending",
  },
  {
    id: "DRV-002",
    name: "Sarah Chen",
    email: "sarah.c@express.com",
    vehicle: "Car",
    joinedAt: "2026-01-30",
    status: "Pending",
  },
  {
    id: "DRV-003",
    name: "Mike Johnson",
    email: "mike.j@logistics.com",
    vehicle: "E-Bike",
    joinedAt: "2026-01-31",
    status: "Pending",
  },
];

export default function DriverApprovalPage() {
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [driverParams, setDriverParams] = useState({
    page: 1,
    size: 10,
    status: "INACTIVE",
  });
  const handleAction = (id: string, newStatus: "Approved" | "Rejected") => {
    setDrivers(drivers.filter((d) => d.id !== id));
    alert(`Driver ${id} has been ${newStatus}`);
  };

  const onPageChange = (page: number) => {
    setDriverParams({
      ...driverParams,
      page,
    });
  };

  const { data } = useDrivers(driverParams);
  const dialogCtx = useContext(DialogCtx);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Admin */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6">
        <div className="flex items-center gap-2 mb-10 text-blue-400 font-black text-xl">
          SmartWash{" "}
          <span className="text-white text-xs bg-slate-700 px-2 py-1 rounded">
            Admin
          </span>
        </div>
        <nav className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Management
          </div>
          <Link
            href="#"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition text-slate-400"
          >
            <User size={18} /> Customers
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-600 text-white transition"
          >
            <ShieldCheck size={18} /> Driver Approval
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition text-slate-400"
          >
            <Clock size={18} /> Order Logs
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900">
            Driver Applications
          </h1>
          <p className="text-slate-500">
            Review and verify driver registrations before they can accept
            orders.
          </p>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">
              Pending Review
            </p>
            <p className="text-3xl font-black text-slate-900 mt-1">
              {data?.total}
            </p>
          </div>
        </div>

        {/* Approval Table */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <DriverTable
            drivers={data?.items}
            page={data?.page}
            pages={data?.pages}
            total={data?.total}
            size={data?.size}
            onPageChange={onPageChange}
            onApprove={(id) => {
              dialogCtx.open();
            }}
          />

          {drivers.length === 0 && (
            <div className="p-20 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">
                All applications have been reviewed!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
