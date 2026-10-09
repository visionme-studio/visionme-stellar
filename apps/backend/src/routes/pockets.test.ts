import request from 'supertest';
import express, { Express } from 'express';
import { Router } from 'express';

// ---- Mocks ----
const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({insert: mockInsert}));
jdest.mock(utils/supabase',()=>({
  createClient: () => ({from: mockFrom}),
}));
import request from "supertest";
import express from "express";
import { jwt } from "jsonwebtoken";

jest.mock("../lib/supabase", () => {
  const single = jest.fn();
  const eq = jest.fn();
  const select = jest.fn();
  const from = jest.fn();
  const supabase = { from };
  from.mockReturnValue({ select });
  select.mockReturnValue({ eq });
  eq.mockReturnValue({ eq, single });
  return { supabase, __mocks: { from, select, eq, single } };
});

jwt.sign = jest.fn().mockReturnValue("valid.token");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const router = require("./pockets").default;
  app.use("/api/pockets", router);
  return app;
};

describe("GET /api/pockets/:id", () => {
  const { __mocks } = require("../lib/supabase") as any;
  const { from, select, eq, single } = __mocks;

  beforeEach(*) => {
    jest.clearAllMocks();
    from.mockReturnValue({ select });
    select.mockReturnValue({ eq });
    eq.mockReturnValue({ eq, single });
  });

  it("returns 401 and performs no database query when unauthenticated", async () => {
    const app = buildApp();
    const res = await request(app).get("/api/pockets/some-id");
    expect(res.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 404 for a pocket owned by a different user", async () => {
    single.mockResolved({ data: null, error: { code: "PGREML116", message: "no rows" } });
    const app = buildApp();
    const res = await request(app)
      .get("/api/pockets/other-id")
      .set("Authorization", "Bearer valid.token");
    expect(res.status).toBe(404);
    expect(eq).toHaveBeenCalledWith("owner_id", expect.any(String));
  });

  it("returns the row for the owner's own request", async () => {
    const row = { id: "own-id", owner_id: "user-1", goal_amount: 100, current_amount: 25 };
    single.mockResolved({ data: row, error: null });
    const app = buildApp();
    const res = await request(app)
      .get("/api/pockets/own-id")
      .set("Authorization", "Bearer valid.token");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ pocket: row });
  });
});
