"use client";

import { User, X } from "lucide-react";
import { useEffect, useState } from "react";

type CollectFromCustomerModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  orderNo?: string;
  orderTotal?: number | null;
  deliveryFee?: number | null;
  pickupFee?: number | null;
  hasAdvanceSettlement?: boolean | null;
};

export default function CollectFromCustomerModal({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
  orderNo,
  orderTotal,
  deliveryFee,
  pickupFee,
  hasAdvanceSettlement,
}: CollectFromCustomerModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsConfirmed(false);
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const total = typeof orderTotal === "number" ? orderTotal : 0;
  const dFee = deliveryFee && deliveryFee > 0 ? deliveryFee : (pickupFee ?? 0);
  const pFee = hasAdvanceSettlement && typeof pickupFee === "number" ? pickupFee : 0;
  const grandTotal = total + dFee + pFee;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-[430px] bg-[#050a18] text-white rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden">
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
              Customer Collection
            </p>
            <h2 className="text-lg font-black leading-none mt-1">
              Collect from Customer
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

        <main className="px-6 py-5 space-y-5">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/15 rounded-2xl mb-4">
              <User size={28} className="text-emerald-400" />
            </div>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">
              Order #{orderNo || "—"}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Order Total</span>
                <span className="font-black text-white">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Delivery Fee</span>
                <span className="font-black text-white">${dFee.toFixed(2)}</span>
              </div>
              {hasAdvanceSettlement && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium flex items-center gap-2">
                    Pickup Fee
                    <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full">
                      Advance
                    </span>
                  </span>
                  <span className="font-black text-amber-400">${pFee.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Total to Collect
              </span>
              <span className="text-4xl font-black text-white">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-600/5 blur-3xl rounded-full" />
          </div>

          {hasAdvanceSettlement && (
            <div className="flex gap-3 p-4 bg-amber-600/5 border border-amber-500/10 rounded-2xl">
              <User size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                The shop previously advanced the pickup fee for this customer.
                Collect an additional{" "}
                <span className="text-amber-300 font-bold">${pFee.toFixed(2)}</span>{" "}
                pickup fee from the customer.
              </p>
            </div>
          )}

          <label className="flex items-start gap-3 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-slate-500 bg-slate-900"
            />
            <span>I confirm <span className="text-white font-bold">${grandTotal.toFixed(2)}</span> has been collected from the customer.</span>
          </label>
        </main>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isConfirmed || isSubmitting}
            className="w-full py-3.5 bg-emerald-600 text-white font-black rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Confirm Delivery to Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
