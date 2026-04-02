interface DriverStatCardProps {
  label: string;
  value: string;
  sub: string;
}

export default function DriverStatCard({ label, value, sub }: DriverStatCardProps) {
  return (
    <div className="bg-slate-900 border border-white/5 p-6 rounded-[2rem]">
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
        {label}
      </p>
      <div className="flex items-baseline gap-2 mt-1">
        <h3 className="text-2xl font-black text-white">{value}</h3>
        <span className="text-[10px] font-bold text-green-400">{sub}</span>
      </div>
    </div>
  );
}
