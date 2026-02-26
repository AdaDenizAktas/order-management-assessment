import type { Response } from "express";

type Listener = {
  res: Response;
  pingTimer: NodeJS.Timeout;
};

export class SseHub {
  private byOrderId = new Map<string, Set<Listener>>();

  subscribe(orderId: string, res: Response) {
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    // CORS is handled globally; EventSource requires this connection stay open.
    res.flushHeaders?.();

    const pingTimer = setInterval(() => {
      // keep-alive comment line
      res.write(`: ping\\n\\n`);
    }, 15000);

    const listener: Listener = { res, pingTimer };
    if (!this.byOrderId.has(orderId)) this.byOrderId.set(orderId, new Set());
    this.byOrderId.get(orderId)!.add(listener);

    res.on("close", () => {
      clearInterval(pingTimer);
      const set = this.byOrderId.get(orderId);
      if (set) {
        set.delete(listener);
        if (set.size === 0) this.byOrderId.delete(orderId);
      }
      res.end();
    });
  }

  publish(orderId: string, event: string, data: unknown) {
    const listeners = this.byOrderId.get(orderId);
    if (!listeners || listeners.size === 0) return;
    const payload = JSON.stringify(data);
    for (const l of listeners) {
      l.res.write(`event: ${event}\\n`);
      l.res.write(`data: ${payload}\\n\\n`);
    }
  }
}
