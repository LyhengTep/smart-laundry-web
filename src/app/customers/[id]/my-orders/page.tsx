"use client";

import CustomerOrderCard, {
  CustomerOrderTab,
} from "@/components/customers/orders/CustomerOrderCard";
import { DialogCtx } from "@/contexts/DialogProvider";
import { ToastContext } from "@/contexts/ToastProvider";
import { STORAGE_KEYS } from "@/config/common";
import { useLocalStorage } from "@/hooks/localStorage";
import { useOrders } from "@/hooks/orders/orderHook";
import { updateOrderStatus } from "@/services/orderService";
import { UserAuthResponse } from "@/types/auth";
import { LaundryOrder } from "@/types/order";
import { toToastMessage } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowLeft,
  History,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";

const HISTORY_STATUSES = new Set(["DELIVERED", "CANCELLED"]);
const CANCELLABLE_STATUSES = new Set([
  "PENDING",
  "CONFIRMED",
  "PICKUP_ASSIGNED",
  "OUT_FOR_PICKUP",
]);

export default function MyOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const dialogCtx = useContext(DialogCtx);
  const toastCtx = useContext(ToastContext);
  const { value: authUser } = useLocalStorage<UserAuthResponse>(
    STORAGE_KEYS.AUTH_USER,
    null,
  );
  const params = useParams<{ id: string }>();
  const customerId = String(params.id || "");
  const [activeTab, setActiveTab] = useState<CustomerOrderTab>("active");

  useEffect(() => {
    if (!authUser) {
      router.replace("/auth/login");
      return;
    }

    if (authUser.role === "MERCHANT") {
      router.replace("/businesses-admin");
      return;
    }

    if (authUser.role === "ADMIN") {
      router.replace("/admin/drivers");
      return;
    }

    if (authUser.role !== "CUSTOMER") {
      router.replace("/");
      return;
    }

    if (authUser.id !== customerId) {
      router.replace(`/customers/${authUser.id}/my-orders`);
    }
  }, [authUser, customerId, router]);

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
        "This action is available before pickup and cannot be undone.",
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
            {displayOrders.map((order) => (
              <CustomerOrderCard
                key={order.id}
                order={order}
                activeTab={activeTab}
                canCancel={CANCELLABLE_STATUSES.has(
                  (order.status || "").toUpperCase(),
                )}
                isCancelling={
                  cancelOrderMutation.isPending &&
                  cancelOrderMutation.variables === order.id
                }
                onCancel={handleCancelOrder}
              />
            ))}

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
