"use client";

import { STORAGE_KEYS } from "@/config/common";
import { ToastContext } from "@/contexts/ToastProvider";
import { useLocalStorage } from "@/hooks/localStorage";
import dynamic from "next/dynamic";
import { useContext, useEffect } from "react";
const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });
export default function Home() {
  const { value, setValue } = useLocalStorage(STORAGE_KEYS.AUTH_USER, null);

  const toastCtx = useContext(ToastContext);

  useEffect(() => {
    // toastCtx.setIsVisible(true);
  }, []);
  // Demo Data (In a real app, this comes from your database/ERD)
  const shops = [
    {
      name: "Bubbles & Suds",
      address: "123 University Ave, Campus North",
      rating: 4.8,
      status: "OPEN" as const,
      distance: "0.8km",
      image:
        "https://images.unsplash.com/photo-1545173168-9f1947e8017e?q=80&w=600",
    },
    {
      name: "Eco-Clean Hub",
      address: "45 Station Road",
      rating: 4.5,
      status: "CLOSED" as const,
      distance: "1.2km",
      image:
        "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=600",
    },
    {
      name: "Prime Press",
      address: "West Campus Gate",
      rating: 4.9,
      status: "OPEN" as const,
      distance: "0.5km",
      image:
        "https://images.unsplash.com/photo-1489274495744-85ff17e7ad6d?q=80&w=600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        user={value}
        onLogout={() => {
          setValue(null);
        }}
      />

      {/* Hero Section */}
      <header className="bg-white pt-12 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Laundry Day, <span className="text-blue-600">Simplified.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Choose from the best shops on campus. High-quality cleaning,
            automated tracking.
          </p>

          {/* Tracking Search */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-2 border border-slate-100 flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Track Order ID (e.g., ORD-123)..."
              className="flex-1 px-6 py-4 focus:outline-none text-slate-700 bg-slate-50 rounded-xl"
            />
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
              Find My Order
            </button>
          </div>
        </div>
      </header>

      {/* Shop Browser Section */}
      <section id="shops" className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Recommended Shops
            </h2>
            <p className="text-slate-500">
              Based on your location and top ratings
            </p>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
              All
            </button>
            <button className="text-slate-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition">
              Open Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shops.map((shop, index) => (
            <ShopCard key={index} {...shop} />
          ))}
        </div>
      </section>

      {/* Business Owner CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-blue-600 rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">
              Own a Laundry Business?
            </h2>
            <p className="text-blue-100 opacity-90">
              Manage your orders and reach more students today.
            </p>
          </div>
          <button className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition shadow-2xl">
            Register Shop
          </button>
        </div>
      </section>
    </div>
  );
}

interface ShopProps {
  name: string;
  address: string;
  rating: number;
  status: "OPEN" | "CLOSED";
  distance: string;
  image: string;
}

function ShopCard({
  name,
  address,
  rating,
  status,
  distance,
  image,
}: ShopProps) {
  const isOpen = status === "OPEN";

  return (
    <div
      className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col ${
        !isOpen && "opacity-80"
      }`}
    >
      <div className="relative h-48">
        <img
          src={image}
          className={`w-full h-full object-cover ${!isOpen && "grayscale"}`}
          alt={name}
        />
        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
          {distance} away
        </span>
        <span
          className={`absolute top-4 right-4 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${
            isOpen ? "bg-green-500" : "bg-slate-500"
          }`}
        >
          {status}
        </span>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-800">{name}</h3>
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <span className="text-sm">★ {rating}</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm mb-6 line-clamp-1">{address}</p>

        <button
          disabled={!isOpen}
          className={`w-full py-3 font-bold rounded-2xl transition-all ${
            isOpen
              ? "bg-slate-900 text-white hover:bg-blue-600"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isOpen ? "Book Laundry" : "Check Back Later"}
        </button>
      </div>
    </div>
  );
}

// interface NavProps {
//   user?: UserAuthResponse | null;
//   onLogout?: () => void;
// }
// function Navbar(props: NavProps) {
//   return (
//     <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16 items-center">
//           <Link href="/" className="flex items-center gap-2">
//             <div className="bg-blue-600 p-2 rounded-lg text-white">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-6 w-6"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
//                 />
//               </svg>
//             </div>
//             <span className="text-xl font-bold text-slate-800 tracking-tight">
//               SmartWash
//             </span>
//           </Link>
//           <div className="hidden md:flex space-x-8 text-slate-600 font-medium">
//             <Link href="#shops" className="hover:text-blue-600 transition">
//               Browse Shops
//             </Link>
//             <Link href="/orders" className="hover:text-blue-600 transition">
//               My Orders
//             </Link>
//           </div>

//           <div className="flex items-center gap-4">
//             {props.user ? (
//               <>
//                 <Link
//                   href="/user/profile"
//                   className="flex text-slate-600 font-medium hover:text-blue-600 transition"
//                 >
//                   <User className="mx-1" />
//                   My Profile
//                 </Link>
//                 <button
//                   onClick={props?.onLogout}
//                   className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition shadow-lg shadow-red-100 font-semibold"
//                 >
//                   Log out
//                 </button>
//               </>
//             ) : (
//               <>
//                 <Link
//                   href="/auth/login"
//                   className="text-slate-600 font-medium hover:text-blue-600 transition"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   href="/auth/signup"
//                   className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-100 font-semibold"
//                 >
//                   Sign Up
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }
