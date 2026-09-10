import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DollarSign } from "lucide-react";
import { StatCard } from "../components/dashboard/StatCard";

describe("StatCard", () => {
  it("renders title and value", () => {
    render(<StatCard title="Total Revenue" value="$24,850.50" icon={DollarSign} />);
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("$24,850.50")).toBeInTheDocument();
  });

  it("renders each dashboard metric correctly", () => {
    const cases = [
      { title: "Total Revenue", value: "$24,850.50" },
      { title: "Total Orders", value: "842" },
      { title: "Customers", value: "621" },
      { title: "Average Order Value", value: "$29.51" },
    ];
    cases.forEach(({ title, value }) => {
      const { unmount } = render(<StatCard title={title} value={value} />);
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
      unmount();
    });
  });

  it("shows an upward trend with a + sign styling for a positive change", () => {
    render(<StatCard title="Total Revenue" value="$100" trend={12.4} />);
    expect(screen.getByText("12.4% vs previous period")).toBeInTheDocument();
  });

  it("shows a downward trend for a negative change, using the absolute value", () => {
    render(<StatCard title="Total Orders" value="50" trend={-4.8} />);
    expect(screen.getByText("4.8% vs previous period")).toBeInTheDocument();
  });

  it('shows "n/a" when trend is null (never invents a percentage)', () => {
    render(<StatCard title="Customers" value="0" trend={null} />);
    expect(screen.getByText("vs previous period: n/a")).toBeInTheDocument();
  });

  it("renders a zero value correctly ($0, 0) without treating it as falsy/missing", () => {
    render(<StatCard title="Total Revenue" value="$0.00" trend={0} />);
    expect(screen.getByText("$0.00")).toBeInTheDocument();
    // trend of exactly 0 is a real value, not "no trend" — should still render
    expect(screen.getByText("0% vs previous period")).toBeInTheDocument();
  });
});
