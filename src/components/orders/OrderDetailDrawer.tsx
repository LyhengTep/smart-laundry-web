import {
  CalendarClock,
  MapPin,
  MessageSquare,
  PencilRuler,
  Printer,
  Receipt,
  Truck,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { UpdateOrderPricingRequest } from "@/types/order";
import { OrderItem } from "./types";

interface OrderDetailDrawerProps {
  order: OrderItem | null;
  onClose: () => void;
  onUpdateStatus: (order: OrderItem, nextStatus: string) => void;
  onUpdatePricing: (order: OrderItem, payload: UpdateOrderPricingRequest) => void;
  isUpdating?: boolean;
  isPricingUpdating?: boolean;
}

const formatAmount = (value?: number) =>
  typeof value === "number" ? `$${value.toFixed(2)}` : "-";

const SHOP_NEXT_STATUS: Record<string, string> = {
  DELIVERED_TO_SHOP: "PROCESSING",
  PROCESSING: "READY_FOR_DELIVERY",
};

export function OrderDetailDrawer({
  order,
  onClose,
  onUpdateStatus,
  onUpdatePricing,
  isUpdating = false,
  isPricingUpdating = false,
}: OrderDetailDrawerProps) {
  const [quantities, setQuantities] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (order?.lineItems || []).map((item) => [item.id, String(item.quantity)]),
    ),
  );
  const [discountInput, setDiscountInput] = useState(
    String(order?.discount ?? 0),
  );
  const lineItems = useMemo(() => order?.lineItems || [], [order]);

  const nextStatus = order ? SHOP_NEXT_STATUS[order.status] : undefined;
  const canUpdate =
    order?.status === "DELIVERED_TO_SHOP" || order?.status === "PROCESSING";
  const canRecalculate = order?.status === "DELIVERED_TO_SHOP";

  const pricedItems = useMemo(
    () => {
      return lineItems.map((item) => {
        const parsed = Number(quantities[item.id]);
        const quantity = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
        return {
          order_item_id: item.id,
          quantity,
          preview_sub_total: quantity * item.unitPrice,
        };
      });
    },
    [lineItems, quantities],
  );

  const recalculatedSubtotal = useMemo(
    () => pricedItems.reduce((sum, item) => sum + item.preview_sub_total, 0),
    [pricedItems],
  );
  const parsedDiscount = Number(discountInput);
  const effectiveDiscount =
    Number.isFinite(parsedDiscount) && parsedDiscount >= 0 ? parsedDiscount : 0;
  const recalculatedTotal = Math.max(recalculatedSubtotal - effectiveDiscount, 0);
  const hasPricingChange = useMemo(
    () =>
      pricedItems.some((item) => {
        const current = lineItems.find((line) => line.id === item.order_item_id);
        return (current?.quantity ?? 0) !== item.quantity;
      }) || effectiveDiscount !== (order?.discount ?? 0),
    [effectiveDiscount, order?.discount, lineItems, pricedItems],
  );

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Order No
            </p>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              {order.id}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <section className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-slate-700 font-bold mb-2">
              <User size={16} /> Customer
            </div>
            <p className="text-sm text-slate-900 break-all">{order.customer}</p>
            <p className="text-xs text-slate-500 mt-1">
              Status: {order.status.replaceAll("_", " ")}
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-700 font-bold mb-2">
                <CalendarClock size={16} /> Pickup
              </div>
              <p className="text-sm text-slate-800">{order.pickupAt}</p>
              <p className="text-xs text-slate-500 mt-2 break-words">
                {order.pickupAddress || "-"}
              </p>
            </div>
            <div className="border border-slate-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-700 font-bold mb-2">
                <Truck size={16} /> Delivery
              </div>
              <p className="text-sm text-slate-800">{order.dropoffAt}</p>
              <p className="text-xs text-slate-500 mt-2 break-words">
                {order.deliveryAddress || "-"}
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 text-slate-700 font-bold mb-3">
              <Receipt size={16} /> Items
            </div>
            <div className="space-y-3">
              {(order.lineItems || []).map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-100 rounded-xl p-3"
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-semibold text-slate-900">
                      {item.serviceName}
                    </p>
                    <p className="font-semibold text-slate-800">
                      ${item.subTotal.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.quantity} {item.measureType} x $
                    {item.unitPrice.toFixed(2)} ({item.pricingType})
                  </p>
                  {item.note ? (
                    <p className="text-xs text-slate-500 mt-1">
                      Note: {item.note}
                    </p>
                  ) : null}
                </div>
              ))}
              {(!order.lineItems || order.lineItems.length === 0) && (
                <p className="text-sm text-slate-500">No item details.</p>
              )}
            </div>
          </section>

          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold">
              <PencilRuler size={16} /> Measured Weight & Pricing
            </div>
            <p className="text-xs text-blue-800">
              Update measured quantity after driver delivery, then recalculate pricing.
            </p>
            <div className="space-y-3">
              {(order.lineItems || []).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-blue-100 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.serviceName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Unit ${item.unitPrice.toFixed(2)} per {item.measureType}
                      </p>
                    </div>
                    <div className="w-32">
                      <label className="text-[11px] uppercase tracking-wide text-slate-400">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={item.measureType === "kg" ? "0.1" : "1"}
                        value={quantities[item.id] ?? ""}
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-[11px] uppercase tracking-wide text-slate-500">
                  Discount
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
                />
              </div>
              <div className="rounded-xl border border-blue-100 bg-white p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-700">
                    {formatAmount(recalculatedSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-semibold text-slate-700">
                    {formatAmount(effectiveDiscount)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1">
                  <span className="font-bold text-slate-800">New Total</span>
                  <span className="font-bold text-blue-700">
                    {formatAmount(recalculatedTotal)}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={
                !canRecalculate ||
                isPricingUpdating ||
                !hasPricingChange ||
                pricedItems.length === 0
              }
              onClick={() =>
                onUpdatePricing(order, {
                  items: pricedItems.map((item) => ({
                    order_item_id: item.order_item_id,
                    quantity: item.quantity,
                  })),
                  discount: effectiveDiscount,
                })
              }
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300 hover:bg-blue-700 transition-all"
            >
              {isPricingUpdating ? "Recalculating..." : "Update Weight & Recalculate"}
            </button>
            {!canRecalculate && (
              <p className="text-xs text-amber-700">
                Pricing update is available when order status is DELIVERED TO SHOP.
              </p>
            )}
          </section>

          <section className="bg-slate-50 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-800">
                {formatAmount(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Discount</span>
              <span className="font-semibold text-slate-800">
                {formatAmount(order.discount)}
              </span>
            </div>
            <div className="flex justify-between text-base border-t border-slate-200 pt-2 mt-2">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-blue-700">
                {formatAmount(order.total)}
              </span>
            </div>
          </section>

          {order.notes ? (
            <section className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-700 font-bold mb-1">
                <MessageSquare size={16} /> Customer Note
              </div>
              <p className="text-sm text-amber-800">{order.notes}</p>
            </section>
          ) : null}

          <div className="p-6 border-t border-slate-50 bg-white grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-4 border-2 border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">
              <Printer size={18} /> Print Tag
            </button>
            <button
              type="button"
              disabled={!canUpdate || !nextStatus || isUpdating}
              onClick={() => {
                if (!nextStatus) return;
                onUpdateStatus(order, nextStatus);
              }}
              className="flex items-center justify-center gap-2 py-4 bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
            >
              {isUpdating
                ? "Updating..."
                : nextStatus
                  ? `Mark as ${nextStatus.replaceAll("_", " ")}`
                  : "No Update Available"}
            </button>
          </div>
          {!canUpdate && (
            <p className="px-6 pb-2 text-xs text-amber-600">
              Shop owner can update status only after driver delivered packet to
              shop.
            </p>
          )}

          <section className="text-xs text-slate-500 break-all">
            <div className="flex items-center gap-1">
              <MapPin size={12} /> Internal ID: {order.orderId}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
