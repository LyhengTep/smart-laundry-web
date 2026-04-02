"use client";

import Navbar from "@/components/Navbar";
import { BASE_URL } from "@/config/common";
import { STORAGE_KEYS } from "@/config/common";
import { useBusinesses } from "@/hooks/businesses/businessHook";
import { useLocalStorage } from "@/hooks/localStorage";
import { clearAuthSession, logout } from "@/services/authService";
import { UserAuthResponse } from "@/types/auth";
import { Business } from "@/types/business";
import { Clock3, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const toTimeMinutes = (value?: string) => {
  if (!value) return null;
  const date = new Date(`1970-01-01T${value}`);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};

const formatTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(`1970-01-01T${value}`);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isAvailableBusiness = (status?: string) => {
  const normalized = (status || "").toUpperCase();
  return (
    normalized === "ACTIVE" ||
    normalized === "APPROVED" ||
    normalized === "OPEN"
  );
};

const isOpenNow = (business: Business) => {
  if (!isAvailableBusiness(business.status)) return false;

  const open = toTimeMinutes(business.open_time);
  const close = toTimeMinutes(business.close_time);
  if (open === null || close === null) return true;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (open === close) return true;
  if (close > open) return currentMinutes >= open && currentMinutes < close;
  return currentMinutes >= open || currentMinutes < close;
};

const DEFAULT_SHOP_IMAGE =
  "https://images.unsplash.com/photo-1545173168-9f1947e8017e?q=80&w=1200";

const resolveBusinessImage = (value?: string) => {
  if (!value || value === "string") return DEFAULT_SHOP_IMAGE;
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:")
  ) {
    return value;
  }
  return `${BASE_URL}${value}`;
};

export default function Home() {
  const { value, setValue } = useLocalStorage<UserAuthResponse | null>(
    STORAGE_KEYS.AUTH_USER,
    null,
  );
  const { data, isLoading, isError } = useBusinesses({ page: 1, size: 12 });
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const shops = useMemo(() => {
    const available = (data?.items || []).filter((business) =>
      isAvailableBusiness(business.status),
    );
    return showOpenOnly
      ? available.filter((business) => isOpenNow(business))
      : available;
  }, [data?.items, showOpenOnly]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar
        user={value}
        onLogout={() => {
          const doLogout = async () => {
            try {
              if (value?.id && value?.role) {
                await logout({
                  user_id: value.id,
                  role: value.role,
                });
              }
            } catch (error) {
              console.log("Logout API failed", error);
            } finally {
              clearAuthSession();
              setValue(null);
            }
          };
          void doLogout();
        }}
      />

      <header className="bg-white dark:bg-slate-900 pt-12 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight">
            Laundry Day, <span className="text-blue-600">Simplified.</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            Choose from available shops near your location with clear business
            hours and pickup convenience.
          </p>

          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-2 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Track Order ID (e.g., ORD-123)..."
              className="flex-1 px-6 py-4 focus:outline-none text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-xl"
            />
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
              Find My Order
            </button>
          </div>
        </div>
      </header>

      <section id="shops" className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Recommended Shops
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {isLoading
                ? "Loading businesses..."
                : `${shops.length} shop(s) available`}
            </p>
          </div>
          <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowOpenOnly(false)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                !showOpenOnly
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setShowOpenOnly(true)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                showOpenOnly
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Open Now
            </button>
          </div>
        </div>

        {isError && (
          <div className="rounded-2xl border border-red-100 bg-red-50 dark:bg-red-950/30 dark:border-red-900 px-5 py-4 text-red-700 dark:text-red-300">
            Failed to load businesses. Please try again.
          </div>
        )}

        {!isError && !isLoading && shops.length === 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-10 text-center text-slate-500 dark:text-slate-400">
            No available shops found.
          </div>
        )}

        {!isError && shops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-blue-600 rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">
              Own a Laundry Business?
            </h2>
            <p className="text-blue-100 opacity-90">
              Manage your orders and reach more students today.
            </p>
          </div>
          <button className="bg-white dark:bg-slate-100 text-blue-600 px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition shadow-2xl">
            Register Shop
          </button>
        </div>
      </section>
    </div>
  );
}

function ShopCard({ shop }: { shop: Business }) {
  const open = isOpenNow(shop);
  const imageUrl = resolveBusinessImage(
    shop.cover_image_url || shop.profile_image_url,
  );

  return (
    <article
      className={`group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-800 flex flex-col ${
        !open && "opacity-80"
      } hover:-translate-y-0.5`}
    >
      <Link href={`/businesses/${shop.id}`} className="block">
        <div className="relative h-48">
          <img
            src={imageUrl}
            className={`w-full h-full object-cover ${!open && "grayscale"}`}
            alt={shop.name}
            onError={(e) => {
              if (e.currentTarget.src === DEFAULT_SHOP_IMAGE) return;
              e.currentTarget.src = DEFAULT_SHOP_IMAGE;
            }}
          />
          <span
            className={`absolute top-4 right-4 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${
              open ? "bg-green-500" : "bg-slate-500"
            }`}
          >
            {open ? "OPEN" : "CLOSED"}
          </span>
        </div>
        <div className="p-6 flex flex-1 flex-col">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
              {shop.name}
            </h3>
            <div className="flex items-center gap-1 text-amber-500 font-bold shrink-0">
              <Star size={14} fill="currentColor" />
              <span className="text-sm">{(shop.rating_avg ?? 0).toFixed(1)}</span>
            </div>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 line-clamp-2 flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
            <span>{shop.address || "-"}</span>
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
            <Clock3 size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
            <span>
              {formatTime(shop.open_time)} - {formatTime(shop.close_time)}
            </span>
          </p>
        </div>
      </Link>

      <div className="px-6 pb-6 mt-auto">
        <Link
          href={`/businesses/${shop.id}/order`}
          className={`w-full py-3 font-bold rounded-2xl transition-all flex items-center justify-center text-center ${
            open
              ? "bg-slate-900 text-white hover:bg-blue-600"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          Order Now
        </Link>
      </div>
    </article>
  );
}
