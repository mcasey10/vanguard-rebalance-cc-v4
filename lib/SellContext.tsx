"use client";

import { createContext, useContext, useState } from "react";
import type { SellRecommendation } from "./types";

interface SellContextValue {
  recommendation: SellRecommendation | null;
  setRecommendation: (rec: SellRecommendation | null) => void;
}

const SellContext = createContext<SellContextValue>({
  recommendation: null,
  setRecommendation: () => {},
});

export function SellProvider({ children }: { children: React.ReactNode }) {
  const [recommendation, setRecommendation] = useState<SellRecommendation | null>(null);
  return (
    <SellContext.Provider value={{ recommendation, setRecommendation }}>
      {children}
    </SellContext.Provider>
  );
}

export function useSellContext() {
  return useContext(SellContext);
}
