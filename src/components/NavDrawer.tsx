"use client";

import { UserAuthResponse } from "@/types/auth";
import {
  ChevronRight,
  LogOut,
  Package,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onActionClick?: (value: string) => void;
  user?: UserAuthResponse | null;
  onLogout: () => void;
}

const getDrawerContent = (role: string | undefined) => {
  if (role == "CUSTOMER") {
    return [
      {
        icon: <ShoppingBag size={20} />,
        label: "My Orders",
        href: "/orders",
        key: "MY_ORDER",
      },
      {
        icon: <User size={20} />,
        label: "My Profile",
        href: "/profile",
        key: "MY_PROFILE",
      },
    ];
  }

  if (role == "MERCHANT") {
    return [];
  }
  return [];
};

export function NavDrawer({
  isOpen,
  onClose,
  onActionClick,
  user,
  onLogout,
}: DrawerProps) {
  const menuItems = getDrawerContent(user?.role);

  return (
    <>
      {/* 1. DARK OVERLAY */}
      <div
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] transition-opacity duration-300 z-50 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 2. THE DRAWER PANEL */}
      <aside
        className={`fixed top-0 left-0 h-full w-[300px] bg-slate-900 border-r border-white/5 z-[70] transition-transform duration-500 ease-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-8 pb-12 flex justify-between items-start">
          <div className="flex flex-col gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Package size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">David Miller</h2>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">
                Elite Driver
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="px-4 space-y-2">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onActionClick && onActionClick(item.key)}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 group transition-all"
            >
              <div className="flex items-center gap-4 text-slate-400 group-hover:text-white transition-colors">
                <span className="text-blue-500">{item.icon}</span>
                <span className="text-sm font-black tracking-tight">
                  {item.label}
                </span>
              </div>
              <ChevronRight
                size={16}
                className="text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
              />
            </button>
          ))}
        </nav>

        {/* Footer: Logout */}
        <div className="absolute bottom-8 left-0 right-0 px-8">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 text-red-500 font-black text-sm uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all group"
          >
            <LogOut
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
