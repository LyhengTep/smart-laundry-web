"use client";

import { BASE_URL } from "@/config/common";
import { STORAGE_KEYS } from "@/config/common";
import { useLocalStorage } from "@/hooks/localStorage";
import { getBusinessById } from "@/services/businessService";
import { UserAuthResponse } from "@/types/auth";
import { BusinessResponse, PricingType } from "@/types/business";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Info,
  MapPin,
  Phone,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const resolveImageUrl = (value?: string) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${BASE_URL}${value}`;
};

const toTimeMinutes = (value?: string) => {
  if (!value) return null;
  const date = new Date(`1970-01-01T${value}`);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};

const formatTime = (value?: string) => {
  if (!value) return "-";
  return value.slice(0, 5);
};

const isOpenNow = (business: BusinessResponse) => {
  const normalized = (business.status || "").toUpperCase();
  if (!["ACTIVE", "APPROVED", "OPEN"].includes(normalized)) return false;

  const open = toTimeMinutes(business.open_time);
  const close = toTimeMinutes(business.close_time);
  if (open === null || close === null) return true;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (open === close) return true;
  if (close > open) return currentMinutes >= open && currentMinutes < close;
  return currentMinutes >= open || currentMinutes < close;
};

const formatPricingType = (pricingType?: PricingType) => {
  if (!pricingType) return "";
  if (pricingType === "per_kg") return "/ kg";
  if (pricingType === "per_item") return "/ item";
  return "";
};

const ShopProfilePage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const businessId = String(params.id || "");
  const { value: authUser } = useLocalStorage<UserAuthResponse | null>(
    STORAGE_KEYS.AUTH_USER,
    null,
  );

  const {
    data: business,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["business-public", businessId],
    queryFn: () => getBusinessById(businessId),
    enabled: Boolean(businessId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-8 text-slate-500 dark:text-slate-400">
        Loading shop...
      </div>
    );
  }

  if (isError || !business) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-6 text-red-700 dark:text-red-300">
          Failed to load business detail.
        </div>
      </div>
    );
  }

  const coverImage =
    resolveImageUrl(business.cover_image_url) ||
    "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=1200&auto=format&fit=crop";
  const open = isOpenNow(business);
  const offeredServices = (business.services || []).slice(0, 6);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <img
          src={coverImage}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-6 left-6 right-6 flex justify-between z-10">
          <button
            onClick={() => router.replace("/")}
            className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:bg-white transition-all"
          >
            <ArrowLeft size={20} className="text-slate-900" />
          </button>
          <div className="flex gap-3">
            <button className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:bg-white transition-all">
              <Share2 size={20} className="text-slate-900" />
            </button>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase ${
                    open ? "bg-green-500" : "bg-slate-500"
                  }`}
                >
                  {open ? "Open Now" : "Closed"}
                </span>
                <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                  <Star size={16} fill="currentColor" />{" "}
                  {(business.rating_avg ?? 0).toFixed(1)}
                </div>
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {business.name}
              </h1>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <MapPin size={18} className="text-blue-600 shrink-0" />
                <span className="line-clamp-2">{business.address}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!authUser?.id) {
                  const redirectTo = encodeURIComponent(
                    `/businesses/${businessId}/order`,
                  );
                  router.push(`/auth/login?redirect=${redirectTo}`);
                  return;
                }
                router.push(`/businesses/${businessId}/order`);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-black text-base md:text-lg rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all whitespace-nowrap self-start"
            >
              <ShoppingBag size={20} />
              Order Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-slate-50 dark:border-slate-800">
            <DetailTile
              icon={<Clock className="text-blue-600" />}
              label="Operating Hours"
              value={`${formatTime(business.open_time)} - ${formatTime(business.close_time)}`}
            />
            <DetailTile
              icon={<Phone className="text-blue-600" />}
              label="Contact Support"
              value={business.phone || "-"}
            />
            <DetailTile
              icon={<ShieldCheck className="text-blue-600" />}
              label="Service Quality"
              value={open ? "Open for service" : "Currently closed"}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="space-y-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Info size={20} className="text-blue-600" /> About the Shop
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {business.name} provides professional laundry services with
            transparent pricing and scheduled pickup/dropoff support.
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
              Popular Services
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offeredServices.length > 0 ? (
              offeredServices.map((service) => (
                <PriceCard
                  key={String(service.id || service.service_id)}
                  title={
                    service.laundry_service?.name ||
                    `Service #${service.service_id}`
                  }
                  price={`$${(service.base_price ?? 0).toFixed(2)}${formatPricingType(service.pricing_type)}`}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No service pricing available.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const DetailTile = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  </div>
);

const PriceCard = ({ title, price }: { title: string; price: string }) => (
  <div className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-100 transition-all group cursor-pointer shadow-sm hover:shadow-md">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold">
        {title[0]}
      </div>
      <p className="font-bold text-slate-900 dark:text-slate-100">{title}</p>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-black text-slate-900 dark:text-slate-100">
        {price}
      </span>
      <ChevronRight
        size={18}
        className="text-slate-300 group-hover:text-blue-600 transition-colors"
      />
    </div>
  </div>
);

export default ShopProfilePage;
