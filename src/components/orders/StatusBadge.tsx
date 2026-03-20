interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-600",
  ACCEPTED: "bg-blue-100 text-blue-600",
  PICKED_UP: "bg-indigo-100 text-indigo-600",
  DELIVERED_TO_SHOP: "bg-cyan-100 text-cyan-700",
  WASHING: "bg-violet-100 text-violet-700",
  READY_FOR_DELIVERY: "bg-green-100 text-green-700",
  OUT_FOR_DELIVERY: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-slate-100 text-slate-500",
  CANCELLED: "bg-red-100 text-red-600",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = (status || "").toUpperCase();
  const label = normalizedStatus.replaceAll("_", " ");

  return (
    <span
      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[normalizedStatus] || "bg-slate-100 text-slate-500"}`}
    >
      {label || "UNKNOWN"}
    </span>
  );
}
