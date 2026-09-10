import { describe, it, expect } from "vitest";
import {
  DATE_PRESETS,
  getPresetRange,
  getPreviousRange,
  PRESET_URL_CODES,
  presetFromUrlCode,
  formatRangeLabel,
} from "../utils/dateRanges";

describe("DATE_PRESETS", () => {
  it("includes all required presets", () => {
    expect(DATE_PRESETS).toEqual([
      "Today",
      "Last 7 Days",
      "Last 30 Days",
      "Last 90 Days",
      "This Year",
      "Custom",
    ]);
  });
});

describe("getPresetRange", () => {
  it("Today returns the same start and end date", () => {
    const { startDate, endDate } = getPresetRange("Today");
    expect(startDate).toBe(endDate);
  });

  it("Last 7 Days spans exactly 7 days inclusive", () => {
    const { startDate, endDate } = getPresetRange("Last 7 Days");
    const days = (new Date(endDate) - new Date(startDate)) / 86400000 + 1;
    expect(days).toBe(7);
  });

  it("Last 30 Days spans exactly 30 days inclusive", () => {
    const { startDate, endDate } = getPresetRange("Last 30 Days");
    const days = (new Date(endDate) - new Date(startDate)) / 86400000 + 1;
    expect(days).toBe(30);
  });

  it("Last 90 Days spans exactly 90 days inclusive", () => {
    const { startDate, endDate } = getPresetRange("Last 90 Days");
    const days = (new Date(endDate) - new Date(startDate)) / 86400000 + 1;
    expect(days).toBe(90);
  });

  it("This Year starts on January 1st of the current year", () => {
    const { startDate } = getPresetRange("This Year");
    expect(startDate.endsWith("-01-01")).toBe(true);
  });

  it("returns null for Custom (caller keeps its own dates)", () => {
    expect(getPresetRange("Custom")).toBeNull();
  });
});

describe("getPreviousRange", () => {
  it("returns the immediately preceding period of the same length", () => {
    // A 30-day window (Aug 1 - Aug 30) should compare against the 30 days
    // immediately before it (Jul 2 - Jul 31) — no gap, no overlap.
    const prev = getPreviousRange("2026-08-01", "2026-08-30");
    expect(prev).toEqual({ startDate: "2026-07-02", endDate: "2026-07-31" });
  });

  it("handles a single-day range", () => {
    const prev = getPreviousRange("2026-08-15", "2026-08-15");
    expect(prev).toEqual({ startDate: "2026-08-14", endDate: "2026-08-14" });
  });

  it("returns null when dates are missing", () => {
    expect(getPreviousRange(null, null)).toBeNull();
  });
});

describe("PRESET_URL_CODES / presetFromUrlCode", () => {
  it("round-trips every preset through its URL code", () => {
    for (const preset of DATE_PRESETS) {
      const code = PRESET_URL_CODES[preset];
      expect(presetFromUrlCode(code)).toBe(preset);
    }
  });

  it("returns null for an unknown code", () => {
    expect(presetFromUrlCode("bogus")).toBeNull();
  });
});

describe("formatRangeLabel", () => {
  it("formats a range as 'Mon DD, YYYY → Mon DD, YYYY'", () => {
    expect(formatRangeLabel("2026-08-01", "2026-08-31")).toBe("Aug 01, 2026 \u2192 Aug 31, 2026");
  });

  it("returns an empty string when either date is missing", () => {
    expect(formatRangeLabel(null, "2026-08-31")).toBe("");
    expect(formatRangeLabel("2026-08-01", null)).toBe("");
  });
});
