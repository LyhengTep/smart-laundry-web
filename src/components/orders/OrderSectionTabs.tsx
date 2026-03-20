import { History } from "lucide-react";
import { OrderSection } from "./types";

interface OrderSectionTabsProps {
  activeSection: OrderSection;
  onChange: (section: OrderSection) => void;
}

export function OrderSectionTabs({ activeSection, onChange }: OrderSectionTabsProps) {
  return (
    <section className="bg-white rounded-[2rem] border border-slate-100 p-2 w-fit shadow-sm">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange("orders")}
          className={`px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider transition-all ${
            activeSection === "orders"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Orders
        </button>
        <button
          type="button"
          onClick={() => onChange("history")}
          className={`px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSection === "history"
              ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <History size={14} />
          Order History
        </button>
      </div>
    </section>
  );
}
