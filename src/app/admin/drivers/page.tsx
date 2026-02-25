"use client";

import { DriverDetailsPanel } from "@/components/DriverDetailsPanel";
import { DialogCtx } from "@/contexts/DialogProvider";
import { ToastContext } from "@/contexts/ToastProvider";
import { useDrivers } from "@/hooks/drivers/driverHook";
import { suspendDriver as suspendDriverRequest } from "@/services/driverService";
import { DriverResponse } from "@/types/driver";
import { formatDateUTC7 } from "@/utils/date";
import { toToastMessage } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Eye, Filter, Pencil, Search, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

export default function AllDriversPage() {
  const router = useRouter();
  const dialogCtx = useContext(DialogCtx);
  const toastCtx = useContext(ToastContext);
  const queryClient = useQueryClient();
  const [driverParams, setDriverParams] = useState({
    page: 1,
    size: 10,
    status: undefined as
      | "ACTIVE"
      | "INACTIVE"
      | "SUSPENDED"
      | "REJECTED"
      | undefined,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<
    "ALL" | "ID" | "NAME" | "PHONE" | "NID" | "PLATE"
  >("ALL");
  const [selectedDriver, setSelectedDriver] = useState<DriverResponse | null>(
    null,
  );
  const { data } = useDrivers(driverParams);

  const page = data?.page ?? driverParams.page;
  const size = data?.size ?? driverParams.size;
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  const { mutate: suspendDriver } = useMutation({
    mutationFn: (driverId: string) => suspendDriverRequest(driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toastCtx?.setToast?.({
        error: false,
        message: "Driver suspended successfully",
      });
      toastCtx?.setIsVisible(true);
    },
    onError: (e) => {
      const detail = axios.isAxiosError(e)
        ? ((e.response?.data as any)?.detail ?? e.message)
        : e;
      const message = toToastMessage(detail);
      toastCtx?.setToast?.({
        error: true,
        message,
      });
      toastCtx?.setIsVisible(true);
    },
  });

  const onPageChange = (page: number) => {
    setDriverParams({
      ...driverParams,
      page,
    });
  };

  const onStatusChange = (
    value: "ALL" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "REJECTED",
  ) => {
    setDriverParams({
      ...driverParams,
      page: 1,
      status: value === "ALL" ? undefined : value,
    });
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const fieldMatches = (driver: DriverResponse) => {
    const valueMap: Record<typeof searchField, string[]> = {
      ALL: [
        driver.id,
        driver.user.full_name,
        driver.user.phone,
        driver.id_card_number,
        driver.plate_number,
      ],
      ID: [driver.id],
      NAME: [driver.user.full_name],
      PHONE: [driver.user.phone],
      NID: [driver.id_card_number],
      PLATE: [driver.plate_number],
    };
    return valueMap[searchField].some((field) =>
      (field ?? "").toLowerCase().includes(normalizedSearch),
    );
  };
  const filteredItems =
    normalizedSearch.length === 0
      ? data?.items ?? []
      : (data?.items ?? []).filter(fieldMatches);

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">All Drivers</h1>
        <p className="text-slate-500">Manage all driver accounts.</p>
      </header>

      <div className="mb-6 bg-white border border-slate-100 shadow-sm rounded-[2rem] p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3 text-slate-500">
          <Filter size={16} />
          <p className="text-xs font-bold uppercase tracking-wider">
            Search & Filters
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_220px] gap-3">
          <div className="relative">
            <select
              onChange={(e) =>
                setSearchField(
                  e.target.value as
                    | "ALL"
                    | "ID"
                    | "NAME"
                    | "PHONE"
                    | "NID"
                    | "PLATE",
                )
              }
              value={searchField}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500"
            >
              <option value="ALL">All Fields</option>
              <option value="ID">Driver ID</option>
              <option value="NAME">Name</option>
              <option value="PHONE">Phone</option>
              <option value="NID">NID</option>
              <option value="PLATE">Plate Number</option>
            </select>
          </div>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500"
            />
          </div>
          <div className="relative">
          <select
            onChange={(e) =>
              onStatusChange(
                e.target.value as
                  | "ALL"
                  | "ACTIVE"
                  | "INACTIVE"
                  | "SUSPENDED"
                  | "REJECTED",
              )
            }
            value={driverParams.status ?? "ALL"}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Drivers
            </p>
            <p className="text-slate-700 font-semibold">
              {total} total results
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Page {page} of {pages}
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Driver Info
              </th>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Vehicle
              </th>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Status
              </th>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                Joined
              </th>
              <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredItems.map((driver: DriverResponse) => (
              <tr key={driver.id} className="hover:bg-slate-50/50 transition">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {driver.user.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        {driver.user.full_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {driver.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-lg">
                    {driver.vehicle_type}
                  </span>
                </td>
                <td className="p-6">
                  <span
                    className={
                      driver.user.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg"
                        : driver.user.status === "SUSPENDED"
                          ? "bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-lg"
                          : driver.user.status === "REJECTED"
                            ? "bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-lg"
                            : "bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-lg"
                    }
                  >
                    {driver.user.status}
                  </span>
                </td>
                <td className="p-6 text-sm text-slate-500 font-medium">
                  {formatDateUTC7(driver.user.created_at)}
                </td>
                <td className="p-6">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedDriver(driver)}
                      className="p-2 text-slate-400 hover:text-blue-600 transition"
                      title="View Driver"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/admin/drivers/${driver.id}/edit`)
                      }
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition"
                      title="Edit Driver"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                      title="Disable Driver"
                      onClick={() => {
                        dialogCtx.open({
                          driverName: driver.user.full_name,
                          title: "Suspend Driver?",
                          description: (
                            <>
                              This will suspend{" "}
                              <strong>{driver.user.full_name}</strong> and they
                              will not be able to accept orders.
                            </>
                          ),
                          confirmLabel: "Yes, Suspend",
                          tone: "danger",
                          onConfirm: () => suspendDriver(driver.id),
                        });
                      }}
                    >
                      <UserX size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-5 border-t border-slate-50 flex items-center justify-between bg-white mb-8">
          <div>
            <p className="text-xs font-medium text-slate-400">
              Showing {(page - 1) * size + 1} to {Math.min(page * size, total)}{" "}
              of {total}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition"
            >
              Prev
            </button>
            <span className="text-xs font-bold text-slate-700 mx-2">
              Page {page} of {pages}
            </span>
            <button
              disabled={page === pages}
              onClick={() => onPageChange(page + 1)}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedDriver && (
        <DriverDetailsPanel
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
        />
      )}
    </div>
  );
}
