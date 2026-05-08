import { CheckCircle2, XCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";
interface OrderStatusPillProps {
  status: string;
  className?: string;
}

const mapStatusLabel = (status: string) => {
  if (status === "DELIVERED") return "DONE";
  return status;
};

export default function OrderStatusPill({
  status,
  className,
}: OrderStatusPillProps) {
  const styles: Record<string, string> = {
    PENDING: "bg-orange-50 text-orange-600 border-orange-100",
    CONFIRMED: "bg-blue-50 text-blue-600 border-blue-100",
    PICKUP_ASSIGNED: "bg-sky-50 text-sky-700 border-sky-100",
    OUT_FOR_PICKUP: "bg-cyan-50 text-cyan-700 border-cyan-100",
    PICKED_UP: "bg-indigo-50 text-indigo-600 border-indigo-100",
    DELIVERED_TO_SHOP: "bg-teal-50 text-teal-700 border-teal-100",
    PROCESSING: "bg-violet-50 text-violet-700 border-violet-100",
    READY_FOR_DELIVERY: "bg-green-50 text-green-600 border-green-100",
    DELIVERY_ASSIGNED: "bg-lime-50 text-lime-700 border-lime-100",
    PICKED_UP_DELIVERY: "bg-yellow-50 text-yellow-700 border-yellow-100",
    OUT_FOR_DELIVERY: "bg-emerald-50 text-emerald-600 border-emerald-100",
    DONE: "bg-green-50 text-green-600 border-green-100",
    DELIVERED: "bg-green-50 text-green-600 border-green-100",
    CANCELLED: "bg-slate-50 text-slate-400 border-slate-200",
  };

  const normalized = mapStatusLabel((status || "").toUpperCase());
  const Icon =
    normalized === "DONE"
      ? CheckCircle2
      : normalized === "CANCELLED"
        ? XCircle
        : null;

  return (
    <span
      className={twMerge(
        `px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest flex items-center gap-1.5 ${styles[normalized] || "bg-slate-50 text-slate-500 border-slate-200"}`,
        className,
      )}
    >
      {Icon && <Icon size={12} />}
      {normalized.replaceAll("_", " ")}
    </span>
  );
}
