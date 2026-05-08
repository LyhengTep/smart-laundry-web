import { DriverTask } from "@/types/driverTask";
import { getMapDirection } from "@/utils/common";
import {
  CheckCircle2,
  MessageSquare,
  Navigation,
  Package,
  Phone,
} from "lucide-react";

interface DriverActiveTaskCardProps {
  task: DriverTask;
  onComplete?: (task: DriverTask) => void;
  isCompleting?: boolean;
  completeLabel?: string;
  completeDisabled?: boolean;
  onCardClick?: (task: DriverTask) => void;
}

export default function DriverActiveTaskCard({
  task,
  onComplete,
  isCompleting = false,
  completeLabel,
  completeDisabled = false,
  onCardClick,
}: DriverActiveTaskCardProps) {
  const canOpenMap =
    typeof task.lat === "number" && typeof task.lng === "number";
  console.log("task in card ", task);
  return (
    <div
      onClick={() => onCardClick && onCardClick(task)}
      className="bg-slate-900 rounded-[2rem] w-full border border-white/5 p-6 hover:border-blue-500/50 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Package size={20} />
          </div>
          <div>
            <p className="font-bold text-white leading-none">
              {task.customerName}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">
              {task.type}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={`tel:${task.type === "DELIVERY" ? task.order?.customer?.phone : task.business?.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-3 bg-slate-800 rounded-xl text-green-400 hover:text-white hover:bg-green-600 transition-all"
            aria-label={`Call ${task.customerName}`}
          >
            <Phone size={16} />
          </a>
          <div className="relative group/chat">
            <button
              type="button"
              disabled
              className="p-3 bg-slate-800/50 rounded-xl text-slate-600 cursor-not-allowed"
              aria-label="Chat — coming soon"
            >
              <MessageSquare size={16} />
            </button>
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-700 text-slate-300 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full opacity-0 group-hover/chat:opacity-100 transition-opacity pointer-events-none">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
      <p className="text-slate-300 text-sm mb-4">{task.address}</p>

      <div className="bg-slate-800/50 rounded-2xl px-4 py-3 mb-4 flex flex-wrap gap-x-5 gap-y-2">
        {task.type === "PICKUP" ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pickup Fee</span>
            <span className="text-sm font-black text-white">${(task.pickupFee ?? 0).toFixed(2)}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Service Fee</span>
              <span className="text-sm font-black text-white">${(task.order?.subtotal ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Delivery Fee</span>
              <span className="text-sm font-black text-white">
                ${(task.order?.delivery_fee && task.order.delivery_fee > 0
                  ? task.order.delivery_fee
                  : (task.order?.pickup_fee ?? 0)
                ).toFixed(2)}
              </span>
            </div>
            {task.order?.has_advance_settlement && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pickup Fee</span>
                <span className="text-sm font-black text-amber-400">${(task.order?.pickup_fee ?? 0).toFixed(2)}</span>
                <span className="text-[9px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full">Advance</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href={canOpenMap ? getMapDirection(task) : "#"}
          target={canOpenMap ? "_blank" : undefined}
          rel={canOpenMap ? "noopener noreferrer" : undefined}
          className={`w-full py-4 font-black rounded-2xl transition-all flex items-center justify-center gap-2 border ${
            canOpenMap
              ? "bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border-blue-600/20"
              : "bg-slate-800 text-slate-500 border-slate-700 pointer-events-none"
          }`}
        >
          <Navigation size={18} /> Start Route
        </a>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onComplete?.(task);
          }}
          disabled={!onComplete || isCompleting || completeDisabled}
          className="w-full py-4 bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 border border-emerald-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <CheckCircle2 size={18} />
          {isCompleting
            ? "Updating..."
            : completeLabel ||
              (task.status === "PICKED_UP" ? "Delivered to Shop" : "Delivered")}
        </button>
      </div>
    </div>
  );
}
