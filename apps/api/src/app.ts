import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import {
  CreateOrderRequestSchema,
  UpdateDeliveryRequestSchema,
  type Order,
  type OrderLineSnapshot
} from "@app/shared";
import { createStore } from "./store.js";
import { computeTotals, transition } from "./orderMachine.js";
import { SseHub } from "./sseHub.js";
import { StatusSimulator } from "./simulator.js";

export function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "256kb" }));

  const store = createStore();
  const hub = new SseHub();
  const simulator = new StatusSimulator(store, hub);

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.get("/api/menu", (_req, res) => {
    res.json(Array.from(store.menuById.values()));
  });

  app.post("/api/orders", (req, res) => {
    const parsed = CreateOrderRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "VALIDATION", details: parsed.error.flatten() });

    const idempotencyKey = String(req.header("Idempotency-Key") ?? "").trim();
    if (idempotencyKey) {
      const existingId = store.idempotencyToOrderId.get(idempotencyKey);
      if (existingId) return res.status(200).json({ orderId: existingId, idempotent: true });
    }

    const { customer, lines } = parsed.data;

    const snapshots: OrderLineSnapshot[] = [];
    for (const l of lines) {
      const item = store.menuById.get(l.menuItemId);
      if (!item || item.isAvailable === false) {
        return res.status(400).json({ error: "INVALID_MENU_ITEM", menuItemId: l.menuItemId });
      }
      snapshots.push({
        menuItemId: item.id,
        nameSnapshot: item.name,
        unitPriceSnapshot: item.price,
        quantity: l.quantity
      });
    }

    const totals = computeTotals(snapshots);
    const now = new Date().toISOString();
    const orderId = nanoid(12);

    const order: Order = {
      id: orderId,
      customer,
      lines: snapshots,
      totals,
      status: "RECEIVED",
      statusHistory: [{ status: "RECEIVED", at: now }],
      createdAt: now
    };

    store.ordersById.set(orderId, order);
    if (idempotencyKey) store.idempotencyToOrderId.set(idempotencyKey, orderId);

    hub.publish(orderId, "status", { orderId, status: "RECEIVED", at: now });
    simulator.start(orderId);

    return res.status(201).json({ orderId });
  });

  app.get("/api/orders/:id", (req, res) => {
    const o = store.ordersById.get(req.params.id);
    if (!o) return res.status(404).json({ error: "NOT_FOUND" });
    res.json(o);
  });

  app.patch("/api/orders/:id", (req, res) => {
    const o = store.ordersById.get(req.params.id);
    if (!o) return res.status(404).json({ error: "NOT_FOUND" });

    if (o.status !== "RECEIVED") return res.status(409).json({ error: "IMMUTABLE_AFTER_RECEIVED", status: o.status });

    const parsed = UpdateDeliveryRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "VALIDATION", details: parsed.error.flatten() });

    o.customer = parsed.data.customer;
    res.json(o);
  });

  app.post("/api/orders/:id/cancel", (req, res) => {
    const o = store.ordersById.get(req.params.id);
    if (!o) return res.status(404).json({ error: "NOT_FOUND" });

    if (o.status === "DELIVERED" || o.status === "CANCELLED") return res.status(409).json({ error: "CANNOT_CANCEL", status: o.status });

    const next = transition(o.status, "CANCELLED");
    o.status = next;
    const at = new Date().toISOString();
    o.statusHistory.push({ status: next, at });

    hub.publish(o.id, "status", { orderId: o.id, status: o.status, at });
    res.json(o);
  });

  // Optional admin/testing endpoint: manually advance a status
  app.post("/api/orders/:id/status", (req, res) => {
    const o = store.ordersById.get(req.params.id);
    if (!o) return res.status(404).json({ error: "NOT_FOUND" });

    const to = String(req.body?.to ?? "");
    if (!to) return res.status(400).json({ error: "MISSING_TO" });

    try {
      const next = transition(o.status, to as any);
      o.status = next;
      const at = new Date().toISOString();
      o.statusHistory.push({ status: next as any, at });
      hub.publish(o.id, "status", { orderId: o.id, status: o.status, at });
      return res.json(o);
    } catch (e: any) {
      return res.status(400).json({ error: "INVALID_TRANSITION", message: e?.message ?? String(e) });
    }
  });

  // SSE stream
  app.get("/api/orders/:id/events", (req, res) => {
    const id = req.params.id;
    const o = store.ordersById.get(id);
    if (!o) return res.status(404).end();

    hub.subscribe(id, res);

    // send snapshot immediately
    res.write(`event: snapshot\\n`);
    res.write(`data: ${JSON.stringify({ orderId: id, status: o.status, history: o.statusHistory })}\\n\\n`);
  });

  return app;
}
