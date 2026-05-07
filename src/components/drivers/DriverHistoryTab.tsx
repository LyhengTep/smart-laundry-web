"use client";

import DriverHistoryTaskCard from "@/components/drivers/DriverHistoryTaskCard";
import { getDriverRevenue } from "@/services/driverService";
import { getDriverHistories } from "@/services/driverTaskService";
import { DriverAssignmentResponse, DriverTask } from "@/types/driverTask";
import { convertAssignmentToDriverTask } from "@/lib/objectMapper";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { useState } from "react";

const PAGE_SIZE = 5;

interface DriverHistoryTabProps {
  driverId: string;
}

export default function DriverHistoryTab({ driverId }: DriverHistoryTabProps) {
  const [page, setPage] = useState(1);

  const { data: revenue, isLoading: isRevenueLoading } = useQuery({
    queryKey: ["driver-revenue"],
    queryFn: getDriverRevenue,
  });

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["driver-history-tasks", driverId, page],
    queryFn: () => getDriverHistories(driverId, page, PAGE_SIZE),
    enabled: !!driverId,
  });

  const totalRevenue = revenue?.total_revenue ? parseFloat(revenue.total_revenue) : 0;
  const currency = revenue?.currency ?? "USD";

  const historyTasks: DriverTask[] = (historyData?.items ?? []).map(
    (task: DriverAssignmentResponse) => convertAssignmentToDriverTask(task),
  );
  const totalCount: number = historyData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 border border-white/5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
              Total Revenue
            </p>
            {isRevenueLoading ? (
              <div className="h-10 w-32 mt-1 bg-slate-700/50 rounded-xl animate-pulse" />
            ) : (
              <h2 className="text-4xl font-black text-white mt-1">
                ${totalRevenue.toFixed(2)}
                <span className="text-sm font-bold text-slate-500 ml-2">{currency}</span>
              </h2>
            )}
          </div>
          <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400">
            <Wallet size={24} />
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-slate-700/60 bg-slate-800/50 px-5 py-4 flex items-start gap-3">
          <div className="mt-0.5 shrink-0 w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
            <Wallet size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200 leading-snug">
              Online withdrawals are not available at this time.
            </p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              To withdraw your funds, please visit our office in person with a
              valid ID. Our team will be happy to assist you during business
              hours.
            </p>
          </div>
        </div>
      </div>

<div className="space-y-4">
        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 flex justify-between">
          Histories <span>{totalCount}</span>
        </h4>

        {isHistoryLoading ? (
          <div className="space-y-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="h-36 rounded-[2.5rem] bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : historyTasks.length > 0 ? (
          historyTasks.map((task) => (
            <DriverHistoryTaskCard key={task.id} task={task} />
          ))
        ) : (
          <p className="text-slate-500 text-center py-4">No history yet.</p>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 px-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isHistoryLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-800 border border-white/5 text-slate-400 text-xs font-bold disabled:opacity-30 hover:text-white hover:border-white/20 transition-all"
            >
              <ChevronLeft size={14} /> Prev
            </button>

            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isHistoryLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-800 border border-white/5 text-slate-400 text-xs font-bold disabled:opacity-30 hover:text-white hover:border-white/20 transition-all"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
