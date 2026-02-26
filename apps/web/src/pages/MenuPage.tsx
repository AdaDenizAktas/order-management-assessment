import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getMenu } from "../api";
import { useCart } from "../cartStore";
import { Btn, Page } from "../ui";
import { formatEUR } from "../money";

export function MenuPage() {
  const { data, isLoading, isError, error } = useQuery({ queryKey: ["menu"], queryFn: getMenu });

  const add = useCart((s) => s.add);
  const count = useCart((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));

  const items = useMemo(() => data ?? [], [data]);

  return (
    <Page title="Menu">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <Link to="/cart">Cart ({count})</Link>
      </div>

      {isLoading && (
        <div style={{ display: "grid", gap: 10 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <div style={{ height: 14, width: 160, background: "#eee", borderRadius: 6 }} />
              <div style={{ height: 12, width: 260, background: "#f0f0f0", borderRadius: 6, marginTop: 8 }} />
              <div style={{ height: 12, width: 90, background: "#f0f0f0", borderRadius: 6, marginTop: 10 }} />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div style={{ color: "crimson" }}>
          Failed to load menu: {String((error as any)?.message ?? error)}
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && <div>No items available.</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((m) => (
          <div
            key={m.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 12,
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              gap: 12
            }}
          >
            <img
              src={m.imageUrl}
              alt={m.name}
              style={{ width: 140, height: 100, objectFit: "cover", borderRadius: 10 }}
              loading="lazy"
            />
            <div>
              <div style={{ fontWeight: 800 }}>{m.name}</div>
              <div style={{ opacity: 0.8, marginTop: 4 }}>{m.description}</div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>{formatEUR(m.price)}</div>
                <Btn disabled={!m.isAvailable} onClick={() => add(m.id)}>
                  Add
                </Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}