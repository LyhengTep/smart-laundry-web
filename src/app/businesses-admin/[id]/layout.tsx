"use client";
import {
  getBusinessById,
  updateBusinessStatus,
} from "@/services/businessService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  LayoutDashboard,
  Loader2,
  Menu,
  Package,
  Settings,
  Store,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";

const BusinessLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: business } = useQuery({
    queryKey: ["business", params.id],
    queryFn: () => getBusinessById(params.id),
    enabled: !!params.id,
  });

  const shopName = business?.name ?? "{shopName}";
  const shopStatus = business?.status;
  const isOpen = shopStatus === "OPEN";
  const canToggle = shopStatus === "OPEN" || shopStatus === "CLOSED";

  const toggleStatusMutation = useMutation({
    mutationFn: (status: "OPEN" | "CLOSED") =>
      updateBusinessStatus(params.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business", params.id] });
    },
  });

  const navItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Overview",
      href: `/businesses-admin/${params.id}/view`,
    },
    {
      icon: <Package size={20} />,
      label: "Orders",
      href: `/businesses-admin/${params.id}/orders`,
    },
    {
      icon: <Store size={20} />,
      label: "Shop Profile",
      href: `/businesses-admin/${params.id}/profile`,
    },
    // { icon: <Settings size={20} />, label: "Settings", href: `/businesses-admin/${params.id}/settings` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-stretch">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky md:top-0 z-50 top-0 left-0 h-screen w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 overflow-y-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Store size={20} />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">
              {shopName}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        <div className="px-4 pb-6 space-y-1">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all text-sm font-medium"
          >
            <Settings size={18} />
            Settings
          </button>
          <Link
            href="/businesses-admin"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Back to My Shops
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1 rounded-md text-white">
              <Store size={16} />
            </div>
            <span className="font-bold text-slate-900">{shopName}</span>
          </div>
        </header>

        {children}
      </main>

      {/* Settings Drawer */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-xl">
                  <Settings size={18} className="text-gray-500" />
                </div>
                <h2 className="text-lg font-black text-gray-900">
                  Shop Settings
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-gray-50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Store
                      size={20}
                      className={isOpen ? "text-green-600" : "text-slate-400"}
                    />
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        Shop Status
                      </p>
                      <p className="text-xs text-gray-400">
                        {canToggle
                          ? "Toggle to open or close your shop"
                          : `Cannot change while status is ${shopStatus}`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!canToggle || toggleStatusMutation.isPending}
                    onClick={() =>
                      toggleStatusMutation.mutate(isOpen ? "CLOSED" : "OPEN")
                    }
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      isOpen ? "bg-green-500" : "bg-slate-300"
                    }`}
                  >
                    {toggleStatusMutation.isPending ? (
                      <Loader2
                        size={12}
                        className="absolute left-1/2 -translate-x-1/2 text-white animate-spin"
                      />
                    ) : (
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isOpen ? "translate-x-6" : "translate-x-1"}`}
                      />
                    )}
                  </button>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isOpen ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {isOpen ? (
                      <Check size={11} strokeWidth={3} />
                    ) : (
                      <X size={11} />
                    )}
                    {shopStatus ?? "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({
  icon,
  label,
  active = false,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href: string;
  onClick?: () => void;
}) => (
  <a
    href={href}
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-500 hover:bg-gray-100"}`}
  >
    {icon}
    <span>{label}</span>
  </a>
);

export default BusinessLayout;
