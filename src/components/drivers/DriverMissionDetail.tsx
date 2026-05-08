"use client";

import { DriverTask } from "@/types/driverTask";
import { getMapDirection } from "@/utils/common";
import { MessageSquare, Navigation, Package, Phone } from "lucide-react";
import { useEffect, useMemo } from "react";

type DriverMissionDetailProps = {
  onClose?: () => void;
  open: boolean;
  data: DriverTask;
};

type MissionDetail = {
  pickup: {
    address: string;
    lat: number;
    lng: number;
    name: string;
  };
  deliver: {
    address: string;
    lat: number;
    lng: number;
    name: string;
  };
};

const STATUS_STYLES: Record<string, string> = {
  ACCEPTED: "bg-blue-500/15 text-blue-300 border-blue-400/30",
  PICKED_UP: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  DELIVERED_TO_SHOP: "bg-indigo-500/15 text-indigo-300 border-indigo-400/30",
  DELIVERED: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  REJECTED: "bg-rose-500/15 text-rose-300 border-rose-400/30",
};

const getStatusLabel = (status?: string) =>
  (status || "UNKNOWN")
    .toUpperCase()
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

export default function DriverMissionDetail(props: DriverMissionDetailProps) {
  const getPreviewTarget = () => {
    const isPickedUp = (props.data.status || "").toUpperCase() === "PICKED_UP";
    if (isPickedUp) {
      return {
        lat: props.data.business?.latitude,
        lng: props.data.business?.longitude,
        label: "Destination Preview",
      };
    }

    return {
      lat: props.data.lat,
      lng: props.data.lng,
      label: "Pickup Preview",
    };
  };

  const previewTarget = getPreviewTarget();
  const hasPreviewLocation =
    typeof previewTarget.lat === "number" &&
    typeof previewTarget.lng === "number";
  const previewMapUrl = hasPreviewLocation
    ? `https://maps.google.com/maps?q=${previewTarget.lat},${previewTarget.lng}&z=15&output=embed`
    : "";

  useEffect(() => {
    if (props.open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [props.open]);

  const task = useMemo<MissionDetail>(() => {
    if (props.data.type == "PICKUP") {
      return {
        pickup: {
          address: props.data.order?.pickup_address || "",
          lat: props.data.order?.pickup_latitude || 0,
          lng: props.data.order?.pickup_longitude || 0,
          name: props.data.order?.customer?.full_name || "",
        },
        deliver: {
          address: props.data.business?.address || "",
          lat: props.data.business?.latitude || 0,
          lng: props.data.business?.longitude || 0,
          name: props.data.business?.name || "",
        },
      };
    }

    return {
      pickup: {
        address: props.data.business?.address || "",
        lat: props.data.business?.latitude || 0,
        lng: props.data.business?.longitude || 0,
        name: props.data.business?.name || "",
      },
      deliver: {
        address: props.data.order?.delivery_address || "",
        lat: props.data.order?.delivery_latitude || 0,
        lng: props.data.order?.delivery_longitude || 0,
        name: props.data.order?.customer?.full_name || "",
      },
    };
  }, [props.data]);

  if (!props.open) return null;
  return (
    /* Outer Desk Background */
    <div className="fixed inset-0 z-40 w-full overflow-y-auto font-sans bg-foreground/95">
      {/* --- MISSION CONTENT --- */}
      <main className="w-full max-w-2xl mx-auto px-4 md:px-6 pt-4 pb-40 space-y-8 min-h-full">
        <div className="flex flex-col">
          <button
            onClick={props.onClose}
            className="text-white text-2xl self-end border-2 border-solid rounded-full w-[35px] h-[35px]"
          >
            x
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Mission Detail
            </h2>
            <span className="text-xs font-bold text-blue-500">
              #{props.data?.order?.order_no}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Status
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                STATUS_STYLES[(props.data?.status || "").toUpperCase()] ||
                "bg-slate-700/50 text-slate-200 border-slate-500/30"
              }`}
            >
              {getStatusLabel(props.data?.status)}
            </span>
          </div>
        </div>

        {/* EARNINGS CARD */}
        <div className="bg-blue-600 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-600/20 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
              <Package size={24} />
            </div>
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">
              {props.data.type === "PICKUP" ? "Pickup Fee Summary" : "Collection Summary"}
            </p>
          </div>

          <div className="relative z-10 space-y-2">
            {props.data.type === "PICKUP" ? (
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-blue-100">Pickup Fee</span>
                <span className="text-3xl font-black text-white">
                  ${(props.data.pickupFee ?? 0).toFixed(2)}
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm font-bold text-blue-100">Service Fee</span>
                  <span className="text-lg font-black text-white">
                    ${(props.data.order?.subtotal ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm font-bold text-blue-100">Delivery Fee</span>
                  <span className="text-lg font-black text-white">
                    ${(props.data.order?.delivery_fee && props.data.order.delivery_fee > 0
                      ? props.data.order.delivery_fee
                      : (props.data.order?.pickup_fee ?? 0)
                    ).toFixed(2)}
                  </span>
                </div>
                {props.data.order?.has_advance_settlement && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm font-bold text-blue-100 flex items-center gap-2">
                      Pickup Fee
                      <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400/30 text-amber-200 px-2 py-0.5 rounded-full border border-amber-300/30">
                        Advance
                      </span>
                    </span>
                    <span className="text-lg font-black text-white">
                      ${(props.data.order?.pickup_fee ?? 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {(() => {
                  const dFee = props.data.order?.delivery_fee && props.data.order.delivery_fee > 0
                    ? props.data.order.delivery_fee
                    : (props.data.order?.pickup_fee ?? 0);
                  const advanceFee = props.data.order?.has_advance_settlement ? (props.data.order?.pickup_fee ?? 0) : 0;
                  return (
                    <div className="border-t border-white/20 mt-2 pt-3 flex justify-between items-center">
                      <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">
                        Total to Collect
                      </span>
                      <span className="text-3xl font-black text-white">
                        ${((props.data.order?.subtotal ?? 0) + dFee + advanceFee).toFixed(2)}
                      </span>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            {previewTarget.label}
          </p>
          <div className="rounded-3xl border border-white/10 overflow-hidden bg-slate-900">
            {hasPreviewLocation ? (
              <iframe
                title="Mission map preview"
                src={previewMapUrl}
                className="w-full h-52 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="h-52 flex items-center justify-center text-slate-400 text-sm">
                Map preview is unavailable.
              </div>
            )}
          </div>
        </div>

        {/* LOGISTICS STEPS */}
        <div className="space-y-10 px-2">
          {/* PICKUP */}
          <div className="relative pl-12">
            <div className="absolute left-[9px] top-2 w-[2px] h-[150%] bg-slate-800" />
            <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                  Pickup From
                </p>
                <h3 className="text-lg font-black text-white leading-tight">
                  {task?.pickup.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {task?.pickup.address}
                </p>
              </div>
              <a
                href={getMapDirection(props?.data)}
                target="_blank"
                className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all"
              >
                <Navigation size={16} className="text-blue-500" /> Start
                Navigation
              </a>
            </div>
          </div>

          {/* DROP-OFF */}
          <div className="relative pl-12">
            <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-slate-800 border-4 border-slate-900" />
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Deliver To
                </p>
                <h3 className="text-lg font-black text-white leading-tight">
                  {task?.deliver.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {task?.deliver.address}
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href={`tel:${props.data.type === "DELIVERY" ? props.data.order?.customer?.phone : props.data.business?.phone}`}
                  className="flex-1 py-4 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  <Phone size={16} className="text-green-500" /> Call
                </a>
                <div className="relative flex-1 group/chat">
                  <button
                    type="button"
                    disabled
                    className="w-full py-4 bg-slate-900/30 border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-not-allowed"
                  >
                    <MessageSquare size={16} /> Chat
                  </button>
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-700 text-slate-300 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full opacity-0 group-hover/chat:opacity-100 transition-opacity pointer-events-none">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
