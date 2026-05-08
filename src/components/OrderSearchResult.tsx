"use client";

import { OrderSearchResult } from "@/types/order";
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  MapPin,
  Package,
  X,
} from "lucide-react";

const STATUS_STEPS = [
  { key: "PENDING", label: "Order Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PICKUP_ASSIGNED", label: "Pickup Assigned" },
  { key: "OUT_FOR_PICKUP", label: "Out for Pickup" },
  { key: "PICKED_UP", label: "Picked Up" },
  { key: "DELIVERED_TO_SHOP", label: "At Laundry Shop" },
  { key: "PROCESSING", label: "Processing" },
  { key: "READY_FOR_DELIVERY", label: "Ready for Delivery" },
  { key: "DELIVERY_ASSIGNED", label: "Delivery Assigned" },
  { key: "PICKED_UP_DELIVERY", label: "Picked Up for Delivery" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

const CANCELLED_STEP = { key: "CANCELLED", label: "Cancelled" };

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  PICKUP_ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
  OUT_FOR_PICKUP: "bg-violet-100 text-violet-700 border-violet-200",
  PICKED_UP: "bg-violet-100 text-violet-700 border-violet-200",
  DELIVERED_TO_SHOP: "bg-indigo-100 text-indigo-700 border-indigo-200",
  PROCESSING: "bg-cyan-100 text-cyan-700 border-cyan-200",
  READY_FOR_DELIVERY: "bg-teal-100 text-teal-700 border-teal-200",
  DELIVERY_ASSIGNED: "bg-sky-100 text-sky-700 border-sky-200",
  PICKED_UP_DELIVERY: "bg-sky-100 text-sky-700 border-sky-200",
  OUT_FOR_DELIVERY: "bg-blue-100 text-blue-700 border-blue-200",
  DELIVERED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface OrderSearchResultCardProps {
  result: OrderSearchResult;
  onClick: () => void;
}

export function OrderSearchResultCard({
  result,
  onClick,
}: OrderSearchResultCardProps) {
  const statusStyle =
    STATUS_COLOR[result.status] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const totalItems = result.items.reduce((s, i) => s + i.quantity, 0);
  const serviceNames = result.items
    .slice(0, 2)
    .map((i) => i.service_name)
    .join(", ");

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4"
    >
      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl shrink-0">
        <Package size={22} className="text-blue-600 dark:text-blue-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-black text-slate-900 dark:text-slate-100 text-base">
            {result.order_no}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle}`}
          >
            {result.status.replace(/_/g, " ")}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
          {serviceNames}
          {result.items.length > 2 ? ` +${result.items.length - 2} more` : ""}{" "}
          &middot; {totalItems} item{totalItems !== 1 ? "s" : ""}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
          <Clock size={11} />
          Placed {formatDate(result.placed_at)}
        </p>
      </div>

      <ChevronRight size={18} className="text-slate-400 shrink-0" />
    </button>
  );
}

interface OrderTimelineDrawerProps {
  result: OrderSearchResult;
  onClose: () => void;
}

export function OrderTimelineDrawer({
  result,
  onClose,
}: OrderTimelineDrawerProps) {
  const isCancelled = result.status === "CANCELLED";
  const steps = isCancelled
    ? [...STATUS_STEPS.slice(0, 2), CANCELLED_STEP]
    : STATUS_STEPS;

  const currentIdx = steps.findIndex((s) => s.key === result.status);
  const statusStyle =
    STATUS_COLOR[result.status] ?? "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Order Tracking
            </p>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {result.order_no}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusStyle}`}>
              {result.status.replace(/_/g, " ")}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Addresses */}
          <div className="space-y-2">
            {result.pickup_address && (
              <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <MapPin size={15} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Pickup
                  </p>
                  <p>{result.pickup_address}</p>
                </div>
              </div>
            )}
            {result.delivery_address && (
              <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <MapPin size={15} className="text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Delivery
                  </p>
                  <p>{result.delivery_address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Status Timeline
            </p>
            <ol className="relative">
              {steps.map((step, idx) => {
                const isDone = currentIdx >= 0 && idx < currentIdx;
                const isCurrent = idx === currentIdx;
                const isUpcoming = currentIdx >= 0 && idx > currentIdx;
                const isLastStep = idx === steps.length - 1;

                return (
                  <li key={step.key} className="flex gap-4">
                    {/* Connector + icon column */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all ${
                          isCurrent
                            ? isCancelled
                              ? "bg-red-500 border-red-500 text-white"
                              : "bg-blue-600 border-blue-600 text-white"
                            : isDone
                            ? "bg-green-500 border-green-500 text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 size={14} />
                        ) : isCurrent ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        ) : (
                          <Circle size={10} />
                        )}
                      </div>
                      {!isLastStep && (
                        <div
                          className={`w-0.5 flex-1 my-1 min-h-[24px] ${
                            isDone ? "bg-green-400" : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div className={`pb-5 pt-1 ${isUpcoming ? "opacity-40" : ""}`}>
                      <p
                        className={`text-sm font-bold ${
                          isCurrent
                            ? isCancelled
                              ? "text-red-600"
                              : "text-blue-600"
                            : isDone
                            ? "text-green-600 dark:text-green-400"
                            : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          Updated {formatDate(result.updated_at)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Items */}
          {result.items.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Items
              </p>
              <div className="space-y-2">
                {result.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {item.service_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.quantity} {item.measure_type} &times; ${item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      ${item.sub_total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
