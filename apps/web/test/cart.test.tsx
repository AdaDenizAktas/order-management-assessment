import { describe, it, expect } from "vitest";
import { act, render, screen, fireEvent } from "@testing-library/react";
import { useCart } from "../src/cartStore";

function Probe() {
  const lines = useCart((s) => s.lines);
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  return (
    <div>
      <div data-testid="count">{lines.reduce((s, l) => s + l.quantity, 0)}</div>
      <button onClick={() => add("pizza-margherita")}>add</button>
      <button onClick={() => setQty("pizza-margherita", 5)}>set5</button>
    </div>
  );
}

describe("cartStore", () => {
  it("adds and updates quantity", () => {
    useCart.getState().clear();
    render(<Probe />);

    expect(screen.getByTestId("count").textContent).toBe("0");
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("count").textContent).toBe("1");
    fireEvent.click(screen.getByText("set5"));
    expect(screen.getByTestId("count").textContent).toBe("5");
  });
});
