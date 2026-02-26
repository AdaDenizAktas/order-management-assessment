// FIX: live state is "freezing" the UI.
// Because you always render `live?.history ?? shown?.statusHistory`,
// once `live` is set (initial seed), polling updates in `data` are ignored.
// Solution: (1) keep seedHistoryRef updated from `data`, (2) MERGE histories at render.

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getOrder, orderEventsUrl } from "../api";
import { formatEUR } from "../money";
import { Page } from "../ui";

import type { Order, OrderStatus } from "@app/shared";

type Hist = { status: OrderStatus; at: string };
type Live = { status: OrderStatus; history: Hist[] };

function appendUnique(prev: Hist[], next: Hist): Hist[] {
  if (!next?.status || !next?.at) return prev;
  if (prev.some((h) => h.status === next.status && h.at === next.at)) return prev;
  return [...prev, next];
}

function mergeHistory(a: Hist[], b: Hist[]): Hist[] {
  const m = new Map<string, Hist>();
  for (const h of a) m.set(`${h.status}|${h.at}`, h);
  for (const h of b) m.set(`${h.status}|${h.at}`, h);
  return Array.from(m.values()).sort((x, y) => String(x.at).localeCompare(String(y.at)));
}

export function OrderPage() {
  const { id = "" } = useParams();
  const [live, setLive] = useState<Live | null>(null);

  const seedHistoryRef = useRef<Hist[]>([]);

  const orderQuery = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
    enabled: !!id,
    refetchInterval: (q) => {
      const status = live?.status ?? q.state.data?.status ?? "RECEIVED";
      return status === "DELIVERED" ? false : 2000;
    }
  });

  const { data, isLoading } = orderQuery;

  // IMPORTANT: keep seedHistoryRef in sync with polled data (not only once)
  useEffect(() => {
    if (!data) return;
    seedHistoryRef.current = (data.statusHistory ?? []) as Hist[];
  }, [data?.id, data?.statusHistory?.length]);

  useEffect(() => {
    if (!id) return;

    const es = new EventSource(orderEventsUrl(id));

    es.addEventListener("snapshot", (ev: MessageEvent) => {
      const payload = JSON.parse(String(ev.data));
      if (payload?.status && Array.isArray(payload?.history)) {
        setLive({ status: payload.status, history: payload.history });
      }
    });

    es.addEventListener("status", (ev: MessageEvent) => {
      const payload = JSON.parse(String(ev.data));
      const status = payload?.status as OrderStatus | undefined;
      if (!status) return;

      const at: string =
        typeof payload?.at === "string" && payload.at.length > 0 ? payload.at : new Date().toISOString();

      setLive((cur) => {
        const baseHistory = cur?.history ?? seedHistoryRef.current;
        const nextHistory = appendUnique(baseHistory, { status, at });
        return { status, history: nextHistory };
      });
    });

    return () => es.close();
  }, [id]);

  const shown: Order | null = data ?? null;

  // IMPORTANT: render MERGED history so polling updates are visible even if `live` exists
  const history = useMemo(() => {
    const fromApi = (shown?.statusHistory ?? []) as Hist[];
    const fromLive = (live?.history ?? []) as Hist[];
    return mergeHistory(fromApi, fromLive);
  }, [shown?.statusHistory, live?.history]);

  const last = history.at(-1);
const status: OrderStatus = last?.status ?? live?.status ?? shown?.status ?? "RECEIVED";

  return (
    <Page title="Order Tracking">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/">{"Back to Menu"}</Link>
        <div style={{ fontWeight: 700 }}>
          Status: <span aria-live="polite">{status}</span>
        </div>
      </div>

      {isLoading && <div style={{ marginTop: 12 }}>Loading...</div>}

      {shown && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Order ID: {shown.id}</div>

          <div style={{ marginTop: 10, border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 700 }}>Timeline</div>
            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              {history.map((h, idx) => (
                <div
                  key={`${h.status}-${h.at}-${idx}`}
                  style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
                >
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
                  <div>
                    {l.nameSnapshot} x {l.quantity}
                  </div>
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