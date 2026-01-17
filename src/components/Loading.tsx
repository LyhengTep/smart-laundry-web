import animationData from "@/assets/loader_cat.json";
import Lottie from "react-lottie";

export default function Loading({ label = "Loading…" }: { label?: string }) {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div className="min-h-screen absolute h-full w-full flex items-center justify-center bg-black/70">
      {/* <div className="w-full max-w-sm rounded-3xl border bg-white p-10 text-center shadow-sm"> */}
      <Lottie options={defaultOptions} height={400} width={400} />
      {/* <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600">
          <span className="text-white text-2xl">🌀</span>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900">Smart Laundry</h1>
        <p className="mt-2 text-slate-500">{label}</p>

        <div className="mt-6 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
        </div> */}
      {/* </div> */}
    </div>
  );
}
