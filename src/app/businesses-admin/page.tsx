"use client";

import { BusinessShopCard } from "@/components/BusinessShopCard";
import { DialogCtx } from "@/contexts/DialogProvider";
import { ToastContext } from "@/contexts/ToastProvider";
import { useBusinesses } from "@/hooks/businesses/businessHook";
import { deleteBusiness } from "@/services/businessService";
import { Business } from "@/types/business";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
const MultiShopManager = () => {
  const [view, setView] = useState("selector"); // 'selector' or 'dashboard'
  const [selectedShop, setSelectedShop] = useState<Partial<Business>>({});
  const router = useRouter();
  const queryClient = useQueryClient();
  const toastCtx = useContext(ToastContext);
  const dialogCtx = useContext(DialogCtx);

  // Mock Data: Your Portfolio of Shops
  const myShops = [
    {
      id: 1,
      name: "Bubbles & Suds",
      location: "North Campus",
      status: "Open",
      orders: 12,
    },
    {
      id: 2,
      name: "Prime Press",
      location: "Downtown",
      status: "Closed",
      orders: 0,
    },
  ];

  const handleSelectShop = (shop: Business) => {
    setSelectedShop(shop);
    router.push(`/businesses-admin/${shop.id}/view`);
    // setView("dashboard");
  };

  const { data, isLoading, error } = useBusinesses();
  const removeBusinessMutation = useMutation({
    mutationFn: (id: string) => deleteBusiness(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["businesses"],
        refetchType: "active",
      });
      toastCtx?.setToast?.({
        error: false,
        message: "Shop removed successfully.",
      });
      toastCtx?.setIsVisible(true);
    },
    onError: () => {
      toastCtx?.setToast?.({
        error: true,
        message: "Failed to remove shop.",
      });
      toastCtx?.setIsVisible(true);
    },
  });

  const handleRemoveShop = (shop: Business) => {
    dialogCtx.open({
      title: "Remove this shop?",
      description: (
        <>
          This will remove <strong>{shop.name}</strong>. This action cannot be
          undone.
        </>
      ),
      confirmLabel: "Yes, Remove",
      tone: "danger",
      onConfirm: () => {
        removeBusinessMutation.mutate(shop.id);
      },
    });
  };

  console.log("Fetched Businesses:", data);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Your <span className="text-blue-600">Shops</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Select a business to manage or create a new location.
            </p>
          </div>
          <Link
            href="/businesses/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            <Plus size={20} /> Add New Shop
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.items?.map((shop) => (
            <BusinessShopCard
              key={shop.id}
              shop={shop}
              onSelect={handleSelectShop}
              onRemove={handleRemoveShop}
              removing={
                removeBusinessMutation.isPending &&
                removeBusinessMutation.variables === shop.id
              }
            />
          ))}

          {/* Empty State / Create Placeholder */}
          <Link
            href="/businesses/new"
            className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all cursor-pointer"
          >
            <Plus size={40} className="mb-2" />
            <p className="font-semibold">Expand Business</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

// const SidebarIcon = ({ icon, active = false }) => (
//   <button
//     className={`p-3 rounded-2xl transition-all ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:text-white hover:bg-white/10"}`}
//   >
//     {icon}
//   </button>
// );

export default MultiShopManager;
