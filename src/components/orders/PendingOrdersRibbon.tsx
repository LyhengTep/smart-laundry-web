import {
  BellRing,
  CalendarClock,
  Check,
  Eye,
  MapPin,
  Receipt,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { OrderLineItem, PendingOrderItem } from "./types";

interface PendingOrdersRibbonProps {
  pendingOrders: PendingOrderItem[];
  onAccept: (id: string, deliveryFee: number) => void;
  onReject: (id: string) => void;
  processingOrderId?: string | null;
}

function MapEmbed({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  const delta = 0.006;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2 bg-slate-50 border-b border-slate-100">
        {label}
      </p>
      <iframe
        title={label}
        src={src}
        width="100%"
        height="180"
        loading="lazy"
        className="block"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

function LineItemRow({ item }: { item: OrderLineItem }) {
  return (
    <div className="border border-slate-100 rounded-xl p-3 flex justify-between items-start gap-2">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {item.serviceName}
        </p>
        <p className="text-xs text-slate-500">
          {item.quantity} {item.measureType} × ${item.unitPrice.toFixed(2)} (
          {item.pricingType})
        </p>
        {item.note && (
          <p className="text-xs text-slate-400 mt-0.5">Note: {item.note}</p>
        )}
      </div>
      <p className="text-sm font-bold text-slate-800 shrink-0">
        ${item.subTotal.toFixed(2)}
      </p>
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
}: {
  order: PendingOrderItem;
  onClose: () => void;
}) {
  const hasPickupMap =
    typeof order.pickupLat === "number" && typeof order.pickupLng === "number";
  const hasDeliveryMap =
    typeof order.deliveryLat === "number" &&
    typeof order.deliveryLng === "number";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Pending Order
            </p>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              {order.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Customer
            </p>
            <p className="text-sm font-semibold text-slate-800 break-all">
              {order.customer}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="border border-slate-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-600 font-bold text-sm mb-2">
                <CalendarClock size={14} /> Pickup
              </div>
              <p className="text-sm text-slate-800">
                {order.scheduledPickupAt || "—"}
              </p>
              <p className="text-xs text-slate-500 mt-1 break-words">
                {order.pickupAddress || "No address provided"}
              </p>
            </div>

            {hasPickupMap && (
              <MapEmbed
                lat={order.pickupLat as number}
                lng={order.pickupLng as number}
                label="Pickup Location"
              />
            )}

            <div className="border border-slate-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-600 font-bold text-sm mb-2">
                <Truck size={14} /> Delivery
              </div>
              <p className="text-sm text-slate-800">
                {order.scheduledDropoffAt || "—"}
              </p>
              <p className="text-xs text-slate-500 mt-1 break-words">
                {order.deliveryAddress || "No address provided"}
              </p>
            </div>

            {hasDeliveryMap && (
              <MapEmbed
                lat={order.deliveryLat as number}
                lng={order.deliveryLng as number}
                label="Delivery Location"
              />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-600 font-bold text-sm mb-2">
              <Receipt size={14} /> Items
            </div>
            <div className="space-y-2">
              {order.lineItems.length > 0 ? (
                order.lineItems.map((item) => (
                  <LineItemRow key={item.id} item={item} />
                ))
              ) : (
                <p className="text-sm text-slate-400">No item details.</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex justify-between items-center">
            <span className="font-bold text-slate-800">Total</span>
            <span className="text-xl font-black text-blue-700">
              ${order.total.toFixed(2)}
            </span>
          </div>

          {order.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
                <MapPin size={12} /> Customer Note
              </div>
              <p className="text-sm text-amber-800">{order.notes}</p>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">Accept Order</h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-600">
            Accepting{" "}
            <span className="font-bold text-slate-800">{order.title}</span>.
            Enter the delivery fee before confirming.
          </p>

          <div>
            <label
              htmlFor="delivery-fee-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
            >
              Delivery Fee ($)
            </label>
            <input
              id="delivery-fee-input"
              type="number"
              min={0}
              step="0.01"
              value={feeInput}
              onChange={(e) => setFeeInput(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-xl font-black text-slate-800 outline-none focus:border-blue-500 transition-colors"
              placeholder="0.00"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
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
              className="py-3.5 bg-blue-600 rounded-2xl font-bold text-white hover:bg-blue-700 active:scale-95 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <Check size={16} strokeWidth={3} />
                Confirm
              </span>
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
  const [detailOrder, setDetailOrder] = useState<PendingOrderItem | null>(null);
  const [acceptingOrder, setAcceptingOrder] = useState<PendingOrderItem | null>(
    null,
  );

  if (pendingOrders.length === 0) {
    return null;
  }

  return (
    <>
      <section className="animate-in slide-in-from-top duration-500">
        <div className="bg-blue-600 rounded-[2.5rem] p-6 shadow-xl shadow-blue-100">
          <div className="flex items-center gap-3 mb-5 px-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <BellRing size={20} className="text-white animate-pulse" />
            </div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm">
              Action Required: New Orders ({pendingOrders.length})
            </h3>
          </div>

          <div className="max-h-[420px] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-[2rem] flex items-start gap-4"
                >
                  <div className="w-12 h-12 shrink-0 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-lg">
                    <Zap size={24} fill="currentColor" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold truncate">
                      {order.title}
                    </p>
                    <p className="text-blue-100 text-xs font-medium truncate">
                      {order.subtitle}
                    </p>
                    <p className="text-blue-100/90 text-xs truncate">
                      {order.meta}
                    </p>
                    <button
                      type="button"
                      onClick={() => setDetailOrder(order)}
                      className="mt-2 flex items-center gap-1 text-blue-200 hover:text-white text-xs font-semibold transition-colors"
                    >
                      <Eye size={12} /> View Details
                    </button>
                  </div>

                  <div className="ml-auto shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof order.pickupFee === "number" && order.pickupFee > 0) {
                          onAccept(order.id, order.pickupFee);
                        } else {
                          setAcceptingOrder(order);
                        }
                      }}
                      disabled={processingOrderId === order.id}
                      className="h-12 px-5 bg-white text-blue-600 rounded-2xl font-bold hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Check size={20} strokeWidth={3} />
                      <span>Accept</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(order.id)}
                      disabled={processingOrderId === order.id}
                      className="h-12 w-12 bg-red-500/20 text-white rounded-2xl hover:bg-red-500 transition-all flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
        />
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
