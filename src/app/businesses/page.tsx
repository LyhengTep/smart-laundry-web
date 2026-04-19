"use client";

import { ListingPagination } from "@/components/ListingPagination";
import Navbar from "@/components/Navbar";
import { ShopCard } from "@/components/ShopCard";
import { STORAGE_KEYS } from "@/config/common";
import { useBusinesses } from "@/hooks/businesses/businessHook";
import { useLocalStorage } from "@/hooks/localStorage";
import { UserAuthResponse } from "@/types/auth";
import { Business } from "@/types/business";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const mockBusiness: Business = {
  id: "biz-001",
  owner_id: "user-123",
  name: "Fresh Laundry Phnom Penh",
  status: "ACTIVE",
  address: "Street 2004, Phnom Penh, Cambodia",
  phone: "+855 12 345 678",
  latitude: 11.5683,
  longitude: 104.8945,
  profile_image_url: "https://picsum.photos/200/200",
  cover_image_url: "https://picsum.photos/800/300",
  rating_avg: 4.6,
  business_license_number: "LIC-PP-2024-001",
  open_time: "08:00",
  close_time: "21:00",
  created_at: "2026-04-18T09:00:00Z",
  updated_at: "2026-04-18T09:30:00Z",
};
export default function AllShopsPage() {
  const [nextPage, setNextPage] = useState(1);
  const [isOpenFilter, setIsOpenFilter] = useState<boolean | undefined>();
  const [search, setSearch] = useState("");
  const { value, setValue } = useLocalStorage<UserAuthResponse | null>(
    STORAGE_KEYS.AUTH_USER,
    null,
  );

  // const { data } = useQuery({
  //   queryKey: ["all_shops"],
  //   queryFn: () => getBusinesses(),
  //   staleTime: 1000 * 60 * 5,
  // });
  const { data, isLoading, isError } = useBusinesses({
    page: nextPage,
    size: 10,
    is_open: isOpenFilter,
    q: search,
  });

  console.log("data after fetched ====>", data);

  return (
    <div className="min-h-screen text-white">
      {/* --- HEADER (Matching your design) --- */}

      <Navbar
        user={value}
        onDrawerClick={() => {
          // setIsDrawerOpen(true)
        }}
        onLogout={() => {
          // doLogout();
        }}
      />

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Title & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              All Shops
            </h1>
            <p className="text-slate-500 text-sm">
              {data?.total} shop(s) available in your area
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shops..."
                className="w-full text-foreground border border-foreground/50 placeholder-foreground/10 rounded-2xl py-3.5 pl-12 pr-4 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <button className="p-3.5 border border-foreground/50 rounded-2xl text-slate-400 hover:text-foreground">
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        <div className="flex justify-end items-end mb-6 px-2">
          <div className="flex items-center gap-6">
            {/* Existing Filter Pills */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpenFilter(undefined)}
                className={`${isOpenFilter ? "bg-background text-slate-400 border border-forground/50 hover:border-blue-500 hover:text-blue-500" : "bg-blue-600 text-white"} px-4 py-1.5 rounded-lg text-sm font-bold`}
              >
                All
              </button>
              <button
                onClick={() => setIsOpenFilter(true)}
                className={`${isOpenFilter ? "bg-blue-600 text-white" : "bg-background text-slate-400 border border-forground/50 hover:border-blue-500 hover:text-blue-500"} px-4 py-1.5 rounded-lg text-sm font-bold`}
              >
                Open Now
              </button>
            </div>
          </div>
        </div>
        {/* --- DYNAMIC GRID --- */}

        {isLoading ? (
          <p>Loading......</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {data?.items.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}

        {/* --- PAGINATION --- */}

        {search == "" && !isLoading && (
          <ListingPagination
            currentPage={nextPage}
            pages={data?.pages || 0}
            onForward={() => {
              setNextPage((currentPage) => {
                return currentPage == data?.total
                  ? currentPage
                  : currentPage + 1;
              });
            }}
            onBackward={() => {
              setNextPage((currentPage) => {
                return currentPage == 1 ? currentPage : currentPage - 1;
              });
            }}
            onPageClick={(page) => {
              let validPage = Number(page);
              if (!isNaN(validPage)) {
                setNextPage(validPage);
              }
            }}
          />
        )}
      </main>
    </div>
  );
}
