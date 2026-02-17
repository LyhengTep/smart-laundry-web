import { Info } from "lucide-react";

interface PropTypes {
  onClose: () => void;
}
export const ConfirmDialog = ({ onClose }: PropTypes) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-200">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Info size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">
          Confirm Approval?
        </h3>
        <p className="text-slate-500 text-sm mb-8">
          This will allow <strong>{}</strong> to start accepting delivery orders
          immediately.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            // onClick={confirmApproval}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
          >
            Yes, Approve
          </button>
        </div>
      </div>
    </div>
  );
};
