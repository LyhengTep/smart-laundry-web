"use client";
import { Bike, Store, User } from "lucide-react";

interface RoleSelectorProps {
  setType: (v: RoleKeys) => void;
  currentValue: string;
  values: Record<RoleKeys, RoleSelectorValues>;
}

type ICONS = "user" | "store" | "driver";

export type RoleSelectorValues = {
  value: string;
  icon?: ICONS;
};

export type RoleKeys = "CUSTOMER" | "MERCHANT" | "DRIVER" | "ADMIN";
const IconMapper = {
  user: User,
  store: Store,
  driver: Bike,
};
export const RoleSelector = (props: RoleSelectorProps) => {
  let keys: RoleKeys[] = Object.keys(props.values) as RoleKeys[];

  return (
    <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
      {keys.map((v) => {
        let Icon = props.values[v]?.icon
          ? IconMapper[props.values[v]?.icon]
          : null;
        return (
          <button
            key={v}
            onClick={() => props.setType(v)}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all ${
              props.currentValue === v
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {Icon && <Icon size={16} />}
            {props.values[v]?.value}
          </button>
        );
      })}
      {/* <button
        onClick={() => props.setType("CUSTOMER")}
        className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all ${
          props.currentValue === "CUSTOMER"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <User size={16} /> I'm a Customer
      </button>
      <button
        onClick={() => props.setType("MERCHANT")}
        className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all ${
          props.currentValue === "MERCHANT"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <Store size={16} /> I'm a Shop Owner
      </button> */}
    </div>
  );
};
