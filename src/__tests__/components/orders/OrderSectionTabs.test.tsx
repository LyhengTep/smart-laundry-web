import { OrderSectionTabs } from "@/components/orders/OrderSectionTabs";
import { fireEvent, render, screen } from "@testing-library/react";

describe("OrderSectionTabs", () => {
  it("renders both tabs", () => {
    render(<OrderSectionTabs activeSection="orders" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Orders" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Order History/i })).toBeInTheDocument();
  });

  it("calls onChange with history when history tab is clicked", () => {
    const onChange = jest.fn();
    render(<OrderSectionTabs activeSection="orders" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Order History/i }));

    expect(onChange).toHaveBeenCalledWith("history");
  });
});
