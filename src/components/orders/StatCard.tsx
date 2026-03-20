import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  trend: string;
  color: "blue" | "orange" | "green";
}

const COLORS: Record<"blue" | "orange" | "green", string> = {
  blue: "bg-blue-50 text-blue-600",
  orange: "bg-orange-50 text-orange-600",
  green: "bg-green-50 text-green-600",
};

export function StatCard({ icon, label, value, trend, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-[1.5rem] ${COLORS[color]}`}>{icon}</div>
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-slate-900">{value}</p>
        </div>
      </div>
      <span className={`text-xs font-black px-3 py-1 rounded-full ${COLORS[color]}`}>{trend}</span>
    </div>
  );
}
