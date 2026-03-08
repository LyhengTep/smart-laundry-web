"use client";
import { LayoutDashboard, Package, Settings, Store } from "lucide-react";
import { useParams, usePathname } from "next/navigation";

const BusinessLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  console.log("Business ID from Layout:", params.id); // Debugging line to check if ID is received
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Store size={20} />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">
            Smart Laundry
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Overview"
            active={pathname === `/businesses/${params.id}/view`}
            href={`/businesses/${params.id}/view`}
          />
          <NavItem
            icon={<Package size={20} />}
            label="Orders"
            active={pathname === `/businesses/${params.id}/orders`}
            href={`/businesses/${params.id}/orders`}
          />
          <NavItem
            icon={<Store size={20} />}
            label="Shop Profile"
            active={pathname === `/businesses/${params.id}/profile`}
            href={`/businesses/${params.id}/profile`}
          />
          <NavItem
            icon={<Settings size={20} />}
            label="Settings"
            active={pathname === `/businesses/${params.id}/settings`}
            href={`/businesses/${params.id}/settings`}
          />
        </nav>
      </aside>
      {children}
    </div>
  );
};

// Helper Components
const NavItem = ({
  icon,
  label,
  active = false,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href: string;
}) => (
  <a
    href={href}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-500 hover:bg-gray-100"}`}
  >
    {icon}
    <span>{label}</span>
  </a>
);

export default BusinessLayout;
