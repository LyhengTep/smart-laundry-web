"use client";

import DriverActiveTaskCard from "@/components/drivers/DriverActiveTaskCard";
import DriverBottomNav from "@/components/drivers/DriverBottomNav";
import DriverStatCard from "@/components/drivers/DriverStatCard";
import DriverTaskRequestCard from "@/components/drivers/DriverTaskRequestCard";
import { STORAGE_KEYS } from "@/config/common";
import { ToastContext } from "@/contexts/ToastProvider";
import { useLocalStorage } from "@/hooks/localStorage";
import { convertAssignmentToDriverTask } from "@/lib/objectMapper";
import { clearAuthSession, logout } from "@/services/authService";
import {
  acceptDriverTask,
  DEFAULT_DRIVER_STATS,
  getDriverTasks,
  getDriverTaskWsUrl,
} from "@/services/driverTaskService";
import { UserAuthResponse } from "@/types/auth";
import {
  DriverAssignmentResponse,
  DriverTask,
  DriverTaskRequest,
  DriverTaskTab,
} from "@/types/driverTask";
import { toToastMessage } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Bell, LogOut, User, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import useWebSocket from "react-use-websocket";

export default function DriverTasksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DriverTaskTab>("tasks");
  const queryClient = useQueryClient();
  const [newRequest, setNewRequest] = useState<DriverTaskRequest | null>();
  const [activeTasks, setActiveTasks] = useState<DriverTask[]>([]);
  const toastCtx = useContext(ToastContext);
  const { value: authUser, setValue: setAuthUser } =
    useLocalStorage<UserAuthResponse | null>(STORAGE_KEYS.AUTH_USER, null);

  const wsUrl = useMemo(
    () => getDriverTaskWsUrl(authUser?.driver?.id),
    [authUser?.driver?.id],
  );

  const { mutate } = useMutation({
    mutationFn: async (taskId: string) => {
      await acceptDriverTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["authUser", authUser?.driver?.id],
      });
    },
    onError: (e) => {
      console.log("Accept task failed", e);
      // alert("Failed to accept task. Please try again.");
      console.log("Error from service", e);
      const message = axios.isAxiosError(e)
        ? ((e.response?.data as any)?.detail ?? e.message)
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

  const { data: driverTasks } = useQuery({
    queryKey: ["authUser", authUser?.driver?.id],
    queryFn: () => getDriverTasks(authUser?.driver?.id || ""),
  });

  useEffect(() => {
    console.log("Fetched driver tasks:", driverTasks?.items);
    setActiveTasks(
      driverTasks?.items?.map((task: DriverAssignmentResponse) =>
        convertAssignmentToDriverTask(task),
      ) || [],
    );
  }, [driverTasks]);
  console.log("driver profile ---->", driverTasks);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-32">
      <header className="p-6 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/5">
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
        {activeTab === "tasks" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {newRequest && (
              <DriverTaskRequestCard
                request={newRequest}
                onAccept={handleAcceptRequest}
                onReject={() => setNewRequest(null)}
              />
            )}

            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 flex justify-between">
                Current Missions <span>{activeTasks?.length}</span>
              </h4>

              {activeTasks?.length > 0 ? (
                activeTasks.map((task) => (
                  <DriverActiveTaskCard key={task.id} task={task} />
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">
                  No active missions.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 border border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    Available Balance
                  </p>
                  <h2 className="text-4xl font-black text-white mt-1">
                    ${DEFAULT_DRIVER_STATS.availableBalance.toFixed(2)}
                  </h2>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400">
                  <Wallet size={24} />
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-8 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-lg"
              >
                Withdraw Funds
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DriverStatCard
                label="Deliveries"
                value={String(DEFAULT_DRIVER_STATS.deliveries)}
                sub={DEFAULT_DRIVER_STATS.deliveriesDelta}
              />
              <DriverStatCard
                label="Rating"
                value={String(DEFAULT_DRIVER_STATS.rating)}
                sub={DEFAULT_DRIVER_STATS.ratingNote}
              />
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="rounded-[2rem] border border-white/10 bg-slate-900 p-6 text-center text-slate-300">
            Profile settings will be available soon.
          </div>
        )}
      </main>

      <DriverBottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
