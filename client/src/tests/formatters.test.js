import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatNumber,
  formatDateDisplay,
  formatCompactCurrency,
  formatShortDate,
} from "../utils/formatters";

describe("formatCurrency", () => {
  it("formats a positive value as USD currency", () => {
    expect(formatCurrency(1240)).toBe("$1,240.00");
    expect(formatCurrency(29.5)).toBe("$29.50");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("returns an em dash for null/undefined/NaN", () => {
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency(undefined)).toBe("—");
    expect(formatCurrency(NaN)).toBe("—");
  });
});

describe("formatNumber", () => {
  it("adds thousands separators", () => {
    expect(formatNumber(1248)).toBe("1,248");
    expect(formatNumber(842)).toBe("842");
  });

  it("formats zero correctly", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("returns an em dash for missing values", () => {
    expect(formatNumber(null)).toBe("—");
    expect(formatNumber(undefined)).toBe("—");
  });
});

describe("formatCompactCurrency (chart axis)", () => {
  it("formats sub-thousand values as whole dollars", () => {
    expect(formatCompactCurrency(0)).toBe("$0");
    expect(formatCompactCurrency(750)).toBe("$750");
  });

  it("formats thousands with a K suffix", () => {
    expect(formatCompactCurrency(1000)).toBe("$1K");
    expect(formatCompactCurrency(2500)).toBe("$2.5K");
    expect(formatCompactCurrency(12000)).toBe("$12K");
  });

  it("formats millions with an M suffix", () => {
    expect(formatCompactCurrency(1_500_000)).toBe("$1.5M");
  });

  it("falls back to $0 for missing values", () => {
    expect(formatCompactCurrency(null)).toBe("$0");
    expect(formatCompactCurrency(undefined)).toBe("$0");
  });
});

describe("formatDateDisplay", () => {
  it("formats an ISO datetime into a readable date", () => {
    expect(formatDateDisplay("2026-08-30T10:00:00.000Z")).toMatch(/Aug 30, 2026/);
  });

  it("returns an em dash for missing/invalid values", () => {
    expect(formatDateDisplay(null)).toBe("—");
    expect(formatDateDisplay("not-a-date")).toBe("—");
  });
});

describe("formatShortDate", () => {
  it("formats a YYYY-MM-DD string without a timezone shift", () => {
    // A naive `new Date("2026-08-01")` in some timezones shifts to Jul 31 —
    // this util parses the parts manually to avoid that class of bug.
    expect(formatShortDate("2026-08-01")).toBe("Aug 1");
    expect(formatShortDate("2026-12-31")).toBe("Dec 31");
  });

  it("returns an empty string for a missing value", () => {
    expect(formatShortDate(null)).toBe("");
    expect(formatShortDate(undefined)).toBe("");
  });
});
