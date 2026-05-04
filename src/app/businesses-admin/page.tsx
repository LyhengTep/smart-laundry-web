"use client";

import { BusinessShopCard } from "@/components/BusinessShopCard";
import { ListingPagination } from "@/components/ListingPagination";
import { DialogCtx } from "@/contexts/DialogProvider";
import { ToastContext } from "@/contexts/ToastProvider";
import { deleteBusiness, getMyBusinesses } from "@/services/businessService";
import { Business } from "@/types/business";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

const PAGE_SIZE = 9;

const MultiShopManager = () => {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const queryClient = useQueryClient();
  const toastCtx = useContext(ToastContext);
  const dialogCtx = useContext(DialogCtx);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-businesses", page],
    queryFn: () => getMyBusinesses({ page, size: PAGE_SIZE }),
  });
  console.log("data after fetched ====>", data);
  const removeBusinessMutation = useMutation({
    mutationFn: (id: string) => deleteBusiness(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["my-businesses"],
        refetchType: "active",
      });
      toastCtx?.setToast?.({
        error: false,
        message: "Shop removed successfully.",
      });
      toastCtx?.setIsVisible(true);
    },
    onError: () => {
      toastCtx?.setToast?.({ error: true, message: "Failed to remove shop." });
      toastCtx?.setIsVisible(true);
    },
  });

  const handleSelectShop = (shop: Business) => {
    router.push(`/businesses-admin/${shop.id}/view`);
  };

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
      onConfirm: () => removeBusinessMutation.mutate(shop.id),
    });
  };

  const shops = data?.items ?? [];
  const totalPages = data?.pages ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Your <span className="text-blue-600">Shops</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              {isLoading
                ? "Loading your businesses..."
                : `${data?.total ?? 0} shop(s) in your portfolio`}
            </p>
          </div>
          <Link
            href="/businesses/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            <Plus size={20} /> Add New Shop
          </Link>
        </header>

        {isError && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-red-700 mb-6">
            Failed to load your businesses. Please try again.
          </div>
        )}

        {/* Shop grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-slate-200 bg-white p-6 h-52 animate-pulse"
                />
              ))
            : shops.map((shop) => (
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

          {/* Add shop placeholder */}
          {!isLoading && (
            <Link
              href="/businesses/new"
              className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all cursor-pointer min-h-[200px]"
            >
              <Store size={32} className="mb-2" />
              <Plus size={20} className="-mt-1" />
              <p className="font-semibold mt-2">Expand Business</p>
            </Link>
          )}
        </div>

        {/* Empty state */}
        {!isLoading && !isError && shops.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Store size={28} className="text-slate-400" />
            </div>
            <div>
              <p className="font-bold text-slate-700">No shops yet</p>
              <p className="text-sm text-slate-400 mt-0.5">
                Add your first shop to get started.
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <ListingPagination
            currentPage={page}
            pages={totalPages}
            onForward={() => setPage((p) => Math.min(p + 1, totalPages))}
            onBackward={() => setPage((p) => Math.max(p - 1, 1))}
            onPageClick={(p) => {
              const n = Number(p);
              if (!isNaN(n)) setPage(n);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MultiShopManager;
