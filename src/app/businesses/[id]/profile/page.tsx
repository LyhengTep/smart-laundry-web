"use client";

import { ServicesPricingStep } from "@/components/ServicesPricing";
import { BASE_URL } from "@/config/common";
import { DialogCtx } from "@/contexts/DialogProvider";
import { ToastContext } from "@/contexts/ToastProvider";
import { useLaundryServices } from "@/hooks/businesses/laundryServiceHook";
import { getBusinessById, updateBusiness } from "@/services/businessService";
import { uploadFile } from "@/services/file";
import {
  BusinessServiceUpdateRequest,
  BusinessUpdateRequest,
} from "@/types/business";
import { FileResponse } from "@/types/fileType";
import { formatLaundryServiceType } from "@/utils/common";
import {
  UpdateBusinessPayloadSchema,
  UpdateBusinessProfileSchema,
} from "@/validations/businessValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Clock,
  MapPin,
  Phone,
  Save,
  Settings2,
  Share2,
  Star,
  Store,
} from "lucide-react";
import { useParams } from "next/navigation";
import { ChangeEvent, ReactNode, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type EditBusinessForm = z.infer<typeof UpdateBusinessProfileSchema>;

const formatStatus = (status?: string) => {
  if (!status) return "Unknown";
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
};

const shortenAddress = (address?: string) => {
  if (!address) return "N/A";
  const compact = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");

  return compact.length > 70 ? `${compact.slice(0, 70)}...` : compact;
};

const normalizePricingType = (
  pricingType?: string,
): "per_item" | "per_kg" | "fixed" => {
  const value = (pricingType || "").toLowerCase();
  if (value === "per_item") return "per_item";
  if (value === "fixed") return "fixed";
  return "per_kg";
};

const toApiTime = (value: string) => `${value}:00.000Z`;

const mapServicesToForm = (
  allServices: Array<{ id: number; name: string }>,
  offered: Array<{
    service_id: number | string;
    base_price: number;
    pricing_type?: string;
  }>,
) =>
  allServices.map((service) => {
    const matched = offered.find(
      (item) => String(item.service_id) === String(service.id),
    );
    return {
      id: String(service.id),
      name: service.name,
      unitType: normalizePricingType(matched?.pricing_type),
      price: matched?.base_price ?? 0,
      enabled: Boolean(matched),
      image:
        "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=400&auto=format&fit=crop",
    };
  });

const mapOfferedServicesOnly = (
  offered: Array<{
    id?: string;
    service_id: number | string;
    base_price: number;
    pricing_type?: string;
    laundry_service?: { name?: string };
  }>,
) =>
  offered.map((item) => ({
    id: String(item.service_id),
    name: item.laundry_service?.name || `Service #${item.service_id}`,
    unitType: normalizePricingType(item.pricing_type),
    price: item.base_price ?? 0,
    enabled: true,
    image:
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=400&auto=format&fit=crop",
  }));

const ShopProfilePage = () => {
  const params = useParams<{ id: string }>();
  const businessId = String(params.id || "");
  const queryClient = useQueryClient();
  const toastCtx = useContext(ToastContext);
  const dialogCtx = useContext(DialogCtx);
  const [isEditing, setIsEditing] = useState(false);
  const [coverPreview, setCoverPreview] = useState("");

  const { data: business, isLoading } = useQuery({
    queryKey: ["business", businessId],
    queryFn: () => getBusinessById(businessId),
    enabled: Boolean(businessId),
  });
  const { data: laundryServices } = useLaundryServices();

  const {
    register,
    reset,
    setValue,
    getValues,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<EditBusinessForm>({
    resolver: zodResolver(UpdateBusinessProfileSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      openTime: "08:00",
      closeTime: "20:00",
      services: [],
      image: undefined,
    },
  });
  const watchedServices = watch("services");

  useEffect(() => {
    if (!business) return;
    reset({
      name: business.name || "",
      phone: business.phone || "",
      address: business.address || "",
      openTime: (business.open_time || "08:00").slice(0, 5),
      closeTime: (business.close_time || "20:00").slice(0, 5),
      services: mapOfferedServicesOnly(business.services || []),
      image: undefined,
    });
    setCoverPreview(business.cover_image_url || "");
  }, [business, reset]);

  useEffect(() => {
    if (!business || !laundryServices?.length) return;
    console.log("business data", business);
    const offered =
      business.services?.map((item) => ({
        service_id: item.service_id,
        base_price: item.base_price,
        pricing_type: item.pricing_type,
      })) || [];

    const current = getValues("services") || [];
    const currentById = new Map(
      current.map((service) => [service.id, service]),
    );

    const merged = mapServicesToForm(laundryServices, offered).map(
      (service) => {
        const existing = currentById.get(service.id);
        return existing ? { ...service, ...existing } : service;
      },
    );
    // console.log("merged services=====>", merged);
    const mergedIds = new Set(merged.map((item) => item.id));
    const extras = current.filter((item) => !mergedIds.has(item.id));

    setValue("services", [...merged, ...extras], { shouldDirty: false });
  }, [business, laundryServices, setValue, getValues]);

  const uploadCover = useMutation({
    mutationFn: (file: File): Promise<FileResponse> => uploadFile(file),
  });

  const updateMutation = useMutation({
    mutationFn: (data: BusinessUpdateRequest) =>
      updateBusiness(businessId, data),
    onSuccess: async (updatedBusiness) => {
      queryClient.setQueryData(["business", businessId], updatedBusiness);
      await queryClient.invalidateQueries({
        queryKey: ["business", businessId],
        refetchType: "active",
      });
      await queryClient.invalidateQueries({
        queryKey: ["businesses"],
        refetchType: "active",
      });
      setIsEditing(false);
      toastCtx?.setToast?.({
        error: false,
        message: "Business updated successfully.",
      });
      toastCtx?.setIsVisible(true);
    },
    onError: () => {
      toastCtx?.setToast?.({
        error: true,
        message: "Failed to update business.",
      });
      toastCtx?.setIsVisible(true);
    },
  });

  const onSubmit = async (values: EditBusinessForm) => {
    if (!business) return;
    let coverUrl = business.cover_image_url || "";
    if (values.image) {
      const uploaded = await uploadCover.mutateAsync(values.image);
      coverUrl = uploaded.url;
    }

    const selectedServices: BusinessServiceUpdateRequest[] = values.services
      .filter((service) => service.enabled)
      .map((service) => {
        const existing = business.services?.find(
          (item) => String(item.service_id) === String(service.id),
        );

        return {
          business_id: businessId,
          service_id: Number(service.id),
          base_price: service.price,
          pricing_type: service.unitType,
          id: existing?.id,
        };
      });

    const payload: BusinessUpdateRequest = {
      name: values.name,
      phone: values.phone,
      address: values.address,
      open_time: toApiTime(values.openTime),
      close_time: toApiTime(values.closeTime),
      latitude: business.latitude,
      longitude: business.longitude,
      profile_image_url: business.profile_image_url || "",
      cover_image_url: coverUrl,
      services: selectedServices,
    };

    const validated = UpdateBusinessPayloadSchema.safeParse(payload);
    if (!validated.success) {
      toastCtx?.setToast?.({
        error: true,
        message: "Invalid payload. Please check form values.",
      });
      toastCtx?.setIsVisible(true);
      return;
    }

    updateMutation.mutate(validated.data);
  };

  const onClickSave = () => {
    dialogCtx.open({
      title: "Save profile changes?",
      description: "These updates will be applied to your shop profile.",
      confirmLabel: "Yes, Save",
      onConfirm: () => void handleSubmit(onSubmit)(),
    });
  };

  const handleCoverChange = (
    e: ChangeEvent<HTMLInputElement>,
    onChange: (file?: File) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    onChange(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  if (isLoading) return <div className="flex-1 p-8">Loading profile...</div>;
  if (!business) return <div className="flex-1 p-8">Business not found.</div>;
  if (isEditing) {
    return (
      <main className="flex-1 p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              Edit Shop Profile
            </h1>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onClickSave}
                disabled={updateMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-2 disabled:opacity-60"
              >
                <Save size={16} />
                {updateMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Shop Name
                </label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200"
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    {...register("phone")}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Address
                  </label>
                  <input
                    {...register("address")}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
                  />
                  {errors.address && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Cover Photo
                </label>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  {coverPreview ? (
                    <img
                      src={BASE_URL + coverPreview}
                      alt="Cover preview"
                      className="w-full h-44 object-cover rounded-lg border border-slate-200"
                    />
                  ) : (
                    <div className="h-44 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm">
                      No cover image
                    </div>
                  )}
                  <label className="mt-3 inline-block px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 cursor-pointer">
                    Replace cover
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={(e) =>
                        handleCoverChange(e, (file) =>
                          setValue("image", file, { shouldDirty: true }),
                        )
                      }
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Operating Hours
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="time"
                    {...register("openTime")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200"
                  />
                  <input
                    type="time"
                    {...register("closeTime")}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200"
                  />
                </div>
                {errors.openTime && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.openTime.message}
                  </p>
                )}
                {errors.closeTime && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.closeTime.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <ServicesPricingStep
                  services={watchedServices || []}
                  onChange={(services) =>
                    setValue("services", services, { shouldDirty: true })
                  }
                />
                {errors.services && (
                  <p className="text-xs text-red-600 mt-2">
                    Please check services and pricing values.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex-1 mx-auto p-4 md:p-8 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Shop Identity
        </h1>
        <div className="flex gap-2">
          <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all">
            <Share2 size={20} />
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="relative h-64 bg-slate-200">
            {business.cover_image_url ? (
              <img
                src={BASE_URL + business.cover_image_url}
                className="w-full h-full object-cover"
                alt="Cover"
              />
            ) : null}
            <button className="absolute top-4 right-4 flex items-center gap-2 bg-black/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-medium">
              <Camera size={16} /> Cover
            </button>
          </div>
          <div className="p-8 flex items-end gap-6 -mt-12 relative">
            <div className="w-32 h-32 bg-white rounded-[2rem] p-1 shadow-xl">
              <div className="w-full h-full bg-blue-600 rounded-[1.8rem] flex items-center justify-center text-white">
                <Store size={48} />
              </div>
            </div>
            <div className="pb-2">
              <h2 className="text-3xl font-black text-slate-900">
                {business.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {formatStatus(business.status)}
                </span>
                <span className="text-slate-400 text-sm font-medium">
                  • {business.open_time?.slice(0, 5)} -{" "}
                  {business.close_time?.slice(0, 5)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl">
              <Star size={24} fill="currentColor" />
            </div>
            <span className="text-slate-400 font-bold text-sm tracking-widest uppercase">
              Rating
            </span>
          </div>
          <div>
            <div className="text-5xl font-black text-slate-900 italic">
              {business.rating_avg?.toFixed(1) ?? "0.0"}
            </div>
            <p className="text-slate-500 mt-2 font-medium">
              Shop performance score
            </p>
          </div>
          <button className="w-full py-3 bg-slate-50 text-slate-600 font-bold rounded-2xl">
            Business ID: {business.id.slice(0, 8)}...
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Settings2 size={18} className="text-blue-600" /> Essential Info
          </h3>
          <div className="space-y-5">
            <InfoRow
              icon={<MapPin size={18} />}
              label="Address"
              value={shortenAddress(business.address)}
              fullValue={business.address}
            />
            <InfoRow
              icon={<Phone size={18} />}
              label="Phone"
              value={business.phone}
            />
            <InfoRow
              icon={<Store size={18} />}
              label="License"
              value={business.business_license_number || "N/A"}
            />
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Clock size={20} className="text-blue-400" /> Business Hours
              </h3>
              <p className="text-slate-400">Current open and close time</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                <p className="text-xs text-slate-400 uppercase font-bold">
                  Open
                </p>
                <p className="text-lg font-bold">
                  {business.open_time?.slice(0, 5)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                <p className="text-xs text-slate-400 uppercase font-bold">
                  Close
                </p>
                <p className="text-lg font-bold">
                  {business.close_time?.slice(0, 5)}
                </p>
              </div>
            </div>
          </div>
          <Clock
            size={200}
            className="absolute -bottom-10 -right-10 text-white/[0.03] rotate-12"
          />
        </div>

        <div className="md:col-span-3 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Services Offered</h3>
          <div className="flex flex-wrap gap-2">
            {(business.services || []).length > 0 ? (
              (business.services || []).map((service) => (
                <span
                  key={String(service.id || service.service_id)}
                  className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold"
                >
                  {formatLaundryServiceType(
                    service.laundry_service?.name || "",
                  ) || `Service #${service.service_id}`}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">
                No services configured.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
  fullValue,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  fullValue?: string;
}) => (
  <div className="flex items-center gap-4">
    <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">{icon}</div>
    <div className="flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-slate-800 font-semibold" title={fullValue || value}>
        {value}
      </p>
    </div>
  </div>
);

export default ShopProfilePage;
