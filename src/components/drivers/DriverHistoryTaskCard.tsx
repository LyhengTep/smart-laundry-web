"use client";

import { DriverTask } from "@/types/driverTask";
import { formatDateUTC7 } from "@/utils/date";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";

export default function DriverHistoryTaskCard({ task }: { task: DriverTask }) {
  const historyItem = {
    id: "ORD-77291",
    customer: "Sophia Loren",
    type: "DROPOFF",
    payout: 8.4,
    tips: 2.0,
    distance: "4.2 km",
    duration: "14 mins",
    date: "Oct 24, 2026 • 02:15 PM",
    shop: "Bubbles & Suds Premium",
  };

  return (
    <div className="group relative overflow-hidden bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-1 transition-all hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10">
      {/* Inner Container for Glass Effect */}
      <div className="bg-slate-900 rounded-[2.3rem] p-6">
        {/* Top Row: Meta Info */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                {task.status}
              </p>
              <h4 className="text-sm font-bold text-slate-300 mt-1">
                {task?.order?.order_no}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Payout
            </p>
            <div className="flex items-center gap-1 justify-end">
              <span className="text-xl font-black text-white">
                ${(historyItem.payout + historyItem.tips).toFixed(2)}
              </span>
              <ArrowUpRight size={14} className="text-green-400" />
            </div>
          </div>
        </div>

        {/* Middle Section: Route Info */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
              Customer
            </p>
            <p className="text-sm font-bold text-white truncate">
              {task?.order?.customer?.full_name}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
              Service Shop
            </p>
            <p className="text-sm font-bold text-blue-400 truncate">
              {task?.business?.name}
            </p>
          </div>
        </div>

        {/* Bottom Section: Stats & Date */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-slate-500" />
              <span className="text-[11px] font-bold text-slate-400">
                {historyItem.duration}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-slate-500" />
              <span className="text-[11px] font-bold text-slate-400">
                {historyItem.distance}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <Calendar size={12} />
            <span className="text-[11px] font-bold">
              {formatDateUTC7(task?.order?.placed_at)}
            </span>
          </div>
        </div>

        {/* Hover Action (Subtle) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
          <ChevronRight className="text-blue-500" size={24} />
        </div>
      </div>

      {/* Decorative Gradient Glow (Behind Card) */}
      <div className="absolute -z-10 inset-0 bg-gradient-to-br from-blue-600/0 via-transparent to-blue-600/0 group-hover:from-blue-600/10 transition-all duration-500" />
    </div>
  );
}
