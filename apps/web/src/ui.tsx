import React from "react";

export function Page({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
      </div>
      <div style={{ marginTop: 16 }}>{children}</div>
    </div>
  );
}

export function Btn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: "8px 12px",
        border: "1px solid #ccc",
        background: "white",
        borderRadius: 8,
        cursor: "pointer",
        ...((props.style as any) ?? {})
      }}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        padding: "8px 10px",
        border: "1px solid #ccc",
        borderRadius: 8,
        width: "100%",
        ...((props.style as any) ?? {})
      }}
    />
  );
}
