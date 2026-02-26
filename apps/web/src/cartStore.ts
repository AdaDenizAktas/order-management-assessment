import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartLine = { menuItemId: string; quantity: number };

type CartState = {
  lines: CartLine[];
  add: (menuItemId: string) => void;
  setQty: (menuItemId: string, qty: number) => void;
  remove: (menuItemId: string) => void;
  clear: () => void;
};

const clampInt = (n: number, min: number, max: number) =>
  Number.isFinite(n) ? Math.max(min, Math.min(max, Math.trunc(n))) : min;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (menuItemId) => {
        const cur = get().lines;
        const idx = cur.findIndex((l) => l.menuItemId === menuItemId);
        if (idx >= 0) {
          const next = cur.slice();
          next[idx] = { ...next[idx], quantity: clampInt(next[idx].quantity + 1, 1, 50) };
          set({ lines: next });
        } else {
          set({ lines: [...cur, { menuItemId, quantity: 1 }] });
        }
      },
      setQty: (menuItemId, qty) => {
        const q = clampInt(qty, 1, 50);
        const cur = get().lines;
        const idx = cur.findIndex((l) => l.menuItemId === menuItemId);
        if (idx < 0) return;
        const next = cur.slice();
        next[idx] = { ...next[idx], quantity: q };
        set({ lines: next });
      },
      remove: (menuItemId) => set({ lines: get().lines.filter((l) => l.menuItemId !== menuItemId) }),
      clear: () => set({ lines: [] })
    }),
    {
      name: "cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines })
    }
  )
);