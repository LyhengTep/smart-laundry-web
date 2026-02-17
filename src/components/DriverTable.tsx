import { DriverResponse } from "@/types/driver";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PropsType {
  drivers: DriverResponse[];
  page: number;
  pages: number;
  total: number;
  size: number;
  onPageChange: (page: number) => void;
  onApprove: (row: any) => void;
}
export const DriverTable = ({
  drivers,
  page,
  pages,
  total,
  size,
  onPageChange,
  onApprove,
}: PropsType) => {
  const handleAction = (id: string, newStatus: "Approved" | "Rejected") => {
    // setDrivers(drivers.filter((d) => d.id !== id));
    // alert(`Driver ${id} has been ${newStatus}`);
  };

  // const { mutate } = useMutation({
  //   mutationFn: login,
  //   onError: (e) => {
  //     console.log("Error on login", e);
  //     toastCtx?.setToast &&
  //       toastCtx?.setToast({
  //         error: true,
  //         message: e?.response?.data?.detail,
  //       });
  //     toastCtx.setIsVisible(true);
  //   },

  //   onSuccess: (value) => {
  //     console.log("value return from the server", value);
  //     setValue(value);
  //     toastCtx.setIsVisible(true);
  //     setTimeout(() => {
  //       router.push("/");
  //     }, 1000);
  //   },
  // });
  // const [drivers] = useState(INITIAL_DRIVERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    onPageChange && onPageChange(currentPage);
  }, [currentPage]);
  return (
    <div>
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Driver Info
            </th>
            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Vehicle
            </th>
            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Applied Date
            </th>
            <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50">
          {drivers?.map((driver) => (
            <tr key={driver.id} className="hover:bg-slate-50/50 transition">
              <td className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
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
              </td>
              <td className="p-6">
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-lg">
                  {driver.vehicle_type}
                </span>
              </td>
              <td className="p-6 text-sm text-slate-500 font-medium">
                {driver.user.created_at}
              </td>
              <td className="p-6">
                <div className="flex justify-end gap-2">
                  <button
                    className="p-2 text-slate-400 hover:text-blue-600 transition"
                    title="View Documents"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => handleAction(driver.id, "Rejected")}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition"
                    title="Reject Application"
                  >
                    <XCircle size={20} />
                  </button>
                  <button
                    onClick={() => onApprove(driver.id)}
                    className="p-2 text-green-500 hover:bg-green-50 rounded-xl transition"
                    title="Approve Driver"
                  >
                    <CheckCircle size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Footer */}
      <div className="p-5 border-t border-slate-50 flex items-center justify-between bg-white mb-8">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Showing {(page - 1) * size + 1} to {Math.min(page * size, total)} of{" "}
            {total}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-slate-700 mx-2">
            Page {page} of {pages}
          </span>
          <button
            disabled={currentPage === pages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
