import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getMenu } from "../api";
import { useCart } from "../cartStore";
import { Btn, Page, Input } from "../ui";
import { formatEUR } from "../money";

export function CartPage() {
  const nav = useNavigate();
  const { data: menu, isLoading } = useQuery({ queryKey: ["menu"], queryFn: getMenu });

  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const byId = new Map(menu?.map((m) => [m.id, m]) ?? []);

  const subtotal = lines.reduce((sum, l) => {
    const item = byId.get(l.menuItemId);
    if (!item) return sum;
    return sum + item.price * l.quantity;
  }, 0);

  const deliveryFee = subtotal >= 25 ? 0 : 3.5;
  const total = subtotal + deliveryFee;

  return (
    <Page title="Cart">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/">{"<- Menu"}</Link>
        <Btn disabled={lines.length === 0 || isLoading} onClick={() => nav("/checkout")}>
          Checkout
        </Btn>
      </div>

      {isLoading && <div style={{ marginTop: 12 }}>Loading menu...</div>}

      {!isLoading && lines.length === 0 && (
        <div style={{ marginTop: 12 }}>
          <div>Cart is empty.</div>
          <div style={{ marginTop: 10 }}>
            <Link to="/">Back to menu</Link>
          </div>
        </div>
      )}

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {lines.map((l) => {
          const item = byId.get(l.menuItemId);
          if (!item) return null;
          return (
            <div
              key={l.menuItemId}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 12,
                display: "grid",
                gridTemplateColumns: "1fr 120px 80px",
                gap: 10,
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontWeight: 800 }}>{item.name}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>{formatEUR(item.price)} each</div>
              </div>

              <Input
                aria-label={`qty-${item.id}`}
                type="number"
                min={1}
                max={50}
                value={l.quantity}
                onChange={(e) => setQty(l.menuItemId, Number(e.target.value))}
              />

              <Btn onClick={() => remove(l.menuItemId)}>Remove</Btn>
            </div>
          );
        })}
      </div>

      {lines.length > 0 && (
        <div style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 12 }}>
          <div>Subtotal: {formatEUR(subtotal)}</div>
          <div>Delivery: {formatEUR(deliveryFee)}</div>
          <div style={{ fontWeight: 900, marginTop: 6 }}>Total: {formatEUR(total)}</div>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Delivery fee is waived for subtotal {" >= "} {formatEUR(25)}.
          </div>
        </div>
      )}
    </Page>
  );
}