import { DEFAULT_SHOP_IMAGE } from "@/config/common";
import { Business } from "@/types/business";
import { formatTime, resolveBusinessImage } from "@/utils/common";
import { toTimeMinutes } from "@/utils/date";
import { Clock3, MapPin, Star } from "lucide-react";
import Link from "next/link";

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
export function ShopCard({ shop }: { shop: Business }) {
  const open = isOpenNow(shop);
  const imageUrl =
    resolveBusinessImage(shop.cover_image_url || shop.profile_image_url) ||
    DEFAULT_SHOP_IMAGE;

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
              if (e.currentTarget.dataset.fallbackApplied === "true") return;
              e.currentTarget.dataset.fallbackApplied = "true";
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
              <span className="text-sm">
                {(shop.review_summary?.average_rating ?? shop.rating_avg ?? 0).toFixed(1)}
              </span>
              {(shop.review_summary?.total_reviews ?? 0) > 0 && (
                <span className="text-xs text-slate-400 font-normal">
                  ({shop.review_summary!.total_reviews})
                </span>
              )}
            </div>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 line-clamp-2 flex items-start gap-2">
            <MapPin
              size={14}
              className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500"
            />
            <span>{shop.address || "-"}</span>
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
            <Clock3
              size={14}
              className="shrink-0 text-slate-400 dark:text-slate-500"
            />
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
