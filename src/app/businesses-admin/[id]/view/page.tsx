"use client";
import { Bell, CheckCircle2, Clock, Plus } from "lucide-react";
import { ReactNode } from "react";

type QueueStatus = "Processing" | "Pending" | "Ready";

interface ActiveOrder {
  id: string;
  customer: string;
  service: string;
  weight: string;
  status: QueueStatus;
  time: string;
}

interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  icon: ReactNode;
}

interface StatusBadgeProps {
  status: QueueStatus;
}

const BusinessDashboard = () => {
  // Mock Data for the Order Table
  const activeOrders: ActiveOrder[] = [
    {
      id: "ORD-124",
      customer: "Alex Rivera",
      service: "Wash & Fold",
      weight: "5kg",
      status: "Processing",
      time: "10 mins ago",
    },
    {
      id: "ORD-125",
      customer: "Sarah Jen",
      service: "Dry Clean",
      weight: "--",
      status: "Pending",
      time: "25 mins ago",
    },
    {
      id: "ORD-126",
      customer: "James Ho",
      service: "Ironing",
      weight: "2kg",
      status: "Ready",
      time: "1 hour ago",
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
        <h1 className="text-lg font-semibold text-gray-800">
          Business Management
        </h1>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-blue-600 relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
            JD
          </div>
        </div>
      </header>

      <div className="p-8 max-w-6xl mx-auto">
        {/* Welcome & Quick Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Laundry Day, <span className="text-blue-600">Managed.</span>
            </h2>
            <p className="text-gray-500 mt-1">
              Here is what is happening at Bubbles & Suds today.
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-md">
            <Plus size={18} /> Create New Order
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Active Orders"
            value="12"
            trend="+3 today"
            icon={<Clock className="text-blue-600" />}
          />
          <StatCard
            label="Ready for Pickup"
            value="5"
            trend="Action required"
            icon={<CheckCircle2 className="text-green-600" />}
          />
          <StatCard
            label="Today's Revenue"
            value="$420.50"
            trend="+12% vs yesterday"
            icon={<span className="text-blue-600 font-bold">$</span>}
          />
        </div>

        {/* Active Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Live Order Queue</h3>
            <button className="text-sm text-blue-600 font-semibold hover:underline">
              View All History
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {order.customer}
                      </p>
                      <p className="text-xs text-gray-400">{order.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {order.service}
                      </span>
                      <span className="ml-2 text-xs text-gray-400 italic">
                        ({order.weight})
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.time}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 font-bold text-sm hover:text-blue-800">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

// Helper Components
const StatCard = ({ label, value, trend, icon }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
        {trend}
      </span>
    </div>
    <p className="text-gray-500 text-sm font-medium">{label}</p>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles: Record<QueueStatus, string> = {
    Processing: "bg-blue-100 text-blue-600",
    Pending: "bg-orange-100 text-orange-600",
    Ready: "bg-green-100 text-green-600",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export default BusinessDashboard;
