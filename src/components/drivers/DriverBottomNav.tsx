import { DriverTaskTab } from "@/types/driverTask";
import { LayoutDashboard, TrendingUp, User } from "lucide-react";

interface DriverBottomNavProps {
  activeTab: DriverTaskTab;
  onChange: (value: DriverTaskTab) => void;
}

export default function DriverBottomNav({
  activeTab,
  onChange,
}: DriverBottomNavProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex justify-between shadow-2xl shadow-black/50">
        <NavButton
          active={activeTab === "tasks"}
          onClick={() => onChange("tasks")}
          icon={<LayoutDashboard size={20} />}
          label="Home"
        />
        <NavButton
          active={activeTab === "history"}
          onClick={() => onChange("history")}
          icon={<TrendingUp size={20} />}
          label="Stats"
        />
        <NavButton
          active={activeTab === "profile"}
          onClick={() => onChange("profile")}
          icon={<User size={20} />}
          label="Account"
        />
      </div>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function NavButton({ active, icon, label, onClick }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[2rem] transition-all duration-300 ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 px-6"
          : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {icon}
      {active && (
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
      )}
    </button>
  );
}
