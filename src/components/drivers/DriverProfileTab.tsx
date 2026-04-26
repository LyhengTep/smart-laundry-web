"use client";

import { UserAuthResponse } from "@/types/auth";
import { formatDateUTC7 } from "@/utils/date";
import {
  Calendar,
  Car,
  CreditCard,
  FileText,
  LogOut,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";

interface DriverProfileTabProps {
  authUser: UserAuthResponse | null;
  onLogout: () => void;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-white/5 last:border-0">
      <div className="w-9 h-9 shrink-0 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-200 mt-1 truncate">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-6">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
        {title}
      </p>
      {children}
    </div>
  );
}

export default function DriverProfileTab({
  authUser,
  onLogout,
}: DriverProfileTabProps) {
  const driver = authUser?.driver;
  const initials = authUser?.full_name
    ? authUser.full_name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "DR";

  const statusColor =
    authUser?.status === "ACTIVE"
      ? "bg-green-500/15 text-green-400 border-green-500/20"
      : "bg-slate-700/50 text-slate-400 border-slate-600/30";

  return (
    <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
      {/* Avatar & Name Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 border border-white/5">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-500/20">
              <span className="text-2xl font-black text-white">{initials}</span>
            </div>
            <span
              className={`absolute -bottom-1.5 -right-1.5 text-[9px] font-black uppercase tracking-wider border px-2 py-0.5 rounded-full ${statusColor}`}
            >
              {authUser?.status ?? "—"}
            </span>
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-black text-white truncate">
              {authUser?.full_name || "Driver"}
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-0.5">
              @{authUser?.user_name || "—"}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <Shield size={11} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                {authUser?.role || "Driver"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <SectionCard title="Personal Info">
        <InfoRow
          icon={<Mail size={15} />}
          label="Email"
          value={authUser?.email}
        />
        <InfoRow
          icon={<Phone size={15} />}
          label="Phone"
          value={authUser?.phone}
        />
        <InfoRow
          icon={<User size={15} />}
          label="Username"
          value={authUser?.user_name}
        />
        <InfoRow
          icon={<Calendar size={15} />}
          label="Member Since"
          value={authUser?.created_at ? formatDateUTC7(authUser.created_at) : "—"}
        />
      </SectionCard>

      {/* Vehicle Info */}
      <SectionCard title="Vehicle">
        <InfoRow
          icon={<Car size={15} />}
          label="Vehicle Type"
          value={driver?.vehicle_type}
        />
        <InfoRow
          icon={<Car size={15} />}
          label="Vehicle Color"
          value={driver?.vehicle_color}
        />
        <InfoRow
          icon={<CreditCard size={15} />}
          label="Plate Number"
          value={driver?.plate_number}
        />
      </SectionCard>

      {/* Documents */}
      <SectionCard title="Documents">
        <InfoRow
          icon={<FileText size={15} />}
          label="ID Card Number"
          value={driver?.id_card_number}
        />
        <InfoRow
          icon={<FileText size={15} />}
          label="License Number"
          value={driver?.license_number}
        />
      </SectionCard>

      {/* Logout */}
      <button
        type="button"
        onClick={onLogout}
        className="w-full py-4 flex items-center justify-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 font-black rounded-[2rem] hover:bg-red-500/20 hover:text-red-300 transition-all active:scale-95"
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
}
