export const NotifcationToast = ({
  onClose,
  error,
  message,
}: {
  onClose: () => void;
  error: boolean;
  message?: string;
}) => {
  let colorClass = error ? "red" : "green";
  return (
    <div id="toast" className=" fixed top-6 right-6 z-50 w-[92%] max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-2xl border bg-${colorClass}-50 border-${colorClass}-200 p-4 shadow-lg`}
      >
        {/* <!-- Icon --> */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-${colorClass}-100 `}
        >
          <span className={`text-${colorClass}-600 text-lg`}>
            {!error ? "✓" : "✕"}
          </span>
        </div>

        {/* 
        <!-- Content --> */}
        <div className="flex-1">
          <p className={`text-${colorClass}-900 font-semibold`}>
            {!error ? "Success!" : "Error!"}
          </p>
          <p className={`text-${colorClass}-700 mt-1 text-sm`}>
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
          className={`ml-2 rounded-lg px-2 py-1 text-${colorClass}-700 hover:bg-green-100`}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
