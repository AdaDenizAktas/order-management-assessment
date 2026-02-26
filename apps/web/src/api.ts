import type { CreateOrderRequest, MenuItem, Order, UpdateDeliveryRequest } from "@app/shared";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:3001";

export async function getMenu(): Promise<MenuItem[]> {
  const r = await fetch(`${API_BASE}/api/menu`);
  if (!r.ok) throw new Error("menu_failed");
  return r.json();
}

export async function createOrder(body: CreateOrderRequest, idempotencyKey?: string): Promise<{ orderId: string }> {
  const r = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {})
    },
    body: JSON.stringify(body)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error ?? "create_failed");
  return data;
}

export async function getOrder(id: string) {
  const r = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error(`getOrder failed: ${r.status}`);
  return r.json();
}

export async function updateDelivery(id: string, body: UpdateDeliveryRequest): Promise<Order> {
  const r = await fetch(`${API_BASE}/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error ?? "update_failed");
  return data;
}

export function orderEventsUrl(id: string) {
  return `${API_BASE}/api/orders/${encodeURIComponent(id)}/events`;
}
