import { DriverResponse } from "@/types/driver";
import { formatDateUTC7 } from "@/utils/date";
import { Copy } from "lucide-react";
import { useState } from "react";

type Props = {
  driver: DriverResponse;
  onClose: () => void;
};

export const DriverDetailsPanel = ({ driver, onClose }: Props) => {
  const [copied, setCopied] = useState(false);
  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(driver.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Driver Details
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500">{driver.id}</p>
              <button
                onClick={handleCopyId}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition"
                aria-label="Copy driver ID"
                title="Copy ID"
              >
                {copied ? (
                  <span className="text-xs font-semibold text-emerald-600">
                    Copied
                  </span>
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-lg"
            aria-label="Close"
          >
            X
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Profile
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {driver.user.full_name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-900">
                  {driver.user.full_name}
                </div>
                <div className="text-xs text-slate-400">
                  {driver.user.email}
                </div>
              </div>
            </div>
          </section>

          <section>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Account
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Username</p>
                <p className="text-slate-900 font-semibold">
                  {driver.user.user_name}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Phone</p>
                <p className="text-slate-900 font-semibold">
                  {driver.user.phone}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Status</p>
                <p className="text-slate-900 font-semibold">
                  {driver.user.status}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Joined</p>
                <p className="text-slate-900 font-semibold">
                  {formatDateUTC7(driver.user.created_at)}
                </p>
              </div>
            </div>
          </section>

          <section>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Vehicle
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Type</p>
                <p className="text-slate-900 font-semibold">
                  {driver.vehicle_type}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Color</p>
                <p className="text-slate-900 font-semibold">
                  {driver.vehicle_color}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Plate</p>
                <p className="text-slate-900 font-semibold">
                  {driver.plate_number}
                </p>
              </div>
            </div>
          </section>

          <section>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Identity
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs">ID Card</p>
                <p className="text-slate-900 font-semibold">
                  {driver.id_card_number}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">License</p>
                <p className="text-slate-900 font-semibold">
                  {driver.license_number ?? "N/A"}
                </p>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
};
