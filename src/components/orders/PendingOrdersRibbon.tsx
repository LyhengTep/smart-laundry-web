"use client";

import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  MapPin,
  Receipt,
  StickyNote,
  Truck,
  X,
} from "lucide-react";
import { useState } from "react";
import { OrderLineItem, PendingOrderItem } from "./types";

interface PendingOrdersRibbonProps {
  pendingOrders: PendingOrderItem[];
  onAccept: (id: string, deliveryFee: number) => void;
  onReject: (id: string) => void;
  processingOrderId?: string | null;
}

function timeAgo(iso?: string) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function MapEmbed({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const src = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=15&maptype=roadmap`;
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2 bg-slate-50 border-b border-slate-100">
        {label}
      </p>
      <iframe
        title={label}
        src={src}
        width="100%"
        height="200"
        loading="lazy"
        className="block"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

function LineItemRow({ item }: { item: OrderLineItem }) {
  return (
    <div className="flex justify-between items-start gap-2 py-2.5 border-b border-slate-50 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{item.serviceName}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {item.quantity} {item.measureType} × ${item.unitPrice.toFixed(2)}{" "}
          <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
            {item.pricingType}
          </span>
        </p>
        {item.note && (
          <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
            <StickyNote size={10} /> {item.note}
          </p>
        )}
      </div>
      <p className="text-sm font-bold text-slate-800 shrink-0">${item.subTotal.toFixed(2)}</p>
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: PendingOrderItem; onClose: () => void }) {
  const hasPickupMap =
    typeof order.pickupLat === "number" && typeof order.pickupLng === "number";
  const hasDeliveryMap =
    typeof order.deliveryLat === "number" && typeof order.deliveryLng === "number";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Awaiting Action
            </span>
            <h2 className="text-xl font-black text-slate-900">{order.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Addresses */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-2">
                <CalendarClock size={13} /> Pickup
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {order.scheduledPickupAt || "—"}
              </p>
              <p className="text-xs text-slate-500 mt-1">{order.pickupAddress || "No address"}</p>
            </div>
            {hasPickupMap && (
              <MapEmbed lat={order.pickupLat as number} lng={order.pickupLng as number} label="Pickup Location" />
            )}

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Truck size={13} /> Delivery
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {order.scheduledDropoffAt || "—"}
              </p>
              <p className="text-xs text-slate-500 mt-1">{order.deliveryAddress || "No address"}</p>
            </div>
            {hasDeliveryMap && (
              <MapEmbed lat={order.deliveryLat as number} lng={order.deliveryLng as number} label="Delivery Location" />
            )}
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider mb-3">
              <Receipt size={13} /> Order Items
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl px-4">
              {order.lineItems.length > 0 ? (
                order.lineItems.map((item) => <LineItemRow key={item.id} item={item} />)
              ) : (
                <p className="text-sm text-slate-400 py-4">No item details.</p>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="bg-slate-900 rounded-2xl p-4 flex justify-between items-center">
            <span className="font-bold text-slate-300 text-sm">Order Total</span>
            <span className="text-2xl font-black text-white">${order.total.toFixed(2)}</span>
          </div>

          {/* Customer note */}
          {order.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1.5">
                <MapPin size={12} /> Customer Note
              </div>
              <p className="text-sm text-amber-800 leading-relaxed">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AcceptWithFeeModal({
  order,
  onConfirm,
  onCancel,
}: {
  order: PendingOrderItem;
  onConfirm: (deliveryFee: number) => void;
  onCancel: () => void;
}) {
  const [feeInput, setFeeInput] = useState("0");
  const parsedFee = Number(feeInput);
  const fee = Number.isFinite(parsedFee) && parsedFee >= 0 ? parsedFee : 0;
  const total = order.total + fee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Confirm Accept
            </p>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">{order.title}</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Summary row */}
          <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center">
            <span className="text-sm text-slate-500 font-medium">Order subtotal</span>
            <span className="font-bold text-slate-800">${order.total.toFixed(2)}</span>
          </div>

          {/* Fee input */}
          <div>
            <label
              htmlFor="delivery-fee-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
            >
              Pickup Fee ($)
            </label>
            <input
              id="delivery-fee-input"
              type="number"
              min={0}
              step="0.01"
              value={feeInput}
              onChange={(e) => setFeeInput(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-2xl font-black text-slate-800 outline-none focus:border-blue-500 transition-colors text-center"
              placeholder="0.00"
              autoFocus
            />
          </div>

          {/* Total with fee */}
          <div className="bg-blue-600 rounded-2xl p-4 flex justify-between items-center">
            <span className="text-sm text-blue-100 font-medium">Customer total</span>
            <span className="text-xl font-black text-white">${total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="py-3.5 border-2 border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(fee)}
              className="py-3.5 bg-green-600 rounded-2xl font-bold text-white hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PendingOrderCard({
  order,
  onViewDetail,
  onAccept,
  onReject,
  isProcessing,
}: {
  order: PendingOrderItem;
  onViewDetail: () => void;
  onAccept: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) {
  const ago = timeAgo(order.scheduledPickupAt);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex overflow-hidden hover:shadow-md transition-shadow">
      {/* Urgency stripe */}
      <div className="w-1.5 shrink-0 bg-amber-400" />

      <div className="flex-1 p-4 min-w-0">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-slate-900 font-mono tracking-tight">
                {order.title}
              </span>
              {ago && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {ago}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{order.subtitle}</p>
          </div>
          <span className="text-lg font-black text-slate-900 shrink-0 tabular-nums">
            ${order.total.toFixed(2)}
          </span>
        </div>

        {/* Meta row */}
        {order.pickupAddress && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <MapPin size={11} className="shrink-0 text-blue-400" />
            <span className="truncate">{order.pickupAddress}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={onViewDetail}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors py-1"
          >
            <Eye size={13} /> Details
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onReject}
              disabled={isProcessing}
              className="h-9 px-4 rounded-xl border-2 border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <X size={14} strokeWidth={3} /> Reject
            </button>
            <button
              type="button"
              onClick={onAccept}
              disabled={isProcessing}
              className="h-9 px-4 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm shadow-green-200"
            >
              <CheckCircle2 size={14} /> Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PendingOrdersRibbon({
  pendingOrders,
  onAccept,
  onReject,
  processingOrderId,
}: PendingOrdersRibbonProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [detailOrder, setDetailOrder] = useState<PendingOrderItem | null>(null);
  const [acceptingOrder, setAcceptingOrder] = useState<PendingOrderItem | null>(null);

  if (pendingOrders.length === 0) return null;

  return (
    <>
      <section className="animate-in slide-in-from-top duration-300">
        {/* Header */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl mb-3 hover:bg-amber-100 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
            <BellRing size={16} className="text-amber-600" />
            <span className="font-black text-amber-800 text-sm uppercase tracking-widest">
              {pendingOrders.length} Order{pendingOrders.length > 1 ? "s" : ""} Awaiting Action
            </span>
          </div>
          {collapsed ? (
            <ChevronDown size={18} className="text-amber-500 group-hover:text-amber-700 transition-colors" />
          ) : (
            <ChevronUp size={18} className="text-amber-500 group-hover:text-amber-700 transition-colors" />
          )}
        </button>

        {/* Cards grid */}
        {!collapsed && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-0.5">
            {pendingOrders.map((order) => (
              <PendingOrderCard
                key={order.id}
                order={order}
                onViewDetail={() => setDetailOrder(order)}
                onAccept={() => {
                  if (typeof order.pickupFee === "number" && order.pickupFee > 0) {
                    onAccept(order.id, order.pickupFee);
                  } else {
                    setAcceptingOrder(order);
                  }
                }}
                onReject={() => onReject(order.id)}
                isProcessing={processingOrderId === order.id}
              />
            ))}
          </div>
        )}
      </section>

      {detailOrder && (
        <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
      )}

      {acceptingOrder && (
        <AcceptWithFeeModal
          order={acceptingOrder}
          onConfirm={(fee) => {
            onAccept(acceptingOrder.id, fee);
            setAcceptingOrder(null);
          }}
          onCancel={() => setAcceptingOrder(null)}
        />
      )}
    </>
  );
}
