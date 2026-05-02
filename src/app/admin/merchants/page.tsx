"use client";

import { DialogCtx } from "@/contexts/DialogProvider";
import { ToastContext } from "@/contexts/ToastProvider";
import { useUsers } from "@/hooks/users/userHook";
import { approveUser, deactivateUser } from "@/services/userService";
import { User } from "@/types/user";
import { formatDateUTC7 } from "@/utils/date";
import { toToastMessage } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  CheckCircle,
  Filter,
  Pencil,
  PowerOff,
  Search,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "REJECTED";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  INACTIVE: "bg-amber-50 text-amber-700",
  SUSPENDED: "bg-red-50 text-red-700",
  REJECTED: "bg-slate-100 text-slate-600",
};

function useUserMutations(queryClient: ReturnType<typeof useQueryClient>, toastCtx: any) {
  const mutationOptions = (successMsg: string) => ({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toastCtx?.setToast?.({ error: false, message: successMsg });
      toastCtx?.setIsVisible(true);
    },
    onError: (e: unknown) => {
      const detail = axios.isAxiosError(e)
        ? ((e.response?.data as { detail?: unknown })?.detail ?? e.message)
        : e instanceof Error ? e.message : "Something went wrong";
      toastCtx?.setToast?.({ error: true, message: toToastMessage(detail) });
      toastCtx?.setIsVisible(true);
    },
  });

  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: (userId: string) => approveUser(userId),
    ...mutationOptions("Merchant approved successfully."),
  });

  const { mutate: deactivate, isPending: isDeactivating } = useMutation({
    mutationFn: (userId: string) => deactivateUser(userId),
    ...mutationOptions("Merchant deactivated successfully."),
  });

  return { approve, isApproving, deactivate, isDeactivating };
}

export default function MerchantsPage() {
  const [params, setParams] = useState({
    page: 1,
    size: 10,
    status: undefined as string | undefined,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();
  const queryClient = useQueryClient();
  const toastCtx = useContext(ToastContext);
  const dialogCtx = useContext(DialogCtx);

  const { data, isLoading, isError } = useUsers({ ...params, role: "MERCHANT" });

  const page = data?.page ?? params.page;
  const size = data?.size ?? params.size;
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  const { approve, isApproving, deactivate, isDeactivating } =
    useUserMutations(queryClient, toastCtx);

  const isMutating = isApproving || isDeactivating;

  const handleApprove = (user: User) => {
    dialogCtx.open({
      title: "Approve Merchant?",
      description: (
        <>Activate <strong>{user.full_name}</strong>'s merchant account so they can register and manage their laundry shop.</>
      ),
      confirmLabel: "Yes, Approve",
      tone: "success",
      onConfirm: () => approve(user.id),
    });
  };

  const handleDeactivate = (user: User) => {
    dialogCtx.open({
      title: "Deactivate Merchant?",
      description: (
        <>This will deactivate <strong>{user.full_name}</strong>'s account. Their shop will become inaccessible until reactivated.</>
      ),
      confirmLabel: "Yes, Deactivate",
      tone: "danger",
      onConfirm: () => deactivate(user.id),
    });
  };

  const onStatusChange = (value: StatusFilter) => {
    setParams((p) => ({ ...p, page: 1, status: value === "ALL" ? undefined : value }));
  };

  const onPageChange = (nextPage: number) => {
    setParams((p) => ({ ...p, page: nextPage }));
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredItems: User[] =
    normalizedSearch.length === 0
      ? (data?.items ?? [])
      : (data?.items ?? []).filter(
          (u) =>
            u.full_name.toLowerCase().includes(normalizedSearch) ||
            u.user_name.toLowerCase().includes(normalizedSearch) ||
            u.email.toLowerCase().includes(normalizedSearch) ||
            u.phone.includes(normalizedSearch),
        );

  const pendingCount = (data?.items ?? []).filter((u) => u.status === "INACTIVE").length;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">Merchants</h1>
        <p className="text-slate-500">Manage shop owner accounts and approve pending registrations.</p>
      </header>

      {/* Filters */}
      <div className="mb-5 bg-white border border-slate-100 shadow-sm rounded-[2rem] p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3 text-slate-500">
          <Filter size={15} />
          <span className="text-xs font-bold uppercase tracking-wider">Search & Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">
          <div className="relative">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, username, email, phone…"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500"
            />
          </div>
          <select
            value={params.status ?? "ALL"}
            onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive (Pending)</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Pending notice */}
      {!isLoading && pendingCount > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl px-5 py-3 text-sm font-medium">
          <ShieldCheck size={16} className="shrink-0" />
          {pendingCount} merchant{pendingCount > 1 ? "s are" : " is"} pending approval on this page.
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Store size={17} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Merchants</p>
              <p className="text-slate-700 font-semibold text-sm">
                {isLoading ? "Loading…" : `${total} merchant${total !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">Page {page} of {pages}</span>
        </div>

        {isError && (
          <div className="px-6 py-10 text-center text-red-500 text-sm font-medium">
            Failed to load merchants. Please try again.
          </div>
        )}

        {isLoading && (
          <div className="divide-y divide-slate-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                </div>
                <div className="h-5 w-16 bg-slate-100 rounded-lg" />
                <div className="h-5 w-16 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && filteredItems.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Store size={22} className="text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm font-medium">No merchants match your filters.</p>
          </div>
        )}

        {!isLoading && !isError && filteredItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Merchant</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map((user: User) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{user.full_name}</p>
                          <p className="text-xs text-slate-400">@{user.user_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{user.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{user.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg ${STATUS_STYLE[user.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {user.status === "INACTIVE" ? "PENDING" : user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {formatDateUTC7(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {user.status === "INACTIVE" && (
                          <button
                            type="button"
                            disabled={isMutating}
                            onClick={() => handleApprove(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition disabled:opacity-50"
                            title="Approve account"
                          >
                            <CheckCircle size={13} />
                            Approve
                          </button>
                        )}
                        {user.status === "ACTIVE" && (
                          <button
                            type="button"
                            disabled={isMutating}
                            onClick={() => handleDeactivate(user)}
                            className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 transition disabled:opacity-50"
                            title="Deactivate account"
                          >
                            <PowerOff size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/merchants/${user.id}/edit`)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                          title="Edit account"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && total > 0 && (
          <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
            <p className="text-xs text-slate-400 font-medium">
              Showing {(page - 1) * size + 1}–{Math.min(page * size, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition font-medium"
              >
                Prev
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">{page} / {pages}</span>
              <button
                disabled={page >= pages}
                onClick={() => onPageChange(page + 1)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
