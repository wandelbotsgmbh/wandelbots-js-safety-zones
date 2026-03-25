"use client";

import { createContext, useContext } from "react";
import type { WandelApp } from "./WandelApp.ts";

export const WandelAppContext = createContext<WandelApp | null>(null);

export const useWandelApp = () => {
  const state = useContext(WandelAppContext);
  if (!state) {
    throw new Error("useWandelApp must be used within WandelAppLoader");
  }
  return state;
};

export function useActiveRobot() {
  const { activeRobot } = useWandelApp();
  if (!activeRobot) {
    throw new Error("Expected active robot");
  }
  return activeRobot;
}
