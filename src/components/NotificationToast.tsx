"use client";

import { useEffect, useState } from "react";

const NotifcationToast = ({
  onClose,
  error,
  message,
}: {
  onClose: () => void;
  error: boolean;
  message?: string;
}) => {
  const [colorClass, setColorClass] = useState<"green" | "red">("green");

  useEffect(() => {
    setColorClass(error ? "red" : "green");
  }, [error]);

  const styles =
    colorClass === "red"
      ? {
          wrap: "bg-red-50 border-red-200",
          iconWrap: "bg-red-100",
          icon: "text-red-600",
          title: "text-red-900",
          message: "text-red-700",
          close: "text-red-700 hover:bg-red-100",
        }
      : {
          wrap: "bg-green-50 border-green-200",
          iconWrap: "bg-green-100",
          icon: "text-green-600",
          title: "text-green-900",
          message: "text-green-700",
          close: "text-green-700 hover:bg-green-100",
        };
  return (
    <div id="toast" className="fixed top-6 right-6 z-50 w-[92%] max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 shadow-lg ${styles.wrap}`}
      >
        {/* <!-- Icon --> */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.iconWrap}`}
        >
          <span className={`text-lg ${styles.icon}`}>
            {!error ? "✓" : "✕"}
          </span>
        </div>

        {/* 
        <!-- Content --> */}
        <div className="flex-1">
          <p className={`font-semibold ${styles.title}`}>
            {!error ? "Success!" : "Error!"}
          </p>
          <p className={`mt-1 text-sm ${styles.message}`}>
            {message ||
              (error
                ? "Unknown Error Occurred"
                : "You request has been completed successfully")}
          </p>
        </div>

        {/* <!-- Close button --> */}
        <button
          // onclick="document.getElementById('toast').classNameList.add('hidden')"
          onClick={onClose}
          className={`ml-2 rounded-lg px-2 py-1 ${styles.close}`}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default NotifcationToast;
