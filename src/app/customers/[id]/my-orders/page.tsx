"use client";

import { DialogCtx } from "@/contexts/DialogProvider";
import { ToastContext } from "@/contexts/ToastProvider";
import { useOrders } from "@/hooks/orders/orderHook";
import { updateOrderStatus } from "@/services/orderService";
import { LaundryOrder } from "@/types/order";
import { toToastMessage } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  History,
  Package,
  RotateCcw,
  ShoppingBag,
  XCircle,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useContext, useMemo, useState } from "react";

type OrderTab = "active" | "history";

const HISTORY_STATUSES = new Set(["COMPLETED", "CANCELLED"]);

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

const mapStatusLabel = (status: string) => {
  if (status === "COMPLETED") return "DONE";
  return status;
};

export default function MyOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const dialogCtx = useContext(DialogCtx);
  const toastCtx = useContext(ToastContext);
  const params = useParams<{ id: string }>();
  const customerId = String(params.id || "");
  const [activeTab, setActiveTab] = useState<OrderTab>("active");

  const queryParams = useMemo(
    () => ({
      customer_id: customerId,
      page: 1,
      size: 50,
    }),
    [customerId],
  );

  const { data, isLoading, isError } = useOrders(queryParams);
  const orders = useMemo(() => data?.items || [], [data?.items]);

  const activeOrders = useMemo(
    () => orders.filter((order) => !HISTORY_STATUSES.has(order.status)),
    [orders],
  );
  const historyOrders = useMemo(
    () => orders.filter((order) => HISTORY_STATUSES.has(order.status)),
    [orders],
  );
  const displayOrders = activeTab === "active" ? activeOrders : historyOrders;

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) =>
      updateOrderStatus(orderId, { status: "CANCELLED" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
        refetchType: "active",
      });
      toastCtx?.setToast?.({
        error: false,
        message: "Order cancelled successfully.",
      });
      toastCtx?.setIsVisible(true);
    },
    onError: (e) => {
      const detail = axios.isAxiosError(e)
        ? ((e.response?.data as { detail?: unknown })?.detail ?? e.message)
        : e instanceof Error
          ? e.message
          : "Failed to cancel order.";
      toastCtx?.setToast?.({
        error: true,
        message: toToastMessage(detail),
      });
      toastCtx?.setIsVisible(true);
    },
  });

  const handleCancelOrder = (order: LaundryOrder) => {
    dialogCtx.open({
      title: "Cancel this order?",
      description:
        "This action is only available while order is pending and cannot be undone.",
      confirmLabel: "Yes, Cancel",
      tone: "danger",
      onConfirm: () => cancelOrderMutation.mutate(order.id),
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <nav className="bg-white border-b border-slate-100 p-6 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-50 rounded-xl transition-all"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              My Orders
            </h1>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-[1.5rem] w-full max-w-sm mx-auto">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all ${
              activeTab === "active"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Zap size={16} /> Active
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all ${
              activeTab === "history"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <History size={16} /> History
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-20">
            <ShoppingBag size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="font-bold text-slate-400">Loading orders...</p>
          </div>
        )}

        {isError && (
          <div className="rounded-3xl bg-red-50 border border-red-100 p-5 text-red-700 font-semibold text-sm">
            Failed to load orders. Please try again.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-4">
            {displayOrders.map((order) => {
              const services = (order.items || []).map((item) => item.service_name);
              const pendingPrice = isPendingPrice(order);
              const needsPayment = !pendingPrice && order.status === "READY_FOR_DELIVERY";
              const effectiveDate =
                activeTab === "history"
                  ? formatDate(order.updated_at || order.created_at)
                  : null;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:border-blue-100 transition-all"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                            activeTab === "history"
                              ? "bg-slate-100 text-slate-400"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          <Package size={24} />
                        </div>
                        <div>
                          <h2 className="font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                            {order.order_no}
                          </h2>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>{`SHOP ${order.business_id.slice(0, 8)}`}</span>
                            {activeTab === "history" && <span>• {effectiveDate}</span>}
                          </div>
                        </div>
                      </div>
                      <StatusPill status={order.status} />
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
                        ) : order.status === "PENDING" ? (
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order)}
                            disabled={
                              cancelOrderMutation.isPending &&
                              cancelOrderMutation.variables === order.id
                            }
                            className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 font-black text-xs rounded-2xl hover:bg-red-100 disabled:opacity-60 transition-all"
                          >
                            <XCircle size={14} />
                            {cancelOrderMutation.isPending &&
                            cancelOrderMutation.variables === order.id
                              ? "Cancelling..."
                              : "Cancel Order"}
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
            })}

            {displayOrders.length === 0 && (
              <div className="text-center py-20">
                <ShoppingBag size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="font-bold text-slate-400">
                  No {activeTab} orders found.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const StatusPill = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PENDING: "bg-orange-50 text-orange-600 border-orange-100",
    ACCEPTED: "bg-blue-50 text-blue-600 border-blue-100",
    PICKED_UP: "bg-indigo-50 text-indigo-600 border-indigo-100",
    DELIVERED_TO_SHOP: "bg-cyan-50 text-cyan-700 border-cyan-100",
    WASHING: "bg-violet-50 text-violet-700 border-violet-100",
    READY_FOR_DELIVERY: "bg-green-50 text-green-600 border-green-100",
    OUT_FOR_DELIVERY: "bg-emerald-50 text-emerald-600 border-emerald-100",
    DONE: "bg-green-50 text-green-600 border-green-100",
    COMPLETED: "bg-green-50 text-green-600 border-green-100",
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
      className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest flex items-center gap-1.5 ${styles[normalized] || "bg-slate-50 text-slate-500 border-slate-200"}`}
    >
      {Icon && <Icon size={12} />}
      {normalized.replaceAll("_", " ")}
    </span>
  );
};
