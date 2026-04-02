"use client";

import { STORAGE_KEYS } from "@/config/common";
import { ToastContext } from "@/contexts/ToastProvider";
import { useLocalStorage } from "@/hooks/localStorage";
import { getBusinessById } from "@/services/businessService";
import { getAddress } from "@/services/geoService";
import { createOrder } from "@/services/orderService";
import { UserAuthResponse } from "@/types/auth";
import { CreateOrderRequest } from "@/types/order";
import { toToastMessage } from "@/utils/toast";
import { CreateOrderSchema } from "@/validations/orderValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Autocomplete,
  GoogleMap,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Info,
  MapPin,
  Notebook,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

type CreateOrderForm = z.infer<typeof CreateOrderSchema>;

type MapTarget = "pickup" | "delivery";

interface LatLng {
  lat: number;
  lng: number;
}

interface PlaceResultLike {
  formatted_address?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
}

interface AutocompleteLike {
  getPlace?: () => PlaceResultLike;
}

interface MapMouseEventLike {
  latLng?: {
    lat: () => number;
    lng: () => number;
  };
}

const DEFAULT_CENTER: LatLng = { lat: 11.5564, lng: 104.9282 };

const toMeasureType = (pricingType?: string) => {
  if (pricingType === "per_item") return "item";
  if (pricingType === "fixed") return "fixed";
  return "kg";
};

const serviceEmoji = (name?: string) => {
  const value = (name || "").toUpperCase();
  if (value.includes("WASH")) return "🧺";
  if (value.includes("DRY")) return "🧥";
  if (value.includes("IRON")) return "👔";
  if (value.includes("FOLD")) return "🧻";
  return "🫧";
};

const safeLatLng = (lat?: number, lng?: number): LatLng | null => {
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
};

const toDateTimeLocalValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const getDefaultSchedule = () => {
  const pickup = new Date();
  pickup.setHours(pickup.getHours() + 1);
  pickup.setMinutes(0, 0, 0);

  const dropoff = new Date(pickup);
  dropoff.setDate(dropoff.getDate() + 1);

  return {
    pickup: toDateTimeLocalValue(pickup),
    dropoff: toDateTimeLocalValue(dropoff),
  };
};

const CustomerOrderPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const businessId = String(params.id || "");
  const toastCtx = useContext(ToastContext);
  const { value: authUser } = useLocalStorage<UserAuthResponse>(
    STORAGE_KEYS.AUTH_USER,
    null,
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const [locationModalTarget, setLocationModalTarget] =
    useState<MapTarget | null>(null);
  const [pickerPosition, setPickerPosition] = useState<LatLng>(DEFAULT_CENTER);
  const [pickerAddress, setPickerAddress] = useState("");
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const autocompleteRef = useRef<AutocompleteLike | null>(null);

  const { data: business, isLoading: isBusinessLoading } = useQuery({
    queryKey: ["business-public", businessId],
    queryFn: () => getBusinessById(businessId),
    enabled: Boolean(businessId),
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<CreateOrderForm>({
    resolver: zodResolver(CreateOrderSchema),
    mode: "onTouched",
    defaultValues: {
      ...(() => {
        const defaults = getDefaultSchedule();
        return {
          scheduledPickupAt: defaults.pickup,
          scheduledDropoffAt: defaults.dropoff,
        };
      })(),
      pickupAddress: "",
      deliveryAddress: "",
      pickupLatitude: 0,
      pickupLongitude: 0,
      deliveryLatitude: 0,
      deliveryLongitude: 0,
      notes: "",
      discount: 0,
      services: [],
    },
  });

  useEffect(() => {
    if (!business) return;
    const defaults = getDefaultSchedule();

    reset({
      pickupAddress: "",
      deliveryAddress: "",
      pickupLatitude: 0,
      pickupLongitude: 0,
      deliveryLatitude: 0,
      deliveryLongitude: 0,
      scheduledPickupAt: defaults.pickup,
      scheduledDropoffAt: defaults.dropoff,
      notes: "",
      discount: 0,
      services: (business.services || []).map((service) => ({
        business_service_id: service.id || "",
        service_name:
          service.laundry_service?.name || `Service #${service.service_id}`,
        unit_price: Number(service.base_price || 0),
        measure_type: toMeasureType(service.pricing_type),
        selected: false,
        quantity: 1,
        note: "",
      })),
    });
  }, [business, reset]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    if (getValues("pickupAddress")) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setPickerPosition({ lat, lng });
        setValue("pickupLatitude", lat, { shouldValidate: true });
        setValue("pickupLongitude", lng, { shouldValidate: true });
        try {
          const address = await getAddress(lat, lng);
          if (!address) return;
          setValue("pickupAddress", address, { shouldValidate: true });
        } catch {
          // Keep empty address if reverse geocoding fails.
        }
      },
      () => {
        // Keep default center when geolocation is unavailable.
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, [getValues, setValue]);

  const createOrderMutation = useMutation({
    mutationFn: (payload: CreateOrderRequest) => createOrder(payload),
    onSuccess: () => {
      toastCtx?.setToast?.({
        error: false,
        message: "Order created successfully.",
      });
      toastCtx?.setIsVisible(true);
      router.push(`/businesses/${businessId}`);
    },
    onError: (e) => {
      const detailRaw = axios.isAxiosError(e)
        ? e.response?.data
        : e instanceof Error
          ? e.message
          : "Failed to create order.";
      const detail =
        typeof detailRaw === "object" &&
        detailRaw !== null &&
        "detail" in detailRaw
          ? (detailRaw as { detail?: unknown }).detail
          : detailRaw;
      toastCtx?.setToast?.({
        error: true,
        message: toToastMessage(detail),
      });
      toastCtx?.setIsVisible(true);
    },
  });

  const services = useWatch({ control, name: "services" }) || [];
  const selectedCount = services.filter((service) => service.selected).length;

  const openLocationModal = (target: MapTarget) => {
    const latField =
      target === "pickup" ? "pickupLatitude" : "deliveryLatitude";
    const lngField =
      target === "pickup" ? "pickupLongitude" : "deliveryLongitude";
    const addressField =
      target === "pickup" ? "pickupAddress" : "deliveryAddress";

    const existing = safeLatLng(getValues(latField), getValues(lngField));
    setPickerPosition(existing || DEFAULT_CENTER);
    setPickerAddress(getValues(addressField) || "");
    setLocationModalTarget(target);
  };

  const reverseGeocode = async (position: LatLng) => {
    setIsResolvingLocation(true);
    try {
      const address = await getAddress(position.lat, position.lng);
      setPickerAddress(address || "");
    } finally {
      setIsResolvingLocation(false);
    }
  };

  const handleMapClick = (event: unknown) => {
    const mouseEvent = event as MapMouseEventLike;
    const lat = mouseEvent.latLng?.lat?.();
    const lng = mouseEvent.latLng?.lng?.();
    if (typeof lat !== "number" || typeof lng !== "number") return;

    const next = { lat, lng };
    setPickerPosition(next);
    void reverseGeocode(next);
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace?.();
    const lat = place?.geometry?.location?.lat?.();
    const lng = place?.geometry?.location?.lng?.();
    if (typeof lat !== "number" || typeof lng !== "number") return;

    setPickerPosition({ lat, lng });
    setPickerAddress(place?.formatted_address || pickerAddress);
  };

  const applyPickedLocation = () => {
    if (!locationModalTarget) return;

    if (locationModalTarget === "pickup") {
      setValue("pickupAddress", pickerAddress, { shouldValidate: true });
      setValue("pickupLatitude", pickerPosition.lat, { shouldValidate: true });
      setValue("pickupLongitude", pickerPosition.lng, { shouldValidate: true });
    } else {
      setValue("deliveryAddress", pickerAddress, { shouldValidate: true });
      setValue("deliveryLatitude", pickerPosition.lat, {
        shouldValidate: true,
      });
      setValue("deliveryLongitude", pickerPosition.lng, {
        shouldValidate: true,
      });
    }

    setLocationModalTarget(null);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setPickerPosition(next);
        await reverseGeocode(next);
      },
      () => {
        toastCtx?.setToast?.({
          error: true,
          message: "Unable to get current location.",
        });
        toastCtx?.setIsVisible(true);
      },
    );
  };

  const onSubmit = (values: CreateOrderForm) => {
    if (!authUser?.id) {
      toastCtx?.setToast?.({
        error: true,
        message: "Please login as customer before creating an order.",
      });
      toastCtx?.setIsVisible(true);
      return;
    }

    const pickupDate = new Date(values.scheduledPickupAt);
    const dropoffDate = new Date(values.scheduledDropoffAt);
    if (
      Number.isNaN(pickupDate.getTime()) ||
      Number.isNaN(dropoffDate.getTime())
    ) {
      toastCtx?.setToast?.({
        error: true,
        message: "Invalid schedule date/time.",
      });
      toastCtx?.setIsVisible(true);
      return;
    }

    const selectedItems = values.services
      .filter((service) => service.selected)
      .map((service) => ({
        business_service_id: service.business_service_id,
        quantity: Number(service.quantity),
        note: service.note?.trim() || "",
      }));

    const hasDeliveryAddress = Boolean(values.deliveryAddress?.trim());
    const payload: CreateOrderRequest = {
      customer_id: authUser.id,
      business_id: businessId,
      pickup_method: "PICKUP",
      pickup_address: values.pickupAddress.trim(),
      delivery_address:
        values.deliveryAddress?.trim() || values.pickupAddress.trim(),
      notes: values.notes?.trim() || "",
      discount: Number(values.discount || 0),
      scheduled_pickup_at: pickupDate.toISOString(),
      scheduled_dropoff_at: dropoffDate.toISOString(),
      pickup_latitude: Number(values.pickupLatitude || 0),
      pickup_longitude: Number(values.pickupLongitude || 0),
      delivery_latitude: hasDeliveryAddress
        ? Number(values.deliveryLatitude || 0)
        : Number(values.pickupLatitude || 0),
      delivery_longitude: hasDeliveryAddress
        ? Number(values.deliveryLongitude || 0)
        : Number(values.pickupLongitude || 0),
      items: selectedItems,
    };

    createOrderMutation.mutate(payload);
  };

  const locationModalTitle = useMemo(() => {
    if (locationModalTarget === "pickup") return "Select Pickup Location";
    if (locationModalTarget === "delivery") return "Select Delivery Location";
    return "Select Location";
  }, [locationModalTarget]);

  if (isBusinessLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 text-slate-500 dark:text-slate-400">
        Loading services...
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-32"
      >
        <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 p-4">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Create Order
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-6 space-y-10">
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Select Services
              </h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase">
                Measured by shop
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {services.map((service, index) => {
                const isSelected = service.selected;
                return (
                  <div
                    key={
                      service.business_service_id ||
                      `${service.service_name}-${index}`
                    }
                    onClick={() =>
                      setValue(`services.${index}.selected`, !isSelected, {
                        shouldValidate: true,
                      })
                    }
                    className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-white shadow-lg shadow-blue-50"
                        : "border-white bg-white hover:border-slate-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-colors ${isSelected ? "bg-blue-600" : "bg-slate-100"}`}
                        >
                          {serviceEmoji(service.service_name)}
                        </div>
                        <div>
                          <p
                            className={`font-bold ${isSelected ? "text-blue-600" : "text-slate-900"}`}
                          >
                            {service.service_name}
                          </p>
                          <p className="text-xs font-bold text-slate-400">
                            ${service.unit_price.toFixed(2)} /{" "}
                            {service.measure_type}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                            : "border-slate-100 text-slate-200"
                        }`}
                      >
                        {isSelected ? (
                          <Check size={20} strokeWidth={3} />
                        ) : (
                          <Plus size={20} />
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        className="mt-4 space-y-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="rounded-2xl bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700">
                          Quantity will be measured later at the store.
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                            Note
                          </label>
                          <input
                            type="text"
                            placeholder="Optional note"
                            {...register(`services.${index}.note`)}
                            className="w-full mt-1 px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {errors.services?.message && (
              <p className="text-red-600 text-sm px-2">
                {errors.services.message}
              </p>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
              Pickup & Delivery
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="space-y-1 relative">
                <div className="relative z-10">
                  <div className="absolute left-4 top-4 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <input
                    type="text"
                    {...register("pickupAddress")}
                    placeholder="Pickup Address (e.g. Block B, Room 302)"
                    className="w-full pl-14 pr-14 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => openLocationModal("pickup")}
                    className="absolute right-3 top-2.5 p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                    aria-label="Pick pickup location from map"
                  >
                    <MapPin size={18} />
                  </button>
                  {errors.pickupAddress && (
                    <p className="text-red-600 text-xs mt-1 ml-2">
                      {errors.pickupAddress.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-start pl-6 py-1">
                  <div className="w-0.5 h-6 border-l-2 border-dashed border-slate-200" />
                </div>

                <div className="relative z-10">
                  <div className="absolute left-4 top-4 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                    <MapPin size={12} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    {...register("deliveryAddress")}
                    placeholder="Delivery Address (Leave blank if same as pickup)"
                    className="w-full pl-14 pr-14 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => openLocationModal("delivery")}
                    className="absolute right-3 top-2.5 p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                    aria-label="Pick delivery location from map"
                  >
                    <MapPin size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                    Pickup Time
                  </label>
                  <div className="relative min-w-0 p-2">
                    <Calendar
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="datetime-local"
                      {...register("scheduledPickupAt")}
                      className="w-full min-w-0 pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs sm:text-sm font-semibold outline-none dark:text-slate-100"
                    />
                  </div>
                  {errors.scheduledPickupAt && (
                    <p className="text-red-600 text-xs ml-2">
                      {errors.scheduledPickupAt.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2 min-w-0">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                    Expected Drop-off
                  </label>
                  <div className="relative min-w-0">
                    <Clock
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="datetime-local"
                      {...register("scheduledDropoffAt")}
                      className="w-full min-w-0 pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs sm:text-sm font-semibold outline-none dark:text-slate-100"
                    />
                  </div>
                  {errors.scheduledDropoffAt && (
                    <p className="text-red-600 text-xs ml-2">
                      {errors.scheduledDropoffAt.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">
              Special Notes
            </h3>
            <div className="relative">
              <Notebook
                className="absolute left-5 top-5 text-slate-300"
                size={20}
              />
              <textarea
                {...register("notes")}
                placeholder="Ex: Separate whites, extra softener, or fragile items..."
                className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] h-32 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium resize-none dark:text-slate-100"
              />
            </div>
          </section>

          <input
            type="hidden"
            {...register("pickupLatitude", { valueAsNumber: true })}
          />
          <input
            type="hidden"
            {...register("pickupLongitude", { valueAsNumber: true })}
          />
          <input
            type="hidden"
            {...register("deliveryLatitude", { valueAsNumber: true })}
          />
          <input
            type="hidden"
            {...register("deliveryLongitude", { valueAsNumber: true })}
          />

          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex gap-4 items-start">
            <div className="bg-white p-2 rounded-xl text-blue-600 shadow-sm">
              <Info size={20} />
            </div>
            <p className="text-xs text-blue-700/80 font-semibold leading-relaxed">
              Final pricing will be confirmed after your laundry is weighed at
              the shop. You will be notified once it is processed.
            </p>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-40">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                Services Selected
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                {selectedCount} Types
              </span>
            </div>
            <button
              type="submit"
              disabled={selectedCount === 0 || createOrderMutation.isPending}
              className="flex-1 bg-blue-600 text-white font-black text-lg py-4 rounded-[1.8rem] shadow-xl shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-200 disabled:shadow-none transition-all flex items-center justify-center gap-3"
            >
              {createOrderMutation.isPending
                ? "Placing..."
                : "Confirm & Place Order"}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </form>

      {locationModalTarget && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {locationModalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setLocationModalTarget(null)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!apiKey ? (
                <p className="text-sm text-red-600">
                  Missing `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for map picker.
                </p>
              ) : !isMapLoaded ? (
                <p className="text-sm text-slate-500">Loading map...</p>
              ) : (
                <>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <Autocomplete
                        onLoad={(instance) => {
                          autocompleteRef.current =
                            instance as AutocompleteLike;
                        }}
                        onPlaceChanged={handlePlaceChanged}
                      >
                        <input
                          type="text"
                          placeholder="Search location"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 ring-blue-500 outline-none dark:text-slate-100"
                        />
                      </Autocomplete>
                    </div>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Current
                    </button>
                  </div>

                  <GoogleMap
                    center={pickerPosition}
                    zoom={14}
                    mapContainerClassName="h-80 w-full rounded-2xl border border-slate-200"
                    onClick={handleMapClick}
                    options={{
                      mapTypeControl: false,
                      streetViewControl: false,
                    }}
                  >
                    <MarkerF
                      position={pickerPosition}
                      draggable
                      onDragEnd={handleMapClick}
                    />
                  </GoogleMap>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {isResolvingLocation
                      ? "Resolving address..."
                      : pickerAddress || "No address selected"}
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setLocationModalTarget(null)}
                className="px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!pickerAddress}
                onClick={applyPickedLocation}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold disabled:bg-slate-300"
              >
                Apply Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerOrderPage;
