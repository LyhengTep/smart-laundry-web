"use client";

import { Banknote, Clock, Info, Store, X } from "lucide-react";
import { useEffect, useState } from "react";

type PaymentMethod = "cash" | "pay_at_shop";

export type DeliveryFeePaidBy = "CUSTOMER" | "SHOP";

type PaymentAcceptanceModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (paidBy: DeliveryFeePaidBy) => void;
  isSubmitting?: boolean;
  orderNo?: string;
  deliveryFee?: number | null;
};

export default function PaymentAcceptanceModal({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
  orderNo,
  deliveryFee,
}: PaymentAcceptanceModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    if (!open) {
      setPaymentMethod(null);
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const fee = typeof deliveryFee === "number" ? deliveryFee : 0;
  const coveredByShop = fee === 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-[430px] bg-[#050a18] text-white rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden">
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
              Pickup Payment
            </p>
            <h2 className="text-lg font-black leading-none mt-1">
              Collect Delivery Fee
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X size={18} />
          </button>
        </header>

        <main className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <Banknote size={12} className="text-green-500" />
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">
                Delivery Fee Only
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Clothing fee is pending — shop will measure and bill later
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
              Delivery Fee to Collect
            </p>
            <h3 className="text-5xl font-black text-white mb-2">
              ${fee.toFixed(2)}
            </h3>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">
              Order #{orderNo || "—"}
            </p>
            {coveredByShop && (
              <p className="mt-2 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Covered by Shop
              </p>
            )}
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-600/5 blur-3xl rounded-full" />
          </div>

          <div className="flex gap-3 p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl">
            <Clock size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Clothing fee is{" "}
              <span className="text-white font-bold">not collected yet</span>.
              The shop will weigh and measure the items, then issue the final
              clothing bill separately.
            </p>
          </div>

          {coveredByShop ? (
            <label className="flex items-start gap-3 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={paymentMethod === "cash"}
                onChange={(e) => setPaymentMethod(e.target.checked ? "cash" : null)}
                className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-900"
              />
              I confirm the delivery fee is covered by the shop.
            </label>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                Payment Method
              </p>

              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  paymentMethod === "cash"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    paymentMethod === "cash"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/10 text-slate-400"
                  }`}
                >
                  <Banknote size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">
                    Collected from Customer
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ${fee.toFixed(2)} cash received from customer now
                  </p>
                </div>
                <div
                  className={`ml-auto w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    paymentMethod === "cash"
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-slate-600"
                  }`}
                >
                  {paymentMethod === "cash" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("pay_at_shop")}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  paymentMethod === "pay_at_shop"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    paymentMethod === "pay_at_shop"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-white/10 text-slate-400"
                  }`}
                >
                  <Store size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Pay at Shop</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Customer will pay when collecting laundry at the shop
                  </p>
                </div>
                <div
                  className={`ml-auto w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    paymentMethod === "pay_at_shop"
                      ? "border-blue-500 bg-blue-500"
                      : "border-slate-600"
                  }`}
                >
                  {paymentMethod === "pay_at_shop" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>

              {paymentMethod === "pay_at_shop" && (
                <div className="flex gap-3 p-3 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
                  <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Driver will collect{" "}
                    <span className="text-white font-bold">${fee.toFixed(2)}</span>{" "}
                    delivery fee at the shop upon drop-off.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={() => paymentMethod && onConfirm(paymentMethod === "pay_at_shop" ? "SHOP" : "CUSTOMER")}
            disabled={paymentMethod === null || isSubmitting}
            className="w-full py-3.5 bg-emerald-600 text-white font-black rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Confirm Pickup"}
          </button>
        </div>
      </div>
    </div>
  );
}
