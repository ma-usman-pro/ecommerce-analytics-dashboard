import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "../components/common/Pagination";

describe("Pagination", () => {
  it('shows "Showing X to Y of Z"', () => {
    render(<Pagination page={2} limit={10} total={84} totalPages={9} onPageChange={vi.fn()} />);
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("84")).toBeInTheDocument();
  });

  it("disables Previous on the first page and Next on the last page", () => {
    const { rerender } = render(
      <Pagination page={1} limit={10} total={30} totalPages={3} onPageChange={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: /previous page/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next page/i })).not.toBeDisabled();

    rerender(<Pagination page={3} limit={10} total={30} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /next page/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /previous page/i })).not.toBeDisabled();
  });

  it("calls onPageChange with page+1 when Next is clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={2} limit={10} total={50} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: /next page/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange with page-1 when Previous is clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={2} limit={10} total={50} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: /previous page/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("clicking a specific page number calls onPageChange with that page", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={1} limit={10} total={30} totalPages={3} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: "3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("renders nothing when there are zero results", () => {
    const { container } = render(
      <Pagination page={1} limit={10} total={0} totalPages={0} onPageChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
