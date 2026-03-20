import { ArrowUpRight, Filter, Search } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { OrderItem, OrderSection } from "./types";

type SearchField = "order_no" | "customer_id" | "business_id";

interface OrdersTableProps {
  activeSection: OrderSection;
  orders: OrderItem[];
  onRowClick?: (order: OrderItem) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchField: SearchField;
  onSearchFieldChange: (value: SearchField) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  statusOptions: string[];
}

export function OrdersTable({
  activeSection,
  orders,
  onRowClick,
  searchTerm,
  onSearchChange,
  searchField,
  onSearchFieldChange,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
}: OrdersTableProps) {
  return (
    <section className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 mx-4 my-7">
        <div className="w-full md:w-auto">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            {activeSection === "orders" ? "Live queue" : "Past records"}
          </p>
          <h3 className="text-xl font-black text-slate-900">
            {activeSection === "orders" ? "Current Orders" : "Order History"}
          </h3>
        </div>
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-4 top-3.5 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder={
              searchField === "customer_id"
                ? "Search by customer ID..."
                : searchField === "business_id"
                  ? "Search by business ID..."
                  : "Search by order no..."
            }
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 font-bold text-slate-600 bg-slate-50 rounded-2xl">
            <Search size={16} />
            <select
              value={searchField}
              onChange={(e) =>
                onSearchFieldChange(e.target.value as SearchField)
              }
              className="bg-transparent text-sm font-bold outline-none"
            >
              <option value="order_no">Order No</option>
              <option value="customer_id">Customer ID</option>
              <option value="business_id">Business ID</option>
            </select>
          </div>
          <div className="flex items-center gap-2 py-2.5 font-bold text-slate-600 bg-slate-50 rounded-2xl">
            <Filter size={18} />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none"
            >
              <option value="">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto ">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                Customer & ID
              </th>
              {/* <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                Service Type
              </th> */}
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                Status
              </th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                Amount
              </th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((order) => (
              <tr
                key={order.id}
                className={`hover:bg-blue-50/30 transition-colors group ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={() => onRowClick?.(order)}
              >
                <td className="px-6 py-6">
                  <p className="font-bold text-slate-900">{order.customer}</p>
                  <p className="text-xs text-slate-400 font-medium">
                    {order.id}
                  </p>
                  {/* <p className="text-xs text-slate-400 font-medium">
                    Pickup: {order.pickupAt}
                  </p> */}
                  <p className="text-xs text-slate-400 font-medium">
                    Deliver: {order.dropoffAt}
                  </p>
                </td>
                {/* <td className="px-6 py-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">
                      {order.service}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg">
                      {order.weight}
                    </span>
                  </div>
                </td> */}
                <td className="px-6 py-6">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-6 font-black text-slate-900">
                  {order.price}
                </td>
                <td className="px-6 py-6 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick?.(order);
                    }}
                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                  >
                    <ArrowUpRight size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-8 py-10 text-center text-slate-400 font-medium"
                >
                  No{" "}
                  {activeSection === "orders"
                    ? "active orders"
                    : "order history"}{" "}
                  yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
