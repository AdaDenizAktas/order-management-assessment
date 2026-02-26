import { useEffect, useMemo, useState } from "react";
import { formatEUR } from "../money";

import { Link, useParams } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { getOrder, orderEventsUrl } from "../api";

import type { Order, OrderStatus } from "@app/shared";

import { Page } from "../ui";

type Live = {
  status: OrderStatus;
  history: Array<{ status: OrderStatus; at: string }>;
};

export function OrderPage() {
  const { id = "" } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ["order", id], queryFn: () => getOrder(id), enabled: !!id });

  const [live, setLive] = useState<Live | null>(null);

  useEffect(() => {
    if (!id) return;
    const es = new EventSource(orderEventsUrl(id));

    es.addEventListener("snapshot", (ev: MessageEvent) => {
      const payload = JSON.parse(String(ev.data));
      setLive({ status: payload.status, history: payload.history });
    });

    es.addEventListener("status", (ev: MessageEvent) => {
      const payload = JSON.parse(String(ev.data));
      setLive((cur) => {
        const history = (cur?.history ?? data?.statusHistory ?? []).slice();
        if (payload?.status && payload?.at) history.push({ status: payload.status, at: payload.at });
        return { status: payload.status, history };
      });
    });

    es.onerror = () => {
      // EventSource auto-reconnects; keep UI stable.
    };

    return () => es.close();
  }, [id]);

  const shown: Order | null = data ?? null;
  const status = live?.status ?? shown?.status ?? "RECEIVED";
  const history = live?.history ?? shown?.statusHistory ?? [];

  return (
    <Page title="Order Tracking">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/">ÃƒÂ¢Ã¢â‚¬Â Ã‚Â Menu</Link>
        <div style={{ fontWeight: 700 }}>Status: <span aria-live="polite">{status}</span></div>
      </div>

      {isLoading && <div style={{ marginTop: 12 }}>Loading...</div>}

      {shown && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Order ID: {shown.id}</div>
          <div style={{ marginTop: 10, border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 700 }}>Timeline</div>
            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              {history.map((h, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>{h.status}</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{new Date(h.at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12, border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 700 }}>Items</div>
            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              {shown.lines.map((l) => (
                <div key={l.menuItemId} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>{l.nameSnapshot} ÃƒÆ’Ã¢â‚¬â€ {l.quantity}</div>
                  <div>{formatEUR(l.unitPriceSnapshot * l.quantity)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, borderTop: "1px solid #eee", paddingTop: 10 }}>
              <div>Subtotal: {formatEUR(shown.totals.subtotal)}</div>
              <div>Delivery: {formatEUR(shown.totals.deliveryFee)}</div>
              <div style={{ fontWeight: 800, marginTop: 6 }}>Total: {formatEUR(shown.totals.total)}</div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
