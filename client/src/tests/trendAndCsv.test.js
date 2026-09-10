import { describe, it, expect } from "vitest";
import { computeTrend } from "../utils/trend";
import { buildCsv } from "../utils/csv";

describe("computeTrend", () => {
  it("computes a positive percentage change correctly", () => {
    expect(computeTrend(120, 100)).toBe(20);
  });

  it("computes a negative percentage change correctly", () => {
    expect(computeTrend(80, 100)).toBe(-20);
  });

  it("rounds to 1 decimal place", () => {
    expect(computeTrend(133, 100)).toBe(33);
    expect(computeTrend(107.5, 100)).toBe(7.5);
  });

  it("never returns +0% when previous is 0 (returns null instead)", () => {
    expect(computeTrend(50, 0)).toBeNull();
    expect(computeTrend(0, 0)).toBeNull();
  });

  it("returns null when previous is null/undefined", () => {
    expect(computeTrend(50, null)).toBeNull();
    expect(computeTrend(50, undefined)).toBeNull();
  });

  it("returns null when current is null/undefined", () => {
    expect(computeTrend(null, 100)).toBeNull();
    expect(computeTrend(undefined, 100)).toBeNull();
  });

  it("returns 0 for no change (a genuine, real 0%)", () => {
    expect(computeTrend(100, 100)).toBe(0);
  });
});

describe("buildCsv", () => {
  it("builds a valid CSV with headers and rows", () => {
    const csv = buildCsv(
      ["Date", "Category", "Revenue", "Orders"],
      [
        ["2026-08-01", "Electronics", 1240, 24],
        ["2026-08-02", "Electronics", 1580, 31],
      ]
    );
    expect(csv).toBe(
      "Date,Category,Revenue,Orders\n2026-08-01,Electronics,1240,24\n2026-08-02,Electronics,1580,31"
    );
  });

  it("quotes and escapes values containing commas", () => {
    const csv = buildCsv(["Name"], [["Acme, Inc."]]);
    expect(csv).toBe('Name\n"Acme, Inc."');
  });

  it("escapes embedded double quotes by doubling them", () => {
    const csv = buildCsv(["Note"], [['He said "hi"']]);
    expect(csv).toBe('Note\n"He said ""hi"""');
  });

  it("quotes values containing newlines", () => {
    const csv = buildCsv(["Note"], [["line1\nline2"]]);
    expect(csv).toBe('Note\n"line1\nline2"');
  });

  it("renders null/undefined cells as empty strings, not the word null", () => {
    const csv = buildCsv(["A", "B"], [[null, undefined]]);
    expect(csv).toBe("A,B\n,");
  });

  it("produces just the header row for no data rows (no malformed rows)", () => {
    const csv = buildCsv(["Date", "Revenue"], []);
    expect(csv).toBe("Date,Revenue");
  });
});
