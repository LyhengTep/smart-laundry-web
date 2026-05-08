"use client";

import { ListingPagination } from "@/components/ListingPagination";
import { OrderDetailDrawer } from "@/components/orders/OrderDetailDrawer";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { OrderItem } from "@/components/orders/types";
import { ToastContext } from "@/contexts/ToastProvider";
import { useOrders } from "@/hooks/orders/orderHook";
import { updateOrderPricing, updateOrderStatus } from "@/services/orderService";
import { LaundryOrder, UpdateOrderPricingRequest } from "@/types/order";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Filter, Search, X } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";

const ALL_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PICKUP_ASSIGNED",
  "OUT_FOR_PICKUP",
  "PICKED_UP",
  "DELIVERED_TO_SHOP",
  "PROCESSING",
  "READY_FOR_DELIVERY",
  "DELIVERY_ASSIGNED",
  "PICKED_UP_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

function toOrderItem(order: LaundryOrder): OrderItem {
  const firstItem = order.items?.[0];
  return {
    orderId: order.id,
    id: order.order_no,
    customer: order.customer?.full_name || order.customer_id,
    service: firstItem?.service_name || `${order.items?.length ?? 0} services`,
    weight: firstItem ? `${firstItem.quantity} ${firstItem.measure_type}` : "-",
    price: `$${order.subtotal.toFixed(2)}`,
    status: order.status,
    pickupAt: order.scheduled_pickup_at
      ? new Date(order.scheduled_pickup_at).toLocaleString()
      : "-",
    dropoffAt: order.scheduled_dropoff_at
      ? new Date(order.scheduled_dropoff_at).toLocaleString()
      : "-",
    pickupAddress: order.pickup_address || "",
    deliveryAddress: order.delivery_address || "",
    notes: order.notes || "",
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    pickupFee: order.pickup_fee ?? null,
    deliveryFee: order.delivery_fee ?? null,
    lineItems: (order.items || []).map((item) => ({
      id: item.id,
      serviceName: item.service_name,
      pricingType: item.pricing_type,
      measureType: item.measure_type,
      unitPrice: item.unit_price,
      quantity: item.quantity,
      subTotal: item.sub_total,
      note: item.note,
    })),
  };
}

export default function AdminOrdersPage() {
  const toastCtx = useContext(ToastContext);
  const queryClient = useQueryClient();

  const [orderNo, setOrderNo] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // debounced values
  const [dOrderNo, setDOrderNo] = useState("");
  const [dCustomerId, setDCustomerId] = useState("");
  const [dBusinessId, setDBusinessId] = useState("");

  useEffect(() => {
    const t = setTimeout(() => { setDOrderNo(orderNo.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [orderNo]);

  useEffect(() => {
    const t = setTimeout(() => { setDCustomerId(customerId.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [customerId]);

  useEffect(() => {
    const t = setTimeout(() => { setDBusinessId(businessId.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [businessId]);

  useEffect(() => { setPage(1); }, [statusFilter]);

  const queryParams = useMemo(() => ({
    ...(dOrderNo && { order_no: dOrderNo }),
    ...(dCustomerId && { customer_id: dCustomerId }),
    ...(dBusinessId && { business_id: dBusinessId }),
    ...(statusFilter && { status: statusFilter }),
    page,
    size: 15,
  }), [dOrderNo, dCustomerId, dBusinessId, statusFilter, page]);

  const { data, isLoading } = useOrders(queryParams, true);

  const orders = useMemo(() => (data?.items || []).map(toOrderItem), [data?.items]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, { status }),
    onSuccess: async (_, vars) => {
      await queryClient.invalidateQueries({ queryKey: ["orders"], refetchType: "active" });
      setSelectedOrder((prev) =>
        prev?.orderId === vars.orderId ? { ...prev, status: vars.status } : prev,
      );
      toastCtx?.setToast?.({ error: false, message: "Order status updated." });
      toastCtx?.setIsVisible(true);
    },
    onError: () => {
      toastCtx?.setToast?.({ error: true, message: "Failed to update order status." });
      toastCtx?.setIsVisible(true);
    },
  });

  const updatePricingMutation = useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: UpdateOrderPricingRequest }) =>
      updateOrderPricing(orderId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"], refetchType: "active" });
      toastCtx?.setToast?.({ error: false, message: "Order pricing recalculated." });
      toastCtx?.setIsVisible(true);
    },
    onError: () => {
      toastCtx?.setToast?.({ error: true, message: "Failed to recalculate pricing." });
      toastCtx?.setIsVisible(true);
    },
  });

  const hasFilters = orderNo || customerId || businessId || statusFilter;

  const clearFilters = () => {
    setOrderNo("");
    setCustomerId("");
    setBusinessId("");
    setStatusFilter("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Order Logs</h1>
          <p className="text-slate-500 text-sm mt-1">
            {data ? `${data.total} total orders` : "Loading…"}
          </p>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-2 rounded-xl transition"
          >
            <X size={13} /> Clear filters
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Order No */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              placeholder="Order No"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition"
            />
          </div>

          {/* Customer ID */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Customer ID"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition"
            />
          </div>

          {/* Business ID */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="Business ID"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition"
            />
          </div>

          {/* Status */}
          <div className="relative">
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition appearance-none"
            >
              <option value="">All Statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-slate-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5 animate-pulse">
                <div className="h-4 bg-slate-100 rounded-full w-28" />
                <div className="h-4 bg-slate-100 rounded-full w-40 flex-1" />
                <div className="h-4 bg-slate-100 rounded-full w-24" />
                <div className="h-6 bg-slate-100 rounded-full w-28" />
                <div className="h-4 bg-slate-100 rounded-full w-16" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-medium text-sm">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/60">
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Order No
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Business
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Total
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Placed
                  </th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order, idx) => {
                  const raw = data!.items[idx];
                  return (
                    <tr
                      key={order.orderId}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-900 text-sm">{order.id}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {order.orderId.slice(0, 8)}…
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-700">{order.customer}</p>
                        <p className="text-xs text-slate-400 font-mono">
                          {raw.customer_id.slice(0, 8)}…
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-700">
                          {raw.business?.name || "—"}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {raw.business_id.slice(0, 8)}…
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-5 font-black text-slate-900 text-sm">
                        ${raw.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500">
                        {new Date(raw.placed_at).toLocaleDateString()}{" "}
                        <span className="text-slate-400 text-xs">
                          {new Date(raw.placed_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <ArrowUpRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {(data?.pages ?? 0) > 1 && (
        <ListingPagination
          currentPage={page}
          pages={data!.pages}
          onBackward={() => setPage((p) => Math.max(p - 1, 1))}
          onForward={() => setPage((p) => Math.min(p + 1, data!.pages))}
          onPageClick={(p: number) => { if (!isNaN(Number(p))) setPage(Number(p)); }}
        />
      )}

      {/* Detail drawer */}
      <OrderDetailDrawer
        key={selectedOrder?.orderId ?? "admin-order-drawer"}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={(order, nextStatus) =>
          updateStatusMutation.mutate({ orderId: order.orderId, status: nextStatus })
        }
        onUpdatePricing={(order, payload) =>
          updatePricingMutation.mutate({ orderId: order.orderId, payload })
        }
        isUpdating={updateStatusMutation.isPending}
        isPricingUpdating={updatePricingMutation.isPending}
      />
    </div>
  );
}
