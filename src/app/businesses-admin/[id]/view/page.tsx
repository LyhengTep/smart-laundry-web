"use client";

import { useOrders } from "@/hooks/orders/orderHook";
import { getBusinessRevenue } from "@/services/businessService";
import { updateOrderStatus } from "@/services/orderService";
import { LaundryOrder } from "@/types/order";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  UserCheck,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ReactNode, useState } from "react";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  accent: string;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  READY_FOR_DELIVERY: "Ready for Delivery",
};

const StatusPill = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-600 border border-amber-200",
    READY_FOR_DELIVERY: "bg-green-50 text-green-600 border border-green-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${styles[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
};

function AcceptOrderModal({
  order,
  onConfirm,
  onCancel,
  isSubmitting,
}: {
  order: LaundryOrder;
  onConfirm: (pickupFee: number) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [feeInput, setFeeInput] = useState("0");
  const fee = Math.max(0, Number(feeInput) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Accept Order</p>
            <h2 className="text-lg font-black text-gray-900 mt-0.5">{order.order_no}</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label
              htmlFor="pickup-fee-input"
              className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2"
            >
              Pickup Fee ($)
            </label>
            <input
              id="pickup-fee-input"
              type="number"
              min={0}
              step="0.01"
              value={feeInput}
              onChange={(e) => setFeeInput(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-xl font-black text-gray-800 outline-none focus:border-blue-500 transition-colors"
              placeholder="0.00"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="py-3 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(fee)}
              disabled={isSubmitting}
              className="py-3 bg-blue-600 rounded-2xl font-bold text-white hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} strokeWidth={3} />
              )}
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QueueTableRow({
  order,
  onAccept,
  onAssignDriver,
  isProcessing,
}: {
  order: LaundryOrder;
  onAccept?: (order: LaundryOrder) => void;
  onAssignDriver?: (order: LaundryOrder) => void;
  isProcessing: boolean;
}) {
  const topService = order.items?.[0]?.service_name ?? "—";
  const extraCount = (order.items?.length ?? 1) - 1;
  const customerName =
    order.customer?.full_name ?? order.customer_id?.slice(0, 8) ?? "—";
  const placedAt = order.placed_at ? timeAgo(order.placed_at) : "—";

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
          {order.order_no}
        </p>
      </td>
      <td className="px-6 py-4">
        <p className="font-semibold text-gray-800">{customerName}</p>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-600">
          {topService}
          {extraCount > 0 && (
            <span className="ml-1 text-xs text-gray-400">+{extraCount} more</span>
          )}
        </p>
      </td>
      <td className="px-6 py-4">
        <StatusPill status={order.status} />
      </td>
      <td className="px-6 py-4 text-sm font-bold text-gray-800">
        ${order.total.toFixed(2)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-400">{placedAt}</td>
      <td className="px-6 py-4 text-right">
        {order.status === "PENDING" && onAccept && (
          <button
            type="button"
            onClick={() => onAccept(order)}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Check size={13} strokeWidth={3} />
            )}
            Accept
          </button>
        )}
        {order.status === "READY_FOR_DELIVERY" && onAssignDriver && (
          <button
            type="button"
            onClick={() => onAssignDriver(order)}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <UserCheck size={13} />
            )}
            Assign Driver
          </button>
        )}
      </td>
    </tr>
  );
}

const BusinessDashboard = () => {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [acceptingOrder, setAcceptingOrder] = useState<LaundryOrder | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  const { data: revenueData, isLoading: isRevenueLoading } = useQuery({
    queryKey: ["business-revenue", params.id],
    queryFn: () => getBusinessRevenue(params.id),
    enabled: !!params.id,
  });

  const { data: pendingData, isLoading: isPendingLoading } = useOrders({
    business_id: params.id,
    status: "PENDING",
    size: 50,
  });

  const { data: readyData, isLoading: isReadyLoading } = useOrders({
    business_id: params.id,
    status: "READY_FOR_DELIVERY",
    size: 50,
  });

  const pendingOrders: LaundryOrder[] = pendingData?.items ?? [];
  const readyOrders: LaundryOrder[] = readyData?.items ?? [];

  const totalRevenue = revenueData?.total_revenue
    ? parseFloat(revenueData.total_revenue)
    : null;
  const currency = revenueData?.currency ?? "USD";

  const acceptMutation = useMutation({
    mutationFn: ({ orderId, pickupFee }: { orderId: string; pickupFee: number }) =>
      updateOrderStatus(orderId, { status: "CONFIRMED", pickup_fee: pickupFee }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setAcceptingOrder(null);
      setProcessingOrderId(null);
    },
    onSettled: () => setProcessingOrderId(null),
  });

  const assignMutation = useMutation({
    mutationFn: (orderId: string) =>
      updateOrderStatus(orderId, { status: "DELIVERY_ASSIGNED" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setProcessingOrderId(null);
    },
    onSettled: () => setProcessingOrderId(null),
  });

  const handleAccept = (order: LaundryOrder) => {
    setAcceptingOrder(order);
  };

  const handleConfirmAccept = (pickupFee: number) => {
    if (!acceptingOrder) return;
    setProcessingOrderId(acceptingOrder.id);
    acceptMutation.mutate({ orderId: acceptingOrder.id, pickupFee });
  };

  const handleAssignDriver = (order: LaundryOrder) => {
    setProcessingOrderId(order.id);
    assignMutation.mutate(order.id);
  };

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
        <h1 className="text-lg font-semibold text-gray-800">
          Business Management
        </h1>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-blue-600 relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
            JD
          </div>
        </div>
      </header>

      <div className="p-8 max-w-6xl mx-auto">
        {/* Welcome & Quick Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Laundry Day,{" "}
              <span className="text-blue-600">Managed.</span>
            </h2>
            <p className="text-gray-500 mt-1">
              Live queue — pending and ready for delivery orders.
            </p>
          </div>
          <Link
            href={`/businesses-admin/${params.id}/orders`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-md"
          >
            <Plus size={18} /> View All Orders
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Pending Orders"
            value={isPendingLoading ? "…" : String(pendingOrders.length)}
            icon={<Clock className="text-amber-500" size={20} />}
            accent="text-amber-500"
          />
          <StatCard
            label="Ready for Delivery"
            value={isReadyLoading ? "…" : String(readyOrders.length)}
            icon={<CheckCircle2 className="text-green-600" size={20} />}
            accent="text-green-600"
          />
          <StatCard
            label="Total Revenue"
            value={
              isRevenueLoading
                ? "…"
                : totalRevenue !== null
                  ? `$${totalRevenue.toFixed(2)} ${currency}`
                  : "—"
            }
            icon={<Wallet className="text-blue-600" size={20} />}
            accent="text-blue-600"
          />
        </div>

        {/* Live Order Queue */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h3 className="font-bold text-gray-800">Live Order Queue</h3>
            {!isPendingLoading && !isReadyLoading && (
              <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {pendingOrders.length + readyOrders.length} orders
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Placed</th>
                  <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isPendingLoading || isReadyLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : pendingOrders.length === 0 && readyOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                      No pending or ready-for-delivery orders.
                    </td>
                  </tr>
                ) : (
                  <>
                    {pendingOrders.map((order) => (
                      <QueueTableRow
                        key={order.id}
                        order={order}
                        onAccept={handleAccept}
                        isProcessing={processingOrderId === order.id}
                      />
                    ))}
                    {readyOrders.map((order) => (
                      <QueueTableRow
                        key={order.id}
                        order={order}
                        onAssignDriver={handleAssignDriver}
                        isProcessing={processingOrderId === order.id}
                      />
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {acceptingOrder && (
        <AcceptOrderModal
          order={acceptingOrder}
          onConfirm={handleConfirmAccept}
          onCancel={() => setAcceptingOrder(null)}
          isSubmitting={acceptMutation.isPending}
        />
      )}

    </main>
  );
};

const StatCard = ({ label, value, icon, accent }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-gray-50 rounded-xl">{icon}</div>
    </div>
    <p className="text-gray-500 text-sm font-medium">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${accent}`}>{value}</p>
  </div>
);

export default BusinessDashboard;
