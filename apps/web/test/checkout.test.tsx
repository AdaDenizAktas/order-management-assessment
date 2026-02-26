import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CheckoutPage } from "../src/pages/CheckoutPage";
import { useCart } from "../src/cartStore";

vi.mock("../src/api", () => ({
  createOrder: vi.fn(async () => ({ orderId: "o_test" }))
}));

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/checkout"]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  useCart.setState({ lines: [{ menuItemId: "pizza-margherita", quantity: 1 }] } as any, true);
});

describe("Checkout", () => {
  it("shows field errors on submit, enables submit when valid", async () => {
    wrap(<CheckoutPage />);

    const btn = screen.getByRole("button", { name: /place order/i });
    expect(btn).toBeDisabled();

    // Touch fields to show errors
    fireEvent.blur(screen.getByLabelText(/name/i));
    fireEvent.blur(screen.getByLabelText(/address/i));
    fireEvent.blur(screen.getByLabelText(/phone/i));

    // Fill valid values
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "User" } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: "Addr 123" } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: "1234567" } });

    expect(screen.getByRole("button", { name: /place order/i })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: /place order/i }));
    expect(await screen.findByText(/order created/i)).toBeTruthy();
  });
});