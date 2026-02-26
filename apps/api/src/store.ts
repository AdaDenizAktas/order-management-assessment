import type { MenuItem, Order } from "@app/shared";
import { MENU } from "./menu";

export type Store = {
  menuById: Map<string, MenuItem>;
  ordersById: Map<string, Order>;
  idempotencyToOrderId: Map<string, string>;
};

export function createStore(): Store {
  const menuById = new Map<string, MenuItem>();
  for (const m of MENU) menuById.set(m.id, m);
  return {
    menuById,
    ordersById: new Map(),
    idempotencyToOrderId: new Map()
  };
}
