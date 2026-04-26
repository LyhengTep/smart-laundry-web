"use client";

import CollectFromCustomerModal from "@/components/CollectFromCustomerModal";
import CollectFromShopModal from "@/components/CollectFromShopModal";
import DriverActiveTaskCard from "@/components/drivers/DriverActiveTaskCard";
import DriverBottomNav from "@/components/drivers/DriverBottomNav";
import DriverHistoryTab from "@/components/drivers/DriverHistoryTab";
import DriverMissionDetail from "@/components/drivers/DriverMissionDetail";
import DriverProfileTab from "@/components/drivers/DriverProfileTab";
import DriverTaskRequestCard from "@/components/drivers/DriverTaskRequestCard";
import PaymentAcceptanceModal from "@/components/PaymentAcceptanceModal";
import { STORAGE_KEYS } from "@/config/common";
import { ToastContext } from "@/contexts/ToastProvider";
import { useLocalStorage } from "@/hooks/localStorage";
import { convertAssignmentToDriverTask } from "@/lib/objectMapper";
import { clearAuthSession, logout } from "@/services/authService";
import { getDriverActiveAssignment } from "@/services/driverService";
import {
  acceptDriverTask,
  confirmPaymentByDriver,
  getDriverTasks,
  getDriverTaskWsUrl,
  markAssignmentDelivered,
  markAssignmentPickedUp,
} from "@/services/driverTaskService";
import { UserAuthResponse } from "@/types/auth";
import {
  DriverAssignmentResponse,
  DriverTask,
  DriverTaskRequest,
  DriverTaskTab,
} from "@/types/driverTask";
import { getDriverActiveTaskLabel } from "@/utils/common";
import { toToastMessage } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Bell, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import useWebSocket from "react-use-websocket";

export default function DriverTasksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DriverTaskTab>("tasks");
  const queryClient = useQueryClient();
  const [newRequest, setNewRequest] = useState<DriverTaskRequest | null>();
  const [activeTasks, setActiveTasks] = useState<DriverTask[]>([]);
  const [taskDetail, setTaskDetail] = useState<DriverTaskRequest | null>();
  const [paymentTask, setPaymentTask] = useState<DriverTask | null>(null);
  const [shopCollectTask, setShopCollectTask] = useState<DriverTask | null>(
    null,
  );
  const [customerCollectTask, setCustomerCollectTask] =
    useState<DriverTask | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const toastCtx = useContext(ToastContext);
  const { value: authUser, setValue: setAuthUser } =
    useLocalStorage<UserAuthResponse | null>(STORAGE_KEYS.AUTH_USER, null);

  console.log("Authuser is ", authUser);
  const wsUrl = useMemo(
    () => getDriverTaskWsUrl(authUser?.driver?.id),
    [authUser?.driver?.id],
  );
  const driverTasksQueryKey = useMemo(
    () => ["driver-tasks", authUser?.driver?.id] as const,
    [authUser?.driver?.id],
  );

  const { mutate } = useMutation({
    mutationFn: async (taskId: string) => {
      await acceptDriverTask(taskId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: driverTasksQueryKey,
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: driverTasksQueryKey,
        type: "active",
      });
    },
    onError: (e) => {
      console.log("Accept task failed", e);
      // alert("Failed to accept task. Please try again.");
      console.log("Error from service", e);
      const message = axios.isAxiosError(e)
        ? ((e.response?.data as { detail?: unknown })?.detail ?? e.message)
        : e instanceof Error
          ? e.message
          : "Something went wrong";
      if (toastCtx.setToast)
        toastCtx.setToast({
          error: true,
          message: toToastMessage(message),
        });

      toastCtx.setIsVisible(true);
    },
  });

  const { mutate: mutateCompleteTask, isPending: isCompletingTask } =
    useMutation({
      mutationFn: async ({
        assignmentId,
        action,
        deliveryFeePaidBy,
        paymentId,
      }: {
        assignmentId: string;
        action: "picked-up" | "delivered";
        deliveryFeePaidBy?: "CUSTOMER" | "SHOP";
        paymentId?: string | null;
      }) => {
        if (action === "picked-up") {
          return markAssignmentPickedUp(
            assignmentId,
            deliveryFeePaidBy ?? "CUSTOMER",
          );
        }
        if (paymentId) {
          await confirmPaymentByDriver(paymentId);
        }
        return markAssignmentDelivered(assignmentId);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: driverTasksQueryKey,
          refetchType: "active",
        });
        await queryClient.refetchQueries({
          queryKey: driverTasksQueryKey,
          type: "active",
        });
        setPaymentTask(null);
        toastCtx.setToast?.({
          error: false,
          message: "Task updated successfully.",
        });
        toastCtx.setIsVisible(true);
      },
      onError: (e) => {
        const message = axios.isAxiosError(e)
          ? ((e.response?.data as { detail?: unknown })?.detail ?? e.message)
          : e instanceof Error
            ? e.message
            : "Failed to update task";
        toastCtx.setToast?.({
          error: true,
          message: toToastMessage(message),
        });
        toastCtx.setIsVisible(true);
      },
    });

  const { data: driverTasks } = useQuery({
    queryKey: driverTasksQueryKey,
    queryFn: () => getDriverTasks(authUser?.driver?.id || ""),
  });

  //Query active package for driver in case of web socket is not available
  const { data: activeAssignment } = useQuery({
    queryKey: ["active-assignment"],
    queryFn: getDriverActiveAssignment,
  });

  useEffect(() => {
    console.log("Active assignment", activeAssignment);
    if (!activeAssignment?.assignment) return;
    setNewRequest(
      convertAssignmentToDriverTask(
        activeAssignment?.assignment as DriverAssignmentResponse,
      ),
    );
    setRemainingTime(activeAssignment?.timeout);
  }, [activeAssignment]);

  //End

  useEffect(() => {
    console.log("Fetched driver tasks:", driverTasks?.items);
    setActiveTasks(
      driverTasks?.items?.map((task: DriverAssignmentResponse) =>
        convertAssignmentToDriverTask(task),
      ) || [],
    );
  }, [driverTasks]);

  // console.log("driver profile ---->", driverTasks);

  //
  // WEB SOCKET
  //
  useWebSocket(wsUrl, {
    shouldReconnect: () => true,
    heartbeat: {
      message: "ping",
      returnMessage: "pong",
      timeout: 30000,
      interval: 10000,
    },
    onMessage: (event) => {
      try {
        console.log("Received WebSocket message:", event.data);
        const payload = JSON.parse(
          event.data,
        ) as Partial<DriverAssignmentResponse>;
        // payload.order = JSON.parse(
        //   payload.order as string,
        // ) as DriverAssignment["order"];

        if (payload.role == "CANCELLED") {
          setNewRequest(null);
        }
        if (payload.role == "PICKUP" || payload.role == "DELIVERY") {
          setNewRequest(
            convertAssignmentToDriverTask(payload as DriverAssignmentResponse),
          );
          setRemainingTime(payload?.timeout || 0);
        }
      } catch (error) {
        console.warn("Failed to parse WebSocket message:", error);
        // Ignore unknown websocket payloads.
      }
    },
  });

  const handleAcceptRequest = (request: DriverTaskRequest) => {
    mutate(request.id);
    setNewRequest(null);
  };

  const handleCompleteTask = (task: DriverTask) => {
    const action = getDriverActiveTaskLabel(task.orderStatus);
    if (!task.id) {
      toastCtx.setToast?.({
        error: true,
        message: "Missing assignment id for this task.",
      });
      toastCtx.setIsVisible(true);
      return;
    }

    if (!action.nextAction) {
      toastCtx.setToast?.({
        error: false,
        message: "This task is already completed.",
      });
      toastCtx.setIsVisible(true);
      return;
    }

    if (action.nextAction === "picked-up") {
      if (task.type === "DELIVERY") {
        mutateCompleteTask({ assignmentId: task.id, action: "picked-up" });
      } else {
        setPaymentTask(task);
      }
      return;
    }
    console.log("handleCompleteTask before deliver condition is starting ");
    if (action.nextAction === "delivered") {
      if (task.type === "DELIVERY") {
        setCustomerCollectTask(task);
        return;
      }
      // PICKUP — delivering to shop
      if (task.deliveryFeePaidBy === "SHOP") {
        setShopCollectTask(task);
      } else {
        mutateCompleteTask({
          assignmentId: task.id,
          action: "delivered",
          paymentId: task.order?.payment_id,
        });
      }
    }
  };

  const handleConfirmPayment = (deliveryFeePaidBy: "CUSTOMER" | "SHOP") => {
    if (!paymentTask?.id) return;
    const { nextAction } = getDriverActiveTaskLabel(paymentTask.orderStatus);
    if (!nextAction) return;
    mutateCompleteTask(
      { assignmentId: paymentTask.id, action: nextAction, deliveryFeePaidBy },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: driverTasksQueryKey,
          });
        },
      },
    );
  };

  const handleConfirmCustomerCollect = () => {
    if (!customerCollectTask?.id) return;
    mutateCompleteTask({
      assignmentId: customerCollectTask.id,
      action: "delivered",
      paymentId: customerCollectTask.order?.payment_id,
    });
    setCustomerCollectTask(null);
  };

  const handleConfirmShopCollect = () => {
    if (!shopCollectTask?.id) return;
    mutateCompleteTask({
      assignmentId: shopCollectTask.id,
      action: "delivered",
      paymentId: shopCollectTask.order?.payment_id,
    });
    setShopCollectTask(null);
  };

  const handleLogout = async () => {
    try {
      if (authUser?.id && authUser?.role) {
        await logout({
          user_id: authUser.id,
          role: authUser.role,
        });
      }
    } catch (error) {
      console.log("Logout API failed", error);
    } finally {
      clearAuthSession();
      setAuthUser(null);
      router.replace("/auth/login");
    }
  };

  // return (
  //   <main className="mx-auto min-h-screen p-6 bg-red-500">
  //     <DriverMissionDetail />
  //   </main>
  // );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-32">
      <header className="p-6 sticky top-0 z-30 bg-slate-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <User size={24} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] leading-none">
                Driver Pro
              </p>
              <h1 className="text-lg font-black text-white mt-1">
                {authUser?.full_name || "Driver Name"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative p-3 bg-slate-900 rounded-2xl border border-white/5"
            >
              <Bell size={20} className="text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-3 bg-slate-900 rounded-2xl border border-white/5 text-slate-300 hover:text-white hover:border-slate-500 transition-all"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        {activeTab === "tasks" && !taskDetail && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {newRequest && activeTasks.length === 0 && (
              <DriverTaskRequestCard
                request={newRequest}
                onAccept={handleAcceptRequest}
                onReject={() => setNewRequest(null)}
                timeout={remainingTime}
                onClose={() => setNewRequest(null)}
                type={newRequest?.role || ""}
              />
            )}

            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 flex justify-between">
                Current Missions <span>{activeTasks?.length}</span>
              </h4>

              {activeTasks?.length > 0 ? (
                activeTasks.map((task) =>
                  (() => {
                    const action = getDriverActiveTaskLabel(task.status);
                    return (
                      <DriverActiveTaskCard
                        key={task.id}
                        task={task}
                        onCardClick={(task) => {
                          setTaskDetail(task);
                        }}
                        onComplete={handleCompleteTask}
                        isCompleting={isCompletingTask}
                        completeLabel={action.label}
                        completeDisabled={!action.nextAction}
                      />
                    );
                  })(),
                )
              ) : (
                <p className="text-slate-500 text-center py-4">
                  No active missions.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <DriverHistoryTab driverId={authUser?.driver?.id ?? ""} />
        )}

        {activeTab === "profile" && (
          <DriverProfileTab authUser={authUser} onLogout={handleLogout} />
        )}
      </main>

      <DriverBottomNav activeTab={activeTab} onChange={setActiveTab} />
      {taskDetail && (
        <DriverMissionDetail
          open={taskDetail ? true : false}
          onClose={() => {
            setTaskDetail(null);
          }}
          data={taskDetail}
        />
      )}
      <PaymentAcceptanceModal
        key={`payment-${Boolean(paymentTask)}-${paymentTask?.id ?? "none"}`}
        open={Boolean(paymentTask)}
        onClose={() => setPaymentTask(null)}
        onConfirm={handleConfirmPayment}
        isSubmitting={isCompletingTask}
        orderNo={paymentTask?.order?.order_no}
        deliveryFee={
          paymentTask?.type == "PICKUP"
            ? paymentTask?.order?.pickup_fee
            : (paymentTask?.order?.delivery_fee ?? null)
        }
      />
      <CollectFromShopModal
        key={`shop-collect-${Boolean(shopCollectTask)}-${shopCollectTask?.id ?? "none"}`}
        open={Boolean(shopCollectTask)}
        onClose={() => setShopCollectTask(null)}
        onConfirm={handleConfirmShopCollect}
        isSubmitting={isCompletingTask}
        orderNo={shopCollectTask?.order?.order_no}
        deliveryFee={
          shopCollectTask?.type == "PICKUP"
            ? shopCollectTask?.order?.pickup_fee
            : (shopCollectTask?.order?.delivery_fee ?? null)
        }
      />
      <CollectFromCustomerModal
        key={`customer-collect-${Boolean(customerCollectTask)}-${customerCollectTask?.id ?? "none"}`}
        open={Boolean(customerCollectTask)}
        onClose={() => setCustomerCollectTask(null)}
        onConfirm={handleConfirmCustomerCollect}
        isSubmitting={isCompletingTask}
        orderNo={customerCollectTask?.order?.order_no}
        orderTotal={customerCollectTask?.order?.subtotal ?? null}
        deliveryFee={customerCollectTask?.order?.delivery_fee ?? null}
        pickupFee={customerCollectTask?.order?.pickup_fee ?? null}
        hasAdvanceSettlement={
          customerCollectTask?.order?.has_advance_settlement ?? null
        }
      />
    </div>
  );
}
