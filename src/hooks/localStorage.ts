"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialvalue: T | null) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialvalue;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialvalue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return { value, setValue };
}
