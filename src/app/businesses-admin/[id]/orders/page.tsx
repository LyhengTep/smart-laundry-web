"use client";

import { OrderDetailDrawer } from "@/components/orders/OrderDetailDrawer";
import { OrderSectionTabs } from "@/components/orders/OrderSectionTabs";
import { OrdersStatsBar } from "@/components/orders/OrdersStatsBar";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { PendingOrdersRibbon } from "@/components/orders/PendingOrdersRibbon";
import { OrderItem, OrderSection } from "@/components/orders/types";
import { ListingPagination } from "@/components/ListingPagination";
import { DialogCtx } from "@/contexts/DialogProvider";
import { ToastContext } from "@/contexts/ToastProvider";
import { useOrders } from "@/hooks/orders/orderHook";
import { updateOrderPricing, updateOrderStatus } from "@/services/orderService";
import { LaundryOrder, UpdateOrderPricingRequest } from "@/types/order";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";

const toOrderCard = (order: LaundryOrder): OrderItem => {
  const firstItem = order.items?.[0];
  const measure = firstItem?.measure_type || "item";
  const quantity = firstItem?.quantity ?? order.items?.length ?? 0;

  return {
    orderId: order.id,
    id: order.order_no,
    customer: order.customer_id,
    service: firstItem?.service_name || `${order.items?.length || 0} services`,
    weight: `${quantity} ${measure}`,
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
};

const toPendingCard = (order: LaundryOrder) => {
  const customerShort = order.customer_id?.slice(0, 8) || "Unknown";
  const topServices = (order.items || [])
    .slice(0, 2)
    .map((item) => item.service_name)
    .join(", ");
  const serviceText =
    topServices || `${order.items?.length || 0} service(s) selected`;
  const pickupTime = order.scheduled_pickup_at
    ? new Date(order.scheduled_pickup_at).toLocaleString()
    : "No pickup schedule";

  return {
    id: order.id,
    title: `Order ${order.order_no}`,
    subtitle: `Customer #${customerShort} • ${serviceText}`,
    meta: `Subtotal $${order.subtotal.toFixed(2)} • Pickup ${pickupTime}`,
    customer: order.customer_id,
    pickupAddress: order.pickup_address || "",
    deliveryAddress: order.delivery_address || "",
    pickupLat: order.pickup_latitude ?? null,
    pickupLng: order.pickup_longitude ?? null,
    deliveryLat: order.delivery_latitude ?? null,
    deliveryLng: order.delivery_longitude ?? null,
    scheduledPickupAt: order.scheduled_pickup_at
      ? new Date(order.scheduled_pickup_at).toLocaleString()
      : undefined,
    scheduledDropoffAt: order.scheduled_dropoff_at
      ? new Date(order.scheduled_dropoff_at).toLocaleString()
      : undefined,
    notes: order.notes || "",
    total: order.total,
    pickupFee: order.pickup_fee ?? null,
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
};

const LIVE_STATUS_OPTIONS = [
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
];

const HISTORY_STATUS_OPTIONS = ["DELIVERED", "CANCELLED"];

export default function OrderManagementPage() {
  const params = useParams<{ id: string }>();
  const businessId = String(params.id || "");
  const queryClient = useQueryClient();
  const dialogCtx = useContext(DialogCtx);
  const toastCtx = useContext(ToastContext);
  const [activeSection, setActiveSection] = useState<OrderSection>("orders");
  const [searchField, setSearchField] = useState<
    "order_no" | "customer_id" | "business_id"
  >("order_no");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [livePage, setLivePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setLivePage(1);
      setHistoryPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setLivePage(1);
    setHistoryPage(1);
  }, [statusFilter, activeSection]);

  const baseSearch = useMemo(() => {
    const p: Record<string, string | number> = {
      size: 10,
      business_id:
        searchField === "business_id" && debouncedSearchTerm
          ? debouncedSearchTerm
          : businessId,
    };
    if (debouncedSearchTerm && searchField === "customer_id") p.customer_id = debouncedSearchTerm;
    if (debouncedSearchTerm && searchField === "order_no") p.order_no = debouncedSearchTerm;
    return p;
  }, [businessId, debouncedSearchTerm, searchField]);

  const liveQueryParams = useMemo(() => {
    const p: Record<string, string | number> = { ...baseSearch, page: livePage };
    if (statusFilter && LIVE_STATUS_OPTIONS.includes(statusFilter)) p.status = statusFilter;
    return p;
  }, [baseSearch, livePage, statusFilter]);

  const historyQueryParams = useMemo(() => {
    const p: Record<string, string | number> = { ...baseSearch, page: historyPage };
    if (statusFilter && HISTORY_STATUS_OPTIONS.includes(statusFilter)) p.status = statusFilter;
    return p;
  }, [baseSearch, historyPage, statusFilter]);

  const { data: liveData, isLoading: isLiveLoading } = useOrders(
    activeSection === "orders" ? liveQueryParams : undefined,
  );
  const { data: historyData, isLoading: isHistoryLoading } = useOrders(
    activeSection === "history" ? historyQueryParams : undefined,
  );

  const data = activeSection === "orders" ? liveData : historyData;
  const isLoading = activeSection === "orders" ? isLiveLoading : isHistoryLoading;
  const [hiddenPendingOrderIds, setHiddenPendingOrderIds] = useState<string[]>(
    [],
  );

  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
      pickup_fee,
    }: {
      orderId: string;
      status: string;
      pickup_fee?: number | null;
    }) => updateOrderStatus(orderId, { status, pickup_fee }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
        refetchType: "active",
      });
      setSelectedOrder((prev) => {
        if (!prev || prev.orderId !== variables.orderId) return prev;
        return { ...prev, status: variables.status };
      });
      toastCtx?.setToast?.({
        error: false,
        message: "Order status updated.",
      });
      toastCtx?.setIsVisible(true);
    },
    onError: () => {
      toastCtx?.setToast?.({
        error: true,
        message: "Failed to update order status.",
      });
      toastCtx?.setIsVisible(true);
    },
  });

  const updatePricingMutation = useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: UpdateOrderPricingRequest;
    }) => updateOrderPricing(orderId, payload),
    onSuccess: async (updatedOrder, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
        refetchType: "active",
      });
      setSelectedOrder((prev) => {
        if (!prev || prev.orderId !== variables.orderId) return prev;
        return toOrderCard(updatedOrder as LaundryOrder);
      });
      toastCtx?.setToast?.({
        error: false,
        message: "Order pricing recalculated.",
      });
      toastCtx?.setIsVisible(true);
    },
    onError: () => {
      toastCtx?.setToast?.({
        error: true,
        message: "Failed to recalculate order pricing.",
      });
      toastCtx?.setIsVisible(true);
    },
  });

  const handleAcceptOrder = (id: string, pickupFee: number) => {
    setHiddenPendingOrderIds((prev) => [...prev, id]);
    updateStatusMutation.mutate({
      orderId: id,
      status: "CONFIRMED",
      pickup_fee: pickupFee,
    });
  };

  const handleRejectOrder = (id: string) => {
    dialogCtx.open({
      title: "Reject this order?",
      description: "This will mark this order as CANCELLED.",
      confirmLabel: "Yes, Reject",
      tone: "danger",
      onConfirm: () => {
        setHiddenPendingOrderIds((prev) => [...prev, id]);
        updateStatusMutation.mutate({ orderId: id, status: "CANCELLED" });
      },
    });
  };

  const handleUpdateFromDrawer = (order: OrderItem, nextStatus: string) => {
    dialogCtx.open({
      title: "Update order status?",
      description: `This will change status to ${nextStatus.replaceAll("_", " ")}.`,
      confirmLabel: "Yes, Update",
      onConfirm: () => {
        updateStatusMutation.mutate({
          orderId: order.orderId,
          status: nextStatus,
        });
      },
    });
  };

  const handleUpdatePricingFromDrawer = (
    order: OrderItem,
    payload: UpdateOrderPricingRequest,
  ) => {
    dialogCtx.open({
      title: "Recalculate order pricing?",
      description:
        "Measured quantity and discount will update this order total.",
      confirmLabel: "Yes, Recalculate",
      onConfirm: () => {
        updatePricingMutation.mutate({
          orderId: order.orderId,
          payload,
        });
      },
    });
  };

  const rawOrders = useMemo(() => data?.items || [], [data?.items]);

  const pendingOrders = useMemo(
    () =>
      rawOrders
        .filter(
          (order) =>
            order.status === "PENDING" &&
            !hiddenPendingOrderIds.includes(order.id),
        )
        .map(toPendingCard),
    [rawOrders, hiddenPendingOrderIds],
  );

  const liveOrders: OrderItem[] = rawOrders
    .filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status))
    .map(toOrderCard);
  const historyOrders: OrderItem[] = rawOrders
    .filter((order) => ["DELIVERED", "CANCELLED"].includes(order.status))
    .map(toOrderCard);
  const visibleOrders = activeSection === "orders" ? liveOrders : historyOrders;
  const statusOptions =
    activeSection === "orders" ? LIVE_STATUS_OPTIONS : HISTORY_STATUS_OPTIONS;
  const effectiveStatusFilter = statusOptions.includes(statusFilter)
    ? statusFilter
    : "";
  const filteredOrders = useMemo(() => {
    return visibleOrders.filter((order) => {
      const matchesStatus = effectiveStatusFilter
        ? order.status === effectiveStatusFilter
        : true;
      return matchesStatus;
    });
  }, [visibleOrders, effectiveStatusFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 text-slate-500">Loading orders...</div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-50/50 p-3 md:p-8 space-y-4 md:space-y-8">
      {activeSection === "orders" && (
        <PendingOrdersRibbon
          pendingOrders={pendingOrders}
          onAccept={handleAcceptOrder}
          onReject={handleRejectOrder}

          // processingOrderId={
          //   updateStatusMutation.isPending
          //     ? updateStatusMutation.variables?.orderId || null
          //     : null
          // }
        />
      )}

      <OrdersStatsBar
        activeSection={activeSection}
        visibleCount={visibleOrders.length}
        processingCount={
          rawOrders.filter((o) =>
            [
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
            ].includes(o.status),
          ).length
        }
        completedCount={
          rawOrders.filter((o) => o.status === "DELIVERED").length
        }
      />

      <OrderSectionTabs
        activeSection={activeSection}
        onChange={setActiveSection}
      />

      <OrdersTable
        activeSection={activeSection}
        orders={filteredOrders}
        onRowClick={setSelectedOrder}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchField={searchField}
        onSearchFieldChange={setSearchField}
        statusFilter={effectiveStatusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
      />

      {(data?.pages ?? 0) > 1 && (
        <ListingPagination
          currentPage={activeSection === "orders" ? livePage : historyPage}
          pages={data?.pages ?? 0}
          onForward={() =>
            activeSection === "orders"
              ? setLivePage((p) => Math.min(p + 1, data?.pages ?? p))
              : setHistoryPage((p) => Math.min(p + 1, data?.pages ?? p))
          }
          onBackward={() =>
            activeSection === "orders"
              ? setLivePage((p) => Math.max(p - 1, 1))
              : setHistoryPage((p) => Math.max(p - 1, 1))
          }
          onPageClick={(p: number) => {
            const n = Number(p);
            if (!isNaN(n))
              activeSection === "orders" ? setLivePage(n) : setHistoryPage(n);
          }}
        />
      )}

      <OrderDetailDrawer
        key={selectedOrder?.orderId ?? "order-detail-drawer"}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateFromDrawer}
        onUpdatePricing={handleUpdatePricingFromDrawer}
        isUpdating={updateStatusMutation.isPending}
        isPricingUpdating={updatePricingMutation.isPending}
      />
    </div>
  );
}
