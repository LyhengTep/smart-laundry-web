"use client";

import { ArrowRight, MapPin, Store } from "lucide-react";

interface BusinessShopCardProps {
  shop: any;
  onSelect: (shop: any) => void;
}

export const BusinessShopCard = ({ shop, onSelect }: BusinessShopCardProps) => {
  return (
    <>
      <div
        key={shop.id}
        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group cursor-pointer"
        onClick={() => {
          onSelect(shop);
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Store size={24} />
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${shop.status === "Open" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}
          >
            {shop.status.toUpperCase()}
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">{shop.name}</h3>
        <div className="flex items-center gap-1 text-slate-400 text-sm mt-1 mb-6">
          <MapPin size={14} /> {shop.location}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="text-sm">
            <span className="font-bold text-blue-600">{shop.orders}</span>
            <span className="text-slate-500 ml-1">Active Orders</span>
          </div>
          <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight size={20} />
          </div>
        </div>
      </div>
    </>
  );
};
