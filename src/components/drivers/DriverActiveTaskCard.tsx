import { DriverTask } from "@/types/driverTask";
import { MessageSquare, Navigation, Package, Phone } from "lucide-react";

interface DriverActiveTaskCardProps {
  task: DriverTask;
}

export default function DriverActiveTaskCard({
  task,
}: DriverActiveTaskCardProps) {
  return (
    <div className="bg-slate-900 rounded-[2rem] border border-white/5 p-6 hover:border-blue-500/50 transition-all group">
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
          <button
            type="button"
            className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white"
            aria-label={`Call ${task.customerName}`}
          >
            <Phone size={16} />
          </button>
          <button
            type="button"
            className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white"
            aria-label={`Message ${task.customerName}`}
          >
            <MessageSquare size={16} />
          </button>
        </div>
      </div>
      <p className="text-slate-300 text-sm mb-4">{task.address}</p>
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${task.lat},${task.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-4 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 border border-blue-600/20"
      >
        <Navigation size={18} /> Start Route
      </a>
    </div>
  );
}
