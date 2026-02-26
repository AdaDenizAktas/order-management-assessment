import { canTransition, type OrderStatus } from "@app/shared";

export function computeTotals(lines: Array<{ unitPriceSnapshot: number; quantity: number }>) {
  const subtotal = round2(lines.reduce((sum, l) => sum + l.unitPriceSnapshot * l.quantity, 0));
  const deliveryFee = subtotal >= 25 ? 0 : 3.5;
  const total = round2(subtotal + deliveryFee);
  return { subtotal, deliveryFee, total };
}

export function transition(current: OrderStatus, next: OrderStatus): OrderStatus {
  if (!canTransition(current, next)) throw new Error(`Invalid transition: ${current} -> ${next}`);
  return next;
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
