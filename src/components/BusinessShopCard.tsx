"use client";

import { Business } from "@/types/business";
import { ArrowRight, MapPin, Store, Trash2 } from "lucide-react";

interface BusinessShopCardProps {
  shop: Business;
  onSelect: (shop: Business) => void;
  onRemove?: (shop: Business) => void;
  removing?: boolean;
}

export const BusinessShopCard = ({
  shop,
  onSelect,
  onRemove,
  removing = false,
}: BusinessShopCardProps) => {
  const normalizedStatus = (shop.status || "").toUpperCase();
  const isPending = normalizedStatus === "PENDING";
  const statusClasses =
    normalizedStatus === "APPROVED"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : normalizedStatus === "PENDING"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <div
      key={shop.id}
      className={`rounded-3xl p-6 border shadow-sm transition-all group cursor-pointer relative overflow-hidden ${
        isPending
          ? "bg-slate-100 border-slate-300 text-slate-500"
          : "bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:shadow-xl hover:border-blue-200"
      }`}
      onClick={() => {
        onSelect(shop);
      }}
    >
      {!isPending && (
        <div className="absolute -top-12 -right-12 size-32 rounded-full bg-blue-100/40 blur-2xl" />
      )}

      <div className="relative">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`p-3 rounded-2xl transition-colors ${
              isPending
                ? "bg-slate-200 text-slate-500"
                : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
            }`}
          >
            <Store size={24} />
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${statusClasses}`}
          >
            {normalizedStatus || "N/A"}
          </span>
        </div>

        <h3
          className={`text-xl font-bold mb-2 ${isPending ? "text-slate-600" : "text-slate-900"}`}
        >
          {shop.name}
        </h3>

        <div
          className={`inline-flex max-w-full items-center gap-2 rounded-xl px-3 py-2 mb-6 ${
            isPending
              ? "bg-slate-200 text-slate-500"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <MapPin size={14} className="shrink-0" />
          <span className="text-sm truncate">{shop.address}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="text-sm">
            <span
              className={
                isPending
                  ? "font-bold text-slate-500"
                  : "font-bold text-blue-600"
              }
            >
              {normalizedStatus || "UNKNOWN"}
            </span>
            <span className="text-slate-500 ml-1">Status</span>
          </div>
          <div className="flex items-center gap-2">
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(shop);
                }}
                disabled={removing}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} />
                {removing ? "Removing..." : "Remove"}
              </button>
            )}
            <div
              className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                isPending ? "text-slate-500" : "text-blue-600"
              }`}
            >
              <ArrowRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
