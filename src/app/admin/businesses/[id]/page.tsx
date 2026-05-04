"use client";

import { ToastContext } from "@/contexts/ToastProvider";
import { useBusiness } from "@/hooks/businesses/businessHook";
import {
  approveBusinessDeactivation,
  rejectBusinessDeactivation,
} from "@/services/businessService";
import { toToastMessage } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  ScrollText,
  Star,
  XCircle,
} from "lucide-react";
import { use } from "react";
import { useContext } from "react";
import { useRouter } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  PENDING_DEACTIVATION: "bg-amber-100 text-amber-700 border border-amber-200",
  ACTIVE: "bg-green-100 text-green-700 border border-green-200",
  OPEN: "bg-green-100 text-green-700 border border-green-200",
  APPROVED: "bg-blue-100 text-blue-700 border border-blue-200",
  INACTIVE: "bg-slate-100 text-slate-500 border border-slate-200",
  CLOSED: "bg-slate-100 text-slate-500 border border-slate-200",
  SUSPENDED: "bg-red-100 text-red-600 border border-red-200",
  REJECTED: "bg-red-100 text-red-600 border border-red-200",
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const toastCtx = useContext(ToastContext);
  const queryClient = useQueryClient();

  const { data: biz, isLoading, isError } = useBusiness(id);

  const approve = useMutation({
    mutationFn: () => approveBusinessDeactivation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["business", id] });
      toastCtx?.setToast?.({ error: false, message: "Deactivation approved." });
      toastCtx?.setIsVisible(true);
      router.push("/admin/businesses");
    },
    onError: (e) => {
      const detail = axios.isAxiosError(e)
        ? ((e.response?.data as { detail?: unknown })?.detail ?? e.message)
        : e instanceof Error ? e.message : "Something went wrong";
      toastCtx?.setToast?.({ error: true, message: toToastMessage(detail) });
      toastCtx?.setIsVisible(true);
    },
  });

  const reject = useMutation({
    mutationFn: () => rejectBusinessDeactivation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["business", id] });
      toastCtx?.setToast?.({ error: false, message: "Deactivation rejected." });
      toastCtx?.setIsVisible(true);
      router.push("/admin/businesses");
    },
    onError: (e) => {
      const detail = axios.isAxiosError(e)
        ? ((e.response?.data as { detail?: unknown })?.detail ?? e.message)
        : e instanceof Error ? e.message : "Something went wrong";
      toastCtx?.setToast?.({ error: true, message: toToastMessage(detail) });
      toastCtx?.setIsVisible(true);
    },
  });

  const isMutating = approve.isPending || reject.isPending;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-slate-100 rounded-2xl w-1/3" />
        <div className="h-48 bg-slate-100 rounded-[2rem]" />
        <div className="h-64 bg-slate-100 rounded-[2rem]" />
      </div>
    );
  }

  if (isError || !biz) {
    return (
      <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-600 rounded-2xl px-6 py-5 text-sm font-medium">
        Failed to load business. Please go back and try again.
      </div>
    );
  }

  const isPendingDeactivation = biz.status === "PENDING_DEACTIVATION";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back nav */}
      <button
        type="button"
        onClick={() => router.push("/admin/businesses")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition"
      >
        <ArrowLeft size={16} />
        Back to Deactivation Requests
      </button>

      {/* Cover + profile */}
      <div className="relative bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {biz.cover_image_url ? (
          <img
            src={biz.cover_image_url}
            alt="cover"
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200" />
        )}
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8">
            {biz.profile_image_url ? (
              <img
                src={biz.profile_image_url}
                alt={biz.name}
                className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-sm shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border-4 border-white shadow-sm flex items-center justify-center shrink-0">
                <Building2 size={24} className="text-amber-400" />
              </div>
            )}
            <div className="pb-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 truncate">{biz.name}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 ${STATUS_STYLES[biz.status] ?? "bg-slate-100 text-slate-500"}`}
                >
                  {biz.status.replaceAll("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-slate-500">
                  {biz.rating_avg?.toFixed(1) ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar — only shown for PENDING_DEACTIVATION */}
      {isPendingDeactivation && (
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] px-6 py-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Deactivation requested</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Approve to deactivate this business, or reject to keep it active.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isMutating}
              onClick={() => approve.mutate()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {approve.isPending ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle size={15} />
              )}
              Approve
            </button>
            <button
              type="button"
              disabled={isMutating}
              onClick={() => reject.mutate()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {reject.isPending ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <XCircle size={15} />
              )}
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Business info */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Business Info
          </p>
          <InfoRow icon={<MapPin size={15} />} label="Address" value={biz.address} />
          <InfoRow icon={<Phone size={15} />} label="Phone" value={biz.phone} />
          <InfoRow
            icon={<ScrollText size={15} />}
            label="License No."
            value={biz.business_license_number}
          />
          <InfoRow
            icon={<Clock size={15} />}
            label="Hours"
            value={
              biz.open_time && biz.close_time
                ? `${biz.open_time} – ${biz.close_time}`
                : "—"
            }
          />
        </div>

        {/* Services */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Services ({biz.services?.length ?? 0})
          </p>
          {!biz.services || biz.services.length === 0 ? (
            <p className="text-sm text-slate-400">No services listed.</p>
          ) : (
            <div className="space-y-2">
              {biz.services.map((svc, i) => (
                <div
                  key={svc.id ?? i}
                  className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {svc.laundry_service?.name ?? `Service ${i + 1}`}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">
                      {svc.pricing_type.replaceAll("_", " ")}
                    </p>
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    ${svc.base_price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm px-6 py-4 flex flex-wrap gap-6 text-xs text-slate-400">
        <span>
          <span className="font-semibold text-slate-500">Owner ID: </span>
          <span className="font-mono">{biz.owner_id}</span>
        </span>
        <span>
          <span className="font-semibold text-slate-500">Created: </span>
          {new Date(biz.created_at).toLocaleString()}
        </span>
        <span>
          <span className="font-semibold text-slate-500">Updated: </span>
          {new Date(biz.updated_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
