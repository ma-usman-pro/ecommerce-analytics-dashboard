import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getPresetRange,
  PRESET_URL_CODES,
  presetFromUrlCode,
} from "../utils/dateRanges";

const DashboardFilterContext = createContext(null);

export const DEFAULT_PRESET = "Last 30 Days";
const DEFAULT_CATEGORY = "All";

function initialStateFromUrl(searchParams) {
  const rangeCode = searchParams.get("range");
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  const presetFromUrl = rangeCode ? presetFromUrlCode(rangeCode) : null;

  if (presetFromUrl === "Custom" && startParam && endParam) {
    return { preset: "Custom", range: { startDate: startParam, endDate: endParam } };
  }
  if (presetFromUrl) {
    return { preset: presetFromUrl, range: getPresetRange(presetFromUrl) };
  }
  return { preset: DEFAULT_PRESET, range: getPresetRange(DEFAULT_PRESET) };
}

export function DashboardFilterProvider({ children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = useRef(initialStateFromUrl(searchParams)).current;

  const [preset, setPreset] = useState(initial.preset);
  const [range, setRange] = useState(initial.range);
  const [category, setCategory] = useState(
    () => searchParams.get("category") || DEFAULT_CATEGORY
  );

  // Keep the URL in sync (replace, not push, so filter changes don't spam
  // browser history) whenever a filter changes.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set("range", PRESET_URL_CODES[preset] || "30d");
    if (category && category !== DEFAULT_CATEGORY) {
      next.set("category", category);
    } else {
      next.delete("category");
    }
    if (preset === "Custom" && range.startDate && range.endDate) {
      next.set("start", range.startDate);
      next.set("end", range.endDate);
    } else {
      next.delete("start");
      next.delete("end");
    }
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, range, category]);

  const selectPreset = (nextPreset) => {
    setPreset(nextPreset);
    const computed = getPresetRange(nextPreset);
    if (computed) setRange(computed);
    // "Custom" leaves `range` as-is until the user picks explicit dates.
  };

  const setCustomRange = (startDate, endDate) => {
    setPreset("Custom");
    setRange({ startDate, endDate });
  };

  const resetFilters = () => {
    setPreset(DEFAULT_PRESET);
    setRange(getPresetRange(DEFAULT_PRESET));
    setCategory(DEFAULT_CATEGORY);
  };

  const isDefault = preset === DEFAULT_PRESET && category === DEFAULT_CATEGORY;

  const value = useMemo(
    () => ({
      preset,
      startDate: range.startDate,
      endDate: range.endDate,
      category,
      selectPreset,
      setCustomRange,
      setCategory,
      resetFilters,
      isDefault,
    }),
    [preset, range, category, isDefault]
  );

  return (
    <DashboardFilterContext.Provider value={value}>
      {children}
    </DashboardFilterContext.Provider>
  );
}

export function useDashboardFilters() {
  const ctx = useContext(DashboardFilterContext);
  if (!ctx) throw new Error("useDashboardFilters must be used within a DashboardFilterProvider");
  return ctx;
}
