"use client";

import { useUsers } from "@/hooks/users/userHook";
import { User } from "@/types/user";
import { formatDateUTC7 } from "@/utils/date";
import {
  Bike,
  Filter,
  Search,
  ShieldCheck,
  Store,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useState } from "react";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "REJECTED";
type RoleFilter = "ALL" | "ADMIN" | "MERCHANT" | "DRIVER" | "CUSTOMER";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  INACTIVE: "bg-amber-50 text-amber-700",
  SUSPENDED: "bg-red-50 text-red-700",
  REJECTED: "bg-slate-100 text-slate-600",
};

const ROLE_STYLE: Record<string, string> = {
  ADMIN: "bg-violet-50 text-violet-700",
  MERCHANT: "bg-blue-50 text-blue-700",
  DRIVER: "bg-sky-50 text-sky-700",
  CUSTOMER: "bg-slate-100 text-slate-600",
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  ADMIN: <ShieldCheck size={11} />,
  MERCHANT: <Store size={11} />,
  DRIVER: <Bike size={11} />,
  CUSTOMER: <UserIcon size={11} />,
};

const AVATAR_BG: Record<string, string> = {
  ADMIN: "bg-violet-100 text-violet-600",
  MERCHANT: "bg-blue-100 text-blue-600",
  DRIVER: "bg-sky-100 text-sky-600",
  CUSTOMER: "bg-slate-100 text-slate-600",
};

export default function CustomersPage() {
  const [params, setParams] = useState({
    page: 1,
    size: 10,
    role: undefined as string | undefined,
    status: undefined as string | undefined,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError } = useUsers(params);

  const page = data?.page ?? params.page;
  const size = data?.size ?? params.size;
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

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

  const onRoleChange = (value: RoleFilter) => {
    setParams((p) => ({
      ...p,
      page: 1,
      role: value === "ALL" ? undefined : value,
    }));
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

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Users</h1>
        <p className="text-slate-500">Browse and filter all registered user accounts.</p>
      </header>

      {/* Filters */}
      <div className="mb-5 bg-white border border-slate-100 shadow-sm rounded-[2rem] p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3 text-slate-500">
          <Filter size={15} />
          <span className="text-xs font-bold uppercase tracking-wider">
            Search & Filters
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px] gap-3">
          {/* Search */}
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

          {/* Role filter */}
          <select
            value={params.role ?? "ALL"}
            onChange={(e) => onRoleChange(e.target.value as RoleFilter)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500"
          >
            <option value="ALL">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="MERCHANT">Merchant</option>
            <option value="DRIVER">Driver</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Status filter */}
          <select
            value={params.status ?? "ALL"}
            onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Table header bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Users size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Results
              </p>
              <p className="text-slate-700 font-semibold text-sm">
                {isLoading ? "Loading…" : `${total} user${total !== 1 ? "s" : ""}`}
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
            Failed to load users. Please try again.
          </div>
        )}

        {/* Loading skeleton */}
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

        {/* Empty */}
        {!isLoading && !isError && filteredItems.length === 0 && (
          <div className="px-6 py-16 text-center text-slate-400 text-sm">
            No users match your search or filters.
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
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Joined
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
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${AVATAR_BG[user.role] ?? "bg-slate-100 text-slate-600"}`}
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
                      <p className="text-xs text-slate-400 mt-0.5">{user.phone}</p>
                    </td>

                    {/* Role badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${ROLE_STYLE[user.role] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {ROLE_ICON[user.role]}
                        {user.role}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg ${STATUS_STYLE[user.status] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* Joined date */}
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {formatDateUTC7(user.created_at)}
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
