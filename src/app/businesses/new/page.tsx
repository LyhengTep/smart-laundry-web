"use client";

import { ServicesPricingStep } from "@/components/ServicesPricing";
import { DialogCtx } from "@/contexts/DialogProvider";
import { ToastContext } from "@/contexts/ToastProvider";
import { useLaundryServices } from "@/hooks/businesses/laundryServiceHook";
import {
  createBusiness,
  createBusinessServices,
} from "@/services/businessService";
import { uploadFile } from "@/services/file";
import { getAddress } from "@/services/geoService";
import { BusinessRequest, BusinessServiceRequest } from "@/types/business";
import { FileResponse } from "@/types/fileType";
import { formatLaundryServiceType } from "@/utils/common";
import { CreateBusinessBasicSchema } from "@/validations/businessValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Autocomplete,
  GoogleMap,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useMutation } from "@tanstack/react-query";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Scissors,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface CreateShopFormProps {
  onClose: () => void;
}

type CreateBusinessForm = z.infer<typeof CreateBusinessBasicSchema>;
type FormServiceItem = CreateBusinessForm["services"][number];

const DEFAULT_SERVICES: FormServiceItem[] = [
  {
    id: "1",
    name: "WASH",
    unitType: "per_kg",
    price: 0,
    enabled: false,
    image:
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "DRY_CLEAN",
    unitType: "per_item",
    price: 0,
    enabled: false,
    image:
      "https://images.unsplash.com/photo-1549037173-e3b717902c57?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "3",
    name: "IRON",
    unitType: "per_item",
    price: 0,
    enabled: false,
    image:
      "https://images.unsplash.com/photo-1662221156544-3355c817ed74?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const mapLaundryServicesToForm = (
  items: Array<{
    id?: number;
    name?: string;
    code?: string;
    description?: string;
  }>,
): FormServiceItem[] =>
  items.map((service) => ({
    id: String(service.id ?? crypto.randomUUID()),
    name: service.name || "Laundry Service",
    unitType: "per_kg",
    price: 0,
    enabled: false,
    image:
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=400&auto=format&fit=crop",
  }));

const CreateShopForm = ({ onClose }: CreateShopFormProps) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [step, setStep] = useState(1);
  const [coverPreview, setCoverPreview] = useState("");
  const autocompleteRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const geolocationInitializedRef = useRef(false);
  const geolocationRetriedRef = useRef(false);
  const pendingGeocodeRef = useRef<{ lat: number; lng: number } | null>(null);
  const [geocoderReady, setGeocoderReady] = useState(false);
  const {
    setValue,
    watch,
    trigger,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateBusinessForm>({
    resolver: zodResolver(CreateBusinessBasicSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      openTime: "08:00",
      closeTime: "20:00",
      latitude: 0,
      longitude: 0,
      category: "Standard",
      basePrice: "",
      hours: "08:00 - 20:00",
      services: DEFAULT_SERVICES,
      image: undefined,
    },
    mode: "onSubmit",
  });
  const watchedName = watch("name");
  const watchedPhone = watch("phone");
  const watchedAddress = watch("address");
  const watchedOpenTime = watch("openTime");
  const watchedCloseTime = watch("closeTime");
  const watchedLatitude = watch("latitude");
  const watchedLongitude = watch("longitude");
  const watchedImage = watch("image");
  const watchedServices = watch("services");
  const { data: laundryServiceData } = useLaundryServices();
  const router = useRouter();
  const toastCtx = useContext(ToastContext);
  const dialogCtx = useContext(DialogCtx);
  const uploadCover = useMutation({
    mutationFn: (file: File): Promise<FileResponse> => uploadFile(file),
    onSuccess: (data) => {
      console.log("File uploaded successfully:", data);
      // You can set the uploaded file URL to the form state here if needed
      // setValue("imageUrl", data.url);
    },
    onError: (error) => {
      console.error("File upload failed:", error);
    },
  });

  const createBiz = useMutation({
    mutationFn: (data: BusinessRequest) => createBusiness(data),
  });

  const createBizServices = useMutation({
    mutationFn: (data: BusinessServiceRequest[]) =>
      createBusinessServices(data),
  });

  console.log("Laundry service data from API:", laundryServiceData);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const mapCenter = {
    lat: watchedLatitude || 11.5564,
    lng: watchedLongitude || 104.9282,
  };

  const syncAddressFromLatLng = (lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (results: any, status: string) => {
        const primaryResult =
          status === "OK" && results && results[0] ? results[0] : null;
        let address = "";
        if (primaryResult) {
          const components = primaryResult.address_components || [];
          const preferredComponent =
            components.find((c: any) => c.types?.includes("locality")) ||
            components.find((c: any) =>
              c.types?.includes("administrative_area_level_1"),
            ) ||
            components.find((c: any) => c.types?.includes("sublocality"));
          address =
            preferredComponent?.long_name || primaryResult.formatted_address;
        }
        if (address) {
          setValue("address", address, { shouldValidate: true });
        }
        setValue("latitude", lat);
        setValue("longitude", lng);
      },
    );
  };

  const handleMapClick = (e: any) => {
    if (!e?.latLng) return;
    syncAddressFromLatLng(e.latLng.lat(), e.latLng.lng());
  };

  const handleMarkerDragEnd = (e: any) => {
    if (!e?.latLng) return;
    syncAddressFromLatLng(e.latLng.lat(), e.latLng.lng());
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace?.();
    if (!place?.geometry?.location) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    mapRef.current?.panTo({ lat, lng });
    mapRef.current?.setZoom(15);
    if (place.formatted_address) {
      setValue("address", place.formatted_address, { shouldValidate: true });
    }
    setValue("latitude", lat);
    setValue("longitude", lng);
  };

  const handleCoverFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
    setValue("image", file);
  };

  const onSubmit = async (data: CreateBusinessForm) => {
    // Prevent accidental form submission from Enter key before review step.
    if (step !== 3) return;

    console.log("Form submitted with data:", data);
    try {
      let bizPayload: BusinessRequest = {
        name: data.name,
        address: data.address,
        phone: data.phone,
        latitude: data.latitude,
        longitude: data.longitude,
        profile_image_url: "",
        cover_image_url: "",
        business_license_number: "N/A",
        open_time: data.openTime,
        close_time: data.closeTime,
      };

      if (data.image) {
        let image = await uploadCover.mutateAsync(data.image);
        bizPayload.cover_image_url = image.url;
      }

      let bizResponse = await createBiz.mutateAsync(bizPayload);
      console.log("Business created:", bizResponse);
      let filteredServices = (data.services || []).filter(
        (service) => service.enabled,
      );
      let bizServices: BusinessServiceRequest[] = (filteredServices || []).map(
        (service) => {
          return {
            business_id: bizResponse.id,
            service_id: service.id,
            base_price: service.price,
            pricing_type: service.unitType,
          };
        },
      );
      console.log("Business services to create:", bizServices);
      let bizServiceResponse = await createBizServices.mutateAsync(bizServices);

      console.log("Business services created:", bizServiceResponse);

      toastCtx?.setToast &&
        toastCtx?.setToast({
          error: false,
          message: "Business created successfully!",
        });
      toastCtx.setIsVisible(true);
      router.replace("/businesses");
    } catch (error) {
      console.error("create shop error:", error);
      toastCtx?.setToast &&
        toastCtx?.setToast({
          error: true,
          message: "Failed to create business!",
        });
      toastCtx.setIsVisible(true);
    }
  };

  useEffect(() => {
    if (!isLoaded || geolocationInitializedRef.current) return;
    if (!navigator.geolocation) return;

    geolocationInitializedRef.current = true;
    const applyLocation = async (position: GeolocationPosition) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      let name = await getAddress(lat, lng);
      setValue("address", name, {
        shouldValidate: false,
      });
      setValue("latitude", lat);
      setValue("longitude", lng);

      mapRef.current?.panTo({ lat, lng });
      mapRef.current?.setZoom(15);
      if (geocoderReady) {
        syncAddressFromLatLng(lat, lng);
      } else {
        pendingGeocodeRef.current = { lat, lng };
      }
    };

    const handleLocationError = (error: GeolocationPositionError) => {
      // CoreLocation can return POSITION_UNAVAILABLE intermittently; retry once with relaxed options.
      if (
        error.code === error.POSITION_UNAVAILABLE &&
        !geolocationRetriedRef.current
      ) {
        geolocationRetriedRef.current = true;
        navigator.geolocation.getCurrentPosition(
          applyLocation,
          () => {
            // Keep fallback center if location remains unavailable.
          },
          { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 },
        );
        return;
      }

      // Keep fallback center if permission denied or location is unavailable.
    };

    navigator.geolocation.getCurrentPosition(
      applyLocation,
      handleLocationError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, [isLoaded, geocoderReady, setValue]);

  useEffect(() => {
    if (!isLoaded) return;
    const googleMaps = (window as any).google?.maps;
    if (!googleMaps) return;
    if (!geocoderRef.current) {
      geocoderRef.current = new googleMaps.Geocoder();
    }
    setGeocoderReady(true);
  }, [isLoaded]);

  useEffect(() => {
    // Clean up old fallback values from previous builds/hot-reload state.
    if (/^Current Location \(.+\)$/.test(watchedAddress || "")) {
      setValue("address", "", { shouldValidate: false });
    }
  }, [watchedAddress, setValue]);

  useEffect(() => {
    if (!geocoderReady || !pendingGeocodeRef.current) return;
    const { lat, lng } = pendingGeocodeRef.current;
    syncAddressFromLatLng(lat, lng);
    pendingGeocodeRef.current = null;
  }, [geocoderReady]);

  useEffect(() => {
    const items = laundryServiceData || [];
    if (items.length === 0) return;
    const mapped = mapLaundryServicesToForm(items);

    console.log("Mapped laundry services for form:", mapped);
    setValue("services", mapped, { shouldDirty: true });
  }, [laundryServiceData, setValue]);

  const handleContinue = async () => {
    if (step === 1) {
      const isValid = await trigger([
        "name",
        "phone",
        "address",
        "openTime",
        "closeTime",
      ]);
      if (!isValid) return;
    }
    nextStep();
  };

  const isSubmitting =
    uploadCover.isPending || createBiz.isPending || createBizServices.isPending;

  const handleLaunchClick = () => {
    dialogCtx.open({
      title: "Launch this shop?",
      description:
        "Your shop will be created and submitted for review. Continue?",
      confirmLabel: "Yes, Launch",
      tone: "success",
      onConfirm: () => {
        void handleSubmit(onSubmit)();
      },
    });
  };

  let shopName = watch("name");
  const enabledServices = (watchedServices || []).filter(
    (service) => service.enabled,
  );

  const formatUnitType = (unitType: "per_kg" | "per_item" | "fixed") => {
    if (unitType === "per_kg") return "per kg";
    if (unitType === "per_item") return "per item";
    return "fixed";
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
      {/* Progress Bar */}
      <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-b border-slate-100">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step >= num
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {step > num ? <Check size={16} /> : num}
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${step >= num ? "text-blue-600" : "text-slate-400"}`}
            >
              {num === 1 ? "Identity" : num === 2 ? "Services" : "Launch"}
            </span>
            {num < 3 && <div className="w-12 h-px bg-slate-200 ml-2" />}
          </div>
        ))}
      </div>
      <form
        className="p-10"
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && step < 3) {
            e.preventDefault();
          }
        }}
      >
        <div>
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <header>
                <h2 className="text-2xl font-bold text-slate-900">
                  Basic Shop Info
                </h2>
                <p className="text-slate-500">
                  How should customers find your shop?
                </p>
              </header>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bubbles & Suds North"
                    value={watchedName}
                    onChange={(e) => {
                      setValue("name", e.target.value, {
                        shouldValidate: true,
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  {errors.name?.message && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0977777777"
                    value={watchedPhone}
                    onChange={(e) => {
                      setValue("phone", e.target.value, {
                        shouldValidate: true,
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  {errors.phone?.message && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Location Address
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-4 top-3.5 text-slate-400"
                      size={18}
                    />
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={(autocomplete) => {
                          autocompleteRef.current = autocomplete;
                        }}
                        onPlaceChanged={handlePlaceChanged}
                        options={{
                          fields: ["formatted_address", "geometry", "name"],
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Search campus location..."
                          value={watchedAddress}
                          onChange={(e) => {
                            setValue("address", e.target.value, {
                              shouldValidate: true,
                            });
                          }}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </Autocomplete>
                    ) : (
                      <input
                        type="text"
                        placeholder="Search campus location..."
                        value={watchedAddress}
                        onChange={(e) => {
                          setValue("address", e.target.value, {
                            shouldValidate: true,
                          });
                        }}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    )}
                  </div>
                  {errors.address?.message && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                  <div className="mt-3 space-y-2">
                    {!apiKey ? (
                      <p className="text-xs text-red-600">
                        Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Map picker is
                        disabled.
                      </p>
                    ) : loadError ? (
                      <p className="text-xs text-red-600">
                        Failed to load Google Maps.
                      </p>
                    ) : !isLoaded ? (
                      <p className="text-xs text-slate-500">Loading map...</p>
                    ) : (
                      <>
                        <GoogleMap
                          center={mapCenter}
                          zoom={14}
                          onLoad={(map) => {
                            mapRef.current = map;
                            const googleMaps = (window as any).google?.maps;
                            if (googleMaps) {
                              geocoderRef.current = new googleMaps.Geocoder();
                              setGeocoderReady(true);
                            }
                          }}
                          onClick={handleMapClick}
                          mapContainerClassName="h-64 w-full rounded-xl border border-slate-200 bg-slate-100"
                          options={{
                            mapTypeControl: false,
                            streetViewControl: false,
                          }}
                        >
                          <MarkerF
                            position={mapCenter}
                            draggable
                            onDragEnd={handleMarkerDragEnd}
                          />
                        </GoogleMap>
                        <p className="text-xs text-slate-500">
                          Click map or drag pin to set location.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Operating Hour
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                      <Clock
                        className="absolute left-4 top-3.5 text-slate-400"
                        size={18}
                      />
                      <input
                        type="time"
                        value={watchedOpenTime}
                        onChange={(e) => {
                          const openTime = e.target.value;
                          setValue("openTime", openTime, {
                            shouldValidate: true,
                          });
                          setValue(
                            "hours",
                            `${openTime || "--:--"} - ${watchedCloseTime || "--:--"}`,
                          );
                        }}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Clock
                        className="absolute left-4 top-3.5 text-slate-400"
                        size={18}
                      />
                      <input
                        type="time"
                        value={watchedCloseTime}
                        onChange={(e) => {
                          const closeTime = e.target.value;
                          setValue("closeTime", closeTime, {
                            shouldValidate: true,
                          });
                          setValue(
                            "hours",
                            `${watchedOpenTime || "--:--"} - ${closeTime || "--:--"}`,
                          );
                        }}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="mt-1 flex gap-4">
                    {errors.openTime?.message && (
                      <p className="text-xs text-red-600">
                        {errors.openTime.message}
                      </p>
                    )}
                    {errors.closeTime?.message && (
                      <p className="text-xs text-red-600">
                        {errors.closeTime.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Shop Cover Photo
                  </label>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handleCoverFileChange}
                  />
                  <div
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <div className="p-4 bg-blue-50 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                      <Camera size={32} />
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-500">
                      Click to upload shop banner
                    </p>
                    <p className="text-xs text-slate-400">
                      PNG, JPG up to 10MB
                    </p>
                    {watchedImage && (
                      <p className="mt-2 text-xs font-medium text-emerald-600">
                        Selected: {watchedImage.name}
                      </p>
                    )}
                    {coverPreview && (
                      <img
                        src={coverPreview}
                        alt="Shop cover preview"
                        className="mt-4 h-32 w-full max-w-sm rounded-xl border border-slate-200 object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Pricing & Hours */}
          {step === 2 && (
            <ServicesPricingStep
              services={watchedServices || []}
              onChange={(services) =>
                setValue("services", services, { shouldDirty: true })
              }
            />
          )}

          {/* STEP 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6 animate-in zoom-in-95">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Ready to go!
                </h2>
                <p className="text-slate-500 max-w-md mx-auto mt-2">
                  Please review everything before creating your shop.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      Shop Preview
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      {shopName || "N/A"}
                    </h3>
                  </div>
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Shop cover"
                      className="h-16 w-24 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="h-16 w-24 rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs flex items-center justify-center">
                      No cover
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  <div className="rounded-xl bg-white border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                      Contact
                    </p>
                    <div className="flex items-center gap-2 text-slate-800">
                      <Phone size={16} className="text-slate-500" />
                      <span className="font-medium">
                        {watchedPhone || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                      Operating Hours
                    </p>
                    <div className="flex items-center gap-2 text-slate-800">
                      <Clock size={16} className="text-slate-500" />
                      <span className="font-medium">
                        {watchedOpenTime || "--:--"} -{" "}
                        {watchedCloseTime || "--:--"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-4 mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    Location
                  </p>
                  <div className="flex items-start gap-2 text-slate-800">
                    <MapPin
                      size={16}
                      className="text-slate-500 mt-0.5 shrink-0"
                    />
                    <span className="text-sm leading-relaxed">
                      {watchedAddress || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Scissors size={18} className="text-blue-600" />
                  <h4 className="text-lg font-bold text-slate-900">
                    Services & Pricing
                  </h4>
                </div>
                {enabledServices.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No service selected. You can go back and enable services.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {enabledServices.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <span className="font-medium text-slate-800">
                          {formatLaundryServiceType(service.name)}
                        </span>
                        <span className="text-sm font-semibold text-slate-600">
                          ${service.price} {formatUnitType(service.unitType)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex items-center justify-between mt-12">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors"
              >
                <ChevronLeft size={20} /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleContinue}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 flex items-center gap-2 transition-all"
              >
                Continue <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLaunchClick}
                disabled={isSubmitting}
                className="bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-12 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
              >
                {isSubmitting ? "Launching..." : "Launch Shop"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateShopForm;
