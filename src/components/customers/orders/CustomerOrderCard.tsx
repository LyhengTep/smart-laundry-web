import { LaundryOrder } from "@/types/order";
import {
  ChevronRight,
  CreditCard,
  Package,
  RotateCcw,
  XCircle,
} from "lucide-react";
import OrderStatusPill from "./OrderStatusPill";

export type CustomerOrderTab = "active" | "history";

interface CustomerOrderCardProps {
  order: LaundryOrder;
  activeTab: CustomerOrderTab;
  canCancel: boolean;
  isCancelling: boolean;
  onCancel: (order: LaundryOrder) => void;
}

const formatMoney = (value?: number) => {
  if (typeof value !== "number") return "Pending weight...";
  return `$${value.toFixed(2)}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (value?: string | null) => {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

const isPendingPrice = (order: LaundryOrder) => {
  return (
    order.status === "PENDING" ||
    (typeof order.total === "number" && order.total === 0)
  );
};

export default function CustomerOrderCard({
  order,
  activeTab,
  canCancel,
  isCancelling,
  onCancel,
}: CustomerOrderCardProps) {
  const services = (order.items || []).map((item) => item.service_name);
  const pendingPrice = isPendingPrice(order);
  const needsPayment = !pendingPrice && order.status === "READY_FOR_DELIVERY";
  const effectiveDate =
    activeTab === "history"
      ? formatDate(order.updated_at || order.created_at)
      : null;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:border-blue-100 transition-all">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          {/* <div className="flex-[4] bg-blue-500 text-white p-4 rounded">
              Box 1 (bigger)
            </div>

            <div className="flex-[1] bg-green-500 text-white p-4 rounded">
              Box 2 (smaller)
            </div> */}
          <div className="flex flex-[2] gap-4 min-w-0">
            <div
              className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-colors ${
                activeTab === "history"
                  ? "bg-slate-100 text-slate-400"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              <Package size={24} />
            </div>
            <div className="min-w-0 ">
              <h2 className="font-blackbreak-words text-[10px] md:text-lg text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                {order.order_no}
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>{`SHOP ${order.business_id.slice(0, 8)}`}</span>
                {activeTab === "history" && <span>• {effectiveDate}</span>}
              </div>
            </div>
          </div>
          <OrderStatusPill
            status={order.status}
            className="text-[6px] md:text-[10px] shrink-0"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {services.length > 0 ? (
            services.map((service, i) => (
              <span
                key={`${order.id}-${service}-${i}`}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                  activeTab === "history"
                    ? "bg-slate-50 text-slate-400 border border-slate-100"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {service}
              </span>
            ))
          ) : (
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight bg-slate-50 text-slate-400 border border-slate-100">
              No services
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              Amount
            </p>
            <div className="flex items-baseline gap-2">
              <p
                className={`text-xl font-black ${pendingPrice ? "text-slate-300 italic text-sm" : "text-slate-900"}`}
              >
                {pendingPrice ? "Pending weight..." : formatMoney(order.total)}
              </p>
            </div>
          </div>

          {activeTab === "active" ? (
            needsPayment ? (
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
                <CreditCard size={16} /> Pay Now
              </button>
            ) : canCancel ? (
              <button
                type="button"
                onClick={() => onCancel(order)}
                disabled={isCancelling}
                className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 font-black text-xs rounded-2xl hover:bg-red-100 disabled:opacity-60 transition-all"
              >
                <XCircle size={14} />
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold bg-slate-50 px-3 py-2 rounded-xl">
                {formatTime(order.updated_at)} <ChevronRight size={14} />
              </div>
            )
          ) : (
            <button className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 font-black text-xs rounded-2xl hover:bg-blue-600 hover:text-white transition-all group/btn">
              <RotateCcw
                size={14}
                className="group-hover/btn:rotate-[-45deg] transition-transform"
              />
              Reorder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
