"use client";

import { Home, MessageCircle, Search } from "lucide-react";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      {/* Visual Element */}
      <div className="relative mb-8">
        <div className="text-[12rem] font-black text-slate-50 select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-200 animate-bounce">
            <Search size={48} className="text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
        Laundry Day, <span className="text-blue-600">Interrupted.</span>
      </h1>
      <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg">
        We couldn’t find the page you’re looking for. It might have been moved
        or doesn’t exist anymore.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
        >
          <Home size={20} />
          Back to Home
        </Link>

        <Link
          href="/support"
          className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-8 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all"
        >
          <MessageCircle size={20} />
          Contact Support
        </Link>
      </div>

      {/* Subtle Footer */}
      <div className="mt-16 text-slate-400 text-sm">
        <p>© 2026 Smart Laundry System</p>
      </div>
    </div>
  );
};

export default NotFound;
