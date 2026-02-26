import { describe, it, expect } from "vitest";
import { computeTotals, transition } from "../src/orderMachine";

describe("orderMachine", () => {
  it("computes totals with delivery fee rule", () => {
    const t1 = computeTotals([{ unitPriceSnapshot: 10, quantity: 1 }]);
    expect(t1.subtotal).toBe(10);
    expect(t1.deliveryFee).toBe(3.5);
    expect(t1.total).toBe(13.5);

    const t2 = computeTotals([{ unitPriceSnapshot: 10, quantity: 3 }]); // 30
    expect(t2.deliveryFee).toBe(0);
    expect(t2.total).toBe(30);
  });

  it("enforces transitions", () => {
    expect(transition("RECEIVED", "PREPARING")).toBe("PREPARING");
    expect(() => transition("RECEIVED", "DELIVERED" as any)).toThrow();
  });
});
