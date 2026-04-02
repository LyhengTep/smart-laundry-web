import { DriverTaskRequest } from "@/types/driverTask";
import { BadgeDollarSign, Zap } from "lucide-react";

interface DriverTaskRequestCardProps {
  request: DriverTaskRequest;
  onAccept: (request: DriverTaskRequest) => void;
  onReject: () => void;
}

export default function DriverTaskRequestCard({
  request,
  onAccept,
  onReject,
}: DriverTaskRequestCardProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-500/30 border border-white/10">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

      <div className="flex justify-between items-start mb-6">
        <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2">
          <Zap size={14} className="text-yellow-300 fill-yellow-300" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">
            Priority {request.type}
          </span>
        </div>
        <span className="text-blue-100 font-bold text-xs">{request.distance}</span>
      </div>

      <div className="space-y-2 mb-8">
        <h3 className="text-3xl font-black text-white tracking-tight">
          {request.customerName}
        </h3>
        <p className="text-blue-100 font-medium">{request.address}</p>
        <p className="text-blue-100/90 text-sm">{request.shopName}</p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onReject}
          className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl backdrop-blur-md transition-all"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => onAccept(request)}
          className="px-8 py-4 bg-white text-blue-700 font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <BadgeDollarSign size={16} /> Accept +${request.payout.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
