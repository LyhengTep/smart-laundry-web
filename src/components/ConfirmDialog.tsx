import { Info } from "lucide-react";
import { ReactNode } from "react";

interface PropTypes {
  onClose: () => void;
  onConfirm: () => void;
  driverName?: string;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  tone?: "success" | "danger";
}
export const ConfirmDialog = ({
  onClose,
  onConfirm,
  driverName,
  title,
  description,
  confirmLabel,
  tone = "success",
}: PropTypes) => {
  const name = driverName || "this driver";
  const styles =
    tone === "danger"
      ? {
          iconWrap: "bg-red-50 text-red-500",
          confirm: "bg-red-600 shadow-red-200 hover:bg-red-700",
        }
      : {
          iconWrap: "bg-amber-50 text-amber-500",
          confirm: "bg-blue-600 shadow-blue-200 hover:bg-blue-700",
        };
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-200">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${styles.iconWrap}`}
        >
          <Info size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">
          {title ?? "Confirm Approval?"}
        </h3>
        <p className="text-slate-500 text-sm mb-8">
          {description ?? (
            <>
              This will allow <strong>{name}</strong> to start accepting
              delivery orders immediately.
            </>
          )}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition ${styles.confirm}`}
          >
            {confirmLabel ?? "Yes, Approve"}
          </button>
        </div>
      </div>
    </div>
  );
};
