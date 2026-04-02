import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrderItem } from "@/components/orders/types";
import { render, screen } from "@testing-library/react";

const orders: OrderItem[] = [
  {
    id: "ORD-001",
    customer: "Alex",
    service: "Wash & Fold",
    weight: "2kg",
    price: "$10.00",
    status: "Processing",
    pickupAt: "2026-03-18 09:00",
    dropoffAt: "2026-03-19 18:00",
  },
];

describe("OrdersTable", () => {
  const baseProps = {
    searchTerm: "",
    onSearchChange: jest.fn(),
    searchField: "order_no" as const,
    onSearchFieldChange: jest.fn(),
    statusFilter: "",
    onStatusFilterChange: jest.fn(),
    statusOptions: ["PENDING", "DELIVERED"],
  };

  it("shows section title based on active section", () => {
    render(<OrdersTable activeSection="orders" orders={orders} {...baseProps} />);
    expect(screen.getByText("Current Orders")).toBeInTheDocument();
  });

  it("renders empty state when no orders", () => {
    render(<OrdersTable activeSection="history" orders={[]} {...baseProps} />);
    expect(screen.getByText("No order history yet.")).toBeInTheDocument();
  });

  it("renders order row data", () => {
    render(<OrdersTable activeSection="orders" orders={orders} {...baseProps} />);
    expect(screen.getByText("Alex")).toBeInTheDocument();
    expect(screen.getByText("ORD-001")).toBeInTheDocument();
    expect(screen.getByText("Pickup: 2026-03-18 09:00")).toBeInTheDocument();
    expect(screen.getByText("Deliver: 2026-03-19 18:00")).toBeInTheDocument();
    expect(screen.getByText("Wash & Fold")).toBeInTheDocument();
  });
});
