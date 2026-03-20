import { CheckCircle2, Clock, Package } from "lucide-react";
import { OrderSection } from "./types";
import { StatCard } from "./StatCard";

interface OrdersStatsBarProps {
  activeSection: OrderSection;
  visibleCount: number;
  processingCount: number;
  completedCount: number;
}

export function OrdersStatsBar({
  activeSection,
  visibleCount,
  processingCount,
  completedCount,
}: OrdersStatsBarProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        icon={<Package size={24} />}
        label={activeSection === "orders" ? "Active Orders" : "Total History"}
        value={String(visibleCount)}
        trend={activeSection === "orders" ? "Live" : "Archived"}
        color="blue"
      />
      <StatCard
        icon={<Clock size={24} />}
        label="In Processing"
        value={String(processingCount)}
        trend="Running"
        color="orange"
      />
      <StatCard
        icon={<CheckCircle2 size={24} />}
        label="Completed"
        value={String(completedCount)}
        trend="Done"
        color="green"
      />
    </section>
  );
}
