"use client";

import { DialogCtx } from "@/contexts/DialogProvider";
import { ToastContext } from "@/contexts/ToastProvider";
import { useUsers } from "@/hooks/users/userHook";
import { approveUser } from "@/services/userService";
import { User } from "@/types/user";
import { formatDateUTC7 } from "@/utils/date";
import { toToastMessage } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  CheckCircle,
  Filter,
  Search,
  ShieldCheck,
  Store,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useContext, useState } from "react";

type TabRole = "CUSTOMER" | "MERCHANT";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "REJECTED";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  INACTIVE: "bg-amber-50 text-amber-700",
  SUSPENDED: "bg-red-50 text-red-700",
  REJECTED: "bg-slate-100 text-slate-600",
};

const TABS: { key: TabRole; label: string; icon: React.ReactNode }[] = [
  { key: "CUSTOMER", label: "Customers", icon: <UserIcon size={15} /> },
  { key: "MERCHANT", label: "Merchants", icon: <Store size={15} /> },
];

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState<TabRole>("CUSTOMER");
  const [params, setParams] = useState({
    page: 1,
    size: 10,
    status: undefined as string | undefined,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();
  const toastCtx = useContext(ToastContext);
  const dialogCtx = useContext(DialogCtx);

  const { data, isLoading, isError } = useUsers({
    ...params,
    role: activeTab,
  });

  const page = data?.page ?? params.page;
  const size = data?.size ?? params.size;
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: (userId: string) => approveUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toastCtx?.setToast?.({ error: false, message: "Account approved successfully." });
      toastCtx?.setIsVisible(true);
    },
    onError: (e) => {
      const detail = axios.isAxiosError(e)
        ? ((e.response?.data as { detail?: unknown })?.detail ?? e.message)
        : e instanceof Error
          ? e.message
          : "Something went wrong";
      toastCtx?.setToast?.({ error: true, message: toToastMessage(detail) });
      toastCtx?.setIsVisible(true);
    },
  });

  const handleApprove = (user: User) => {
    dialogCtx.open({
      title: "Approve Account?",
      description: (
        <>
          This will activate <strong>{user.full_name}</strong>'s account so they
          can start using the platform.
        </>
      ),
      confirmLabel: "Yes, Approve",
      tone: "success",
      onConfirm: () => approve(user.id),
    });
  };

  const onTabChange = (tab: TabRole) => {
    setActiveTab(tab);
    setSearchTerm("");
    setParams({ page: 1, size: 10, status: undefined });
  };

  const onStatusChange = (value: StatusFilter) => {
    setParams((p) => ({
      ...p,
      page: 1,
      status: value === "ALL" ? undefined : value,
    }));
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

  const pendingCount = (data?.items ?? []).filter(
    (u) => u.status === "INACTIVE",
  ).length;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">User Management</h1>
        <p className="text-slate-500">
          Manage customer and merchant accounts, approve pending registrations.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={[
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-5 bg-white border border-slate-100 shadow-sm rounded-[2rem] p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3 text-slate-500">
          <Filter size={15} />
          <span className="text-xs font-bold uppercase tracking-wider">
            Search & Filters
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
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
          {pendingCount} account{pendingCount > 1 ? "s are" : " is"} pending
          approval on this page.
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Users size={17} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {activeTab === "CUSTOMER" ? "Customers" : "Merchants"}
              </p>
              <p className="text-slate-700 font-semibold text-sm">
                {isLoading
                  ? "Loading…"
                  : `${total} ${activeTab === "CUSTOMER" ? "customer" : "merchant"}${total !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Page {page} of {pages}
          </span>
        </div>

        {/* Error */}
        {isError && (
          <div className="px-6 py-10 text-center text-red-500 text-sm font-medium">
            Failed to load data. Please try again.
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="divide-y divide-slate-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="px-6 py-4 flex items-center gap-4 animate-pulse"
              >
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

        {/* Empty */}
        {!isLoading && !isError && filteredItems.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={22} className="text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm font-medium">
              No {activeTab === "CUSTOMER" ? "customers" : "merchants"} match
              your filters.
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && filteredItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    User
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map((user: User) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition">
                    {/* User info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            activeTab === "CUSTOMER"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-slate-400">
                            @{user.user_name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{user.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {user.phone}
                      </p>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg ${STATUS_STYLE[user.status] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {user.status === "INACTIVE" ? "PENDING" : user.status}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {formatDateUTC7(user.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {user.status === "INACTIVE" && (
                        <button
                          type="button"
                          disabled={isApproving}
                          onClick={() => handleApprove(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition disabled:opacity-50"
                          title="Approve account"
                        >
                          <CheckCircle size={13} />
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && total > 0 && (
          <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
            <p className="text-xs text-slate-400 font-medium">
              Showing {(page - 1) * size + 1}–{Math.min(page * size, total)} of{" "}
              {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition font-medium"
              >
                Prev
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">
                {page} / {pages}
              </span>
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
