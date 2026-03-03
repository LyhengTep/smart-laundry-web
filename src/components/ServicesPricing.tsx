import { formatLaundryServiceType, getLaundryServicePic } from "@/utils/common";
import { CreateBusinessBasicSchema } from "@/validations/businessValidation";
import { Check, ChevronDown } from "lucide-react";
import { z } from "zod";
export const ServicesPricingStep = ({
  services,
  onChange,
}: {
  services: z.infer<typeof CreateBusinessBasicSchema>["services"];
  onChange: (
    services: z.infer<typeof CreateBusinessBasicSchema>["services"],
  ) => void;
}) => {
  type ServiceItem = z.infer<typeof CreateBusinessBasicSchema>["services"][number];
  type UnitType = ServiceItem["unitType"];

  const serviceList = services || [];
  const toggleService = (id: string) => {
    onChange(
      serviceList.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  const updateField = (id: string, field: "unitType", value: UnitType) => {
    onChange(
      serviceList.map((s) => (s.id === id ? { ...s, unitType: value } : s)),
    );
  };

  const updatePrice = (id: string, value: number) => {
    onChange(serviceList.map((s) => (s.id === id ? { ...s, price: value } : s)));
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          Services & Pricing
        </h2>
        <p className="text-slate-500 mt-2">
          Define your service rates and billing units.
        </p>
      </header>

      <div className="space-y-4">
        {serviceList.map((service) => (
          <div
            key={service.id}
            className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl border-2 transition-all ${
              service.enabled
                ? "border-blue-600 bg-blue-50/20"
                : "border-slate-100 bg-white"
            }`}
          >
            {/* Left: Checkbox and Image */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => toggleService(service.id)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  service.enabled
                    ? "bg-blue-600 border-blue-600"
                    : "border-slate-300"
                }`}
              >
                {service.enabled && (
                  <Check size={14} className="text-white" strokeWidth={4} />
                )}
              </button>

              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                <img
                  src={getLaundryServicePic(service.name)}
                  alt={service.name}
                  className={`w-full h-full object-cover ${service.enabled ? "" : "grayscale opacity-40"}`}
                />
              </div>

              <div>
                <p
                  className={`font-bold ${service.enabled ? "text-slate-900" : "text-slate-400"}`}
                >
                  {formatLaundryServiceType(service.name)}
                </p>
                <p className="text-xs text-slate-400">
                  Personalize pricing logic
                </p>
              </div>
            </div>

            {/* Right: Pricing Type and Input */}
            <div
              className={`flex items-center gap-3 ${service.enabled ? "opacity-100" : "opacity-30 pointer-events-none"}`}
            >
              {/* Unit Selector */}
              <div className="relative">
                <select
                  value={service.unitType}
                  onChange={(e) =>
                    updateField(service.id, "unitType", e.target.value as UnitType)
                  }
                  className="appearance-none bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="per_kg">Per kg</option>
                  <option value="per_item">Per Item</option>
                  <option value="fixed">Fixed</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-3 text-slate-500 pointer-events-none"
                />
              </div>

              {/* Price Input */}
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 font-bold text-sm">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={service.price}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    updatePrice(
                      service.id,
                      Number.isNaN(next) ? 0 : Math.max(0, next),
                    );
                  }}
                  className="w-24 pl-7 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
