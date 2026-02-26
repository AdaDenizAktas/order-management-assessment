import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { buildApp } from "../src/app";

let app: ReturnType<typeof buildApp>;

beforeAll(() => {
  process.env.DISABLE_SIM = "1";
  app = buildApp();
});

describe("API", () => {
  it("GET /api/menu returns menu", async () => {
    const res = await request(app).get("/api/menu").expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("POST /api/orders validates input", async () => {
    const res = await request(app).post("/api/orders").send({}).expect(400);
    expect(res.body.error).toBe("VALIDATION");
  });

  it("POST /api/orders creates order + idempotency", async () => {
    const payload = {
      customer: { name: "Ada", address: "Somewhere 1", phone: "555-111" },
      lines: [{ menuItemId: "pizza-margherita", quantity: 2 }]
    };

    const first = await request(app)
      .post("/api/orders")
      .set("Idempotency-Key", "k1")
      .send(payload)
      .expect(201);

    const second = await request(app)
      .post("/api/orders")
      .set("Idempotency-Key", "k1")
      .send(payload)
      .expect(200);

    expect(first.body.orderId).toBeTruthy();
    expect(second.body.orderId).toBe(first.body.orderId);
    expect(second.body.idempotent).toBe(true);
  });

  it("CRUD-ish: create -> read -> update delivery -> cancel", async () => {
    const create = await request(app).post("/api/orders").send({
      customer: { name: "User", address: "Addr 1", phone: "1234567" },
      lines: [{ menuItemId: "burger-classic", quantity: 1 }]
    }).expect(201);

    const id = create.body.orderId as string;

    const read = await request(app).get(`/api/orders/${id}`).expect(200);
    expect(read.body.id).toBe(id);

    const upd = await request(app).patch(`/api/orders/${id}`).send({
      customer: { name: "User2", address: "Addr2", phone: "7654321" }
    }).expect(200);
    expect(upd.body.customer.name).toBe("User2");

    const cancelled = await request(app).post(`/api/orders/${id}/cancel`).send({}).expect(200);
    expect(cancelled.body.status).toBe("CANCELLED");
  });
});
