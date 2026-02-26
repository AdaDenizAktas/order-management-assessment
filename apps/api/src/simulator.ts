import type { Store } from "./store";
import { transition } from "./orderMachine";
import type { OrderStatus } from "@app/shared";
import { SseHub } from "./sseHub";

export class StatusSimulator {
  private timersByOrderId = new Map<string, NodeJS.Timeout[]>();

  constructor(private store: Store, private hub: SseHub) {}

  start(orderId: string) {
    if (process.env.DISABLE_SIM === "1") return;

    const steps: Array<{ afterMs: number; to: OrderStatus }> = [
      { afterMs: 4000, to: "PREPARING" },
      { afterMs: 8000, to: "OUT_FOR_DELIVERY" },
      { afterMs: 12000, to: "DELIVERED" }
    ];

    const timers: NodeJS.Timeout[] = [];
    for (const step of steps) {
      const t = setTimeout(() => {
        const o = this.store.ordersById.get(orderId);
        if (!o) return;
        if (o.status === "CANCELLED" || o.status === "DELIVERED") return;
        const next = transition(o.status, step.to);
        o.status = next;
        o.statusHistory.push({ status: next, at: new Date().toISOString() });
        this.hub.publish(orderId, "status", { orderId, status: o.status, at: o.statusHistory.at(-1)?.at });
      }, step.afterMs);
      timers.push(t);
    }
    this.timersByOrderId.set(orderId, timers);
  }

  stop(orderId: string) {
    const timers = this.timersByOrderId.get(orderId);
    if (!timers) return;
    for (const t of timers) clearTimeout(t);
    this.timersByOrderId.delete(orderId);
  }
}
