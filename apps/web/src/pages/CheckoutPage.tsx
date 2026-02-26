import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../api";
import { useCart } from "../cartStore";
import { Btn, Input, Page } from "../ui";
import { CreateOrderRequestSchema } from "@app/shared";

type FieldErrors = Partial<Record<"name" | "address" | "phone", string>>;

function extractFieldErrors(err: any): FieldErrors {
  const out: FieldErrors = {};
  const issues = err?.issues ?? [];
  for (const it of issues) {
    const path = (it.path ?? []).join(".");
    const msg = String(it.message ?? "Invalid");
    if (path === "customer.name" && !out.name) out.name = msg;
    if (path === "customer.address" && !out.address) out.address = msg;
    if (path === "customer.phone" && !out.phone) out.phone = msg;
  }
  return out;
}

export function CheckoutPage() {
  const nav = useNavigate();

  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [touched, setTouched] = useState({ name: false, address: false, phone: false });
  const [busy, setBusy] = useState(false);
  const [topErr, setTopErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const payload = useMemo(
    () => ({
      customer: { name, address, phone },
      lines: lines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity }))
    }),
    [name, address, phone, lines]
  );

  const parsed = CreateOrderRequestSchema.safeParse(payload);
  const fieldErrors: FieldErrors = parsed.success ? {} : extractFieldErrors(parsed.error);
  const isValid = parsed.success;

  async function submit() {
    setTopErr(null);
    setSuccess(null);

    if (!isValid) {
      setTouched({ name: true, address: true, phone: true });
      setTopErr("Fix the highlighted fields.");
      return;
    }

    setBusy(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await createOrder(parsed.data, idempotencyKey);
      setSuccess("Order created. Redirecting...");
      clear();
      nav(`/orders/${res.orderId}`);
    } catch (e: any) {
      setTopErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page title="Checkout">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/cart">{"<- Cart"}</Link>
        <div />
      </div>

      {lines.length === 0 && <div style={{ marginTop: 12 }}>Cart is empty.</div>}

      <div style={{ marginTop: 12, display: "grid", gap: 10, maxWidth: 520 }}>
        <label>
          Name
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            aria-invalid={touched.name && !!fieldErrors.name}
          />
          {touched.name && fieldErrors.name && <div style={{ color: "crimson" }}>{fieldErrors.name}</div>}
        </label>

        <label>
          Address
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, address: true }))}
            aria-invalid={touched.address && !!fieldErrors.address}
          />
          {touched.address && fieldErrors.address && <div style={{ color: "crimson" }}>{fieldErrors.address}</div>}
        </label>

        <label>
          Phone
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            aria-invalid={touched.phone && !!fieldErrors.phone}
          />
          {touched.phone && fieldErrors.phone && <div style={{ color: "crimson" }}>{fieldErrors.phone}</div>}
        </label>

        {topErr && <div style={{ color: "crimson" }}>{topErr}</div>}
        {success && <div style={{ color: "green" }}>{success}</div>}

        <Btn disabled={lines.length === 0 || busy || !isValid} onClick={submit}>
          {busy ? "Placing..." : "Place Order"}
        </Btn>
      </div>
    </Page>
  );
}