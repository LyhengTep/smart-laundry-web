"use client";

import { ListingPagination } from "@/components/ListingPagination";
import { DialogCtx } from "@/contexts/DialogProvider";
import { ToastContext } from "@/contexts/ToastProvider";
import { useMyBusinesses } from "@/hooks/businesses/businessHook";
import { handleBusinessDeactivation } from "@/services/businessService";
import { Business } from "@/types/business";
import { toToastMessage } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Building2,
  CheckCircle,
  Eye,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

const STATUS_STYLES: Record<string, string> = {
  PENDING_DEACTIVATION: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-slate-100 text-slate-500",
  SUSPENDED: "bg-red-100 text-red-600",
};

function StatusBadge({ status }: { status?: string }) {
  const s = status ?? "";
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[s] ?? "bg-slate-100 text-slate-500"}`}
    >
      {s.replaceAll("_", " ") || "UNKNOWN"}
    </span>
  );
}

export default function AdminBusinessesPage() {
  const router = useRouter();
  const toastCtx = useContext(ToastContext);
  const dialogCtx = useContext(DialogCtx);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMyBusinesses({ page, size: 15 });

  const businesses: Business[] = data?.items ?? [];

  const { mutate, isPending, variables } = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "APPROVE" | "REJECT" }) =>
      handleBusinessDeactivation(id, action),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["my-businesses"] });
      toastCtx?.setToast?.({
        error: false,
        message: vars.action === "APPROVE" ? "Deactivation approved." : "Deactivation rejected.",
      });
      toastCtx?.setIsVisible(true);
    },
    onError: (e) => {
      const detail = axios.isAxiosError(e)
        ? ((e.response?.data as { detail?: unknown })?.detail ?? e.message)
        : e instanceof Error ? e.message : "Something went wrong";
      toastCtx?.setToast?.({ error: true, message: toToastMessage(detail) });
      toastCtx?.setIsVisible(true);
    },
  });

  const confirmAction = (biz: Business, action: "APPROVE" | "REJECT") => {
    dialogCtx.open({
      title: action === "APPROVE" ? "Approve deactivation?" : "Reject deactivation?",
      description:
        action === "APPROVE"
          ? `"${biz.name}" will be deactivated. This cannot be undone.`
          : `"${biz.name}"'s deactivation request will be rejected and it will remain active.`,
      confirmLabel: action === "APPROVE" ? "Yes, Approve" : "Yes, Reject",
      tone: action === "REJECT" ? "danger" : undefined,
      onConfirm: () => mutate({ id: biz.id, action }),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Deactivation Requests</h1>
        <p className="text-slate-500 text-sm mt-1">
          Businesses requesting deactivation — approve or reject each request.
          {data && ` ${data.total ?? businesses.length} pending.`}
        </p>
      </div>

      {/* List */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-slate-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5 animate-pulse">
                <div className="w-10 h-10 bg-slate-100 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded-full w-40" />
                  <div className="h-3 bg-slate-100 rounded-full w-56" />
                </div>
                <div className="h-6 bg-slate-100 rounded-full w-28" />
                <div className="h-8 bg-slate-100 rounded-2xl w-20" />
                <div className="h-8 bg-slate-100 rounded-2xl w-20" />
              </div>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
            <Building2 size={40} strokeWidth={1.5} />
            <p className="font-medium text-sm">No deactivation requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/60">
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Business</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">License</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Registered</th>
                  <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {businesses.map((biz) => {
                  const isThisLoading = isPending && variables?.id === biz.id;
                  return (
                    <tr key={biz.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {biz.profile_image_url ? (
                            <img
                              src={biz.profile_image_url}
                              alt={biz.name}
                              className="w-10 h-10 rounded-2xl object-cover shrink-0 border border-slate-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                              <Building2 size={18} className="text-amber-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{biz.name}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{biz.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Phone size={11} className="text-slate-400" />
                            {biz.phone}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin size={11} className="text-slate-400" />
                            <span className="line-clamp-1 max-w-[180px]">{biz.address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-mono text-slate-600">
                          {biz.business_license_number || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={biz.status} />
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500">
                        {biz.created_at ? new Date(biz.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/businesses/${biz.id}`)}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => confirmAction(biz, "APPROVE")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isThisLoading && variables?.action === "APPROVE" ? (
                              <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                              <CheckCircle size={13} />
                            )}
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => confirmAction(biz, "REJECT")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isThisLoading && variables?.action === "REJECT" ? (
                              <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                              <XCircle size={13} />
                            )}
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(data?.pages ?? 0) > 1 && (
        <ListingPagination
          currentPage={page}
          pages={data!.pages!}
          onBackward={() => setPage((p) => Math.max(p - 1, 1))}
          onForward={() => setPage((p) => Math.min(p + 1, data!.pages!))}
          onPageClick={(p: number) => { if (!isNaN(Number(p))) setPage(Number(p)); }}
        />
      )}
    </div>
  );
}
