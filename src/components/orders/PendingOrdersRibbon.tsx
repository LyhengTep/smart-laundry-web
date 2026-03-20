import { BellRing, Check, X, Zap } from "lucide-react";
import { PendingOrderItem } from "./types";

interface PendingOrdersRibbonProps {
  pendingOrders: PendingOrderItem[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  processingOrderId?: string | null;
}

export function PendingOrdersRibbon({
  pendingOrders,
  onAccept,
  onReject,
  processingOrderId,
}: PendingOrdersRibbonProps) {
  if (pendingOrders.length === 0) {
    return null;
  }

  return (
    <section className="animate-in slide-in-from-top duration-500">
      <div className="bg-blue-600 rounded-[2.5rem] p-6 shadow-xl shadow-blue-100">
        <div className="flex items-center gap-3 mb-5 px-2">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <BellRing size={20} className="text-white animate-pulse" />
          </div>
          <h3 className="text-white font-black uppercase tracking-widest text-sm">
            Action Required: New Orders ({pendingOrders.length})
          </h3>
        </div>

        <div className="max-h-[420px] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {pendingOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-[2rem] flex items-start gap-4"
            >
              <div className="w-12 h-12 shrink-0 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-lg">
                  <Zap size={24} fill="currentColor" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold truncate">{order.title}</p>
                  <p className="text-blue-100 text-xs font-medium truncate">
                    {order.subtitle}
                  </p>
                  <p className="text-blue-100/90 text-xs truncate">
                    {order.meta}
                  </p>
                </div>

              <div className="ml-auto shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAccept(order.id)}
                  disabled={processingOrderId === order.id}
                  className="h-12 px-5 bg-white text-blue-600 rounded-2xl font-bold hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Check size={20} strokeWidth={3} />
                  <span>Accept</span>
                </button>
                <button
                  type="button"
                  onClick={() => onReject(order.id)}
                  disabled={processingOrderId === order.id}
                  className="h-12 w-12 bg-red-500/20 text-white rounded-2xl hover:bg-red-500 transition-all flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
