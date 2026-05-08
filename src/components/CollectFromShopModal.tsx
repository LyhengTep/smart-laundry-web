"use client";

import { Store, X } from "lucide-react";
import { useEffect, useState } from "react";

type CollectFromShopModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  orderNo?: string;
  deliveryFee?: number | null;
};

export default function CollectFromShopModal({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
  orderNo,
  deliveryFee,
}: CollectFromShopModalProps) {
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

  const fee = typeof deliveryFee === "number" ? deliveryFee : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-[430px] bg-[#050a18] text-white rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden">
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
              Shop Collection
            </p>
            <h2 className="text-lg font-black leading-none mt-1">
              Collect Fee from Shop
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
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500/15 rounded-2xl mb-4">
              <Store size={28} className="text-blue-400" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
              Delivery Fee to Collect
            </p>
            <h3 className="text-5xl font-black text-white mb-2">
              ${fee.toFixed(2)}
            </h3>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">
              Order #{orderNo || "—"}
            </p>
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-600/5 blur-3xl rounded-full" />
          </div>

          <div className="flex gap-3 p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
            <Store size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              The customer chose to pay at the shop. Collect{" "}
              <span className="text-white font-bold">${fee.toFixed(2)}</span>{" "}
              delivery fee from the shop before marking this order as delivered.
            </p>
          </div>

          <label className="flex items-start gap-3 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-900"
            />
            I confirm ${fee.toFixed(2)} delivery fee has been collected from the shop.
          </label>
        </main>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isConfirmed || isSubmitting}
            className="w-full py-3.5 bg-blue-600 text-white font-black rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Confirm Delivery to Shop"}
          </button>
        </div>
      </div>
    </div>
  );
}
