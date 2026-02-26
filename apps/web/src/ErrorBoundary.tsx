import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : String(err) };
  }

  componentDidCatch(err: unknown) {
    // keep console signal for debugging; no PII
    console.error("UI error:", err);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
        <h2>Something went wrong.</h2>
        <div style={{ opacity: 0.8, marginBottom: 12 }}>{this.state.message}</div>
        <button onClick={() => location.reload()}>Reload</button>
      </div>
    );
  }
}