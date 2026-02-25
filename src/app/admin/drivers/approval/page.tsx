"use client";

import { useContext, useState } from "react";

import { DriverDetailsPanel } from "@/components/DriverDetailsPanel";
import { DriverTable } from "@/components/DriverTable";
import { DialogCtx } from "@/contexts/DialogProvider";
import { ToastContext } from "@/contexts/ToastProvider";
import { useDrivers } from "@/hooks/drivers/driverHook";
import {
  approveDriver as approveDriverRequest,
  rejectDriver as rejectDriverRequest,
} from "@/services/driverService";
import { DriverResponse } from "@/types/driver";
import { toToastMessage } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ShieldCheck } from "lucide-react";

export default function DriverApprovalPage() {
  const toastCtx = useContext(ToastContext);
  const [selectedDriver, setSelectedDriver] = useState<DriverResponse | null>(
    null,
  );
  const [driverParams, setDriverParams] = useState({
    page: 1,
    size: 10,
    status: "INACTIVE",
  });

  const queryClient = useQueryClient();
  const { mutate: approveDriver } = useMutation({
    mutationFn: (driverId: string) => approveDriverRequest(driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toastCtx?.setToast?.({
        error: false,
        message: "Driver approved successfully",
      });
      toastCtx?.setIsVisible(true);
    },
    onError: (e) => {
      console.log("Error approving driver", e);
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

  const { mutate: rejectDriver } = useMutation({
    mutationFn: (driverId: string) => rejectDriverRequest(driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toastCtx?.setToast?.({
        error: false,
        message: "Driver rejected successfully",
      });
      toastCtx?.setIsVisible(true);
    },
    onError: (e) => {
      console.log("Error rejecting driver", e);
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

  const handleAction = (id: string, newStatus: "Approved" | "Rejected") => {
    if (newStatus === "Approved") {
      approveDriver(id);
      return;
    }
    if (newStatus === "Rejected") {
      rejectDriver(id);
    }
  };

  const onPageChange = (page: number) => {
    setDriverParams({
      ...driverParams,
      page,
    });
  };

  const { data } = useDrivers(driverParams);
  const dialogCtx = useContext(DialogCtx);

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">
          Driver Applications
        </h1>
        <p className="text-slate-500">
          Review and verify driver registrations before they can accept orders.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">
            Pending Review
          </p>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {data?.total}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <DriverTable
          drivers={data?.items ?? []}
          page={data?.page ?? 1}
          pages={data?.pages ?? 1}
          total={data?.total ?? 0}
          size={data?.size ?? 10}
          onPageChange={onPageChange}
          onView={(driver) => setSelectedDriver(driver)}
          onApprove={(driver) => {
            dialogCtx.open({
              driverName: driver.user.full_name,
              title: "Confirm Approval?",
              onConfirm: () => handleAction(driver.id, "Approved"),
            });
          }}
          onReject={(driver) => {
            dialogCtx.open({
              driverName: driver.user.full_name,
              title: "Reject Application?",
              description: (
                <>
                  This will reject <strong>{driver.user.full_name}</strong> and
                  they will not be able to accept delivery orders.
                </>
              ),
              confirmLabel: "Yes, Reject",
              tone: "danger",
              onConfirm: () => handleAction(driver.id, "Rejected"),
            });
          }}
        />

        {(data?.items?.length ?? 0) === 0 && (
          <div className="p-20 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">
              All applications have been reviewed!
            </p>
          </div>
        )}
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
