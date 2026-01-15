Here’s the production-style test setup in Markdown-ready form.

**Test app helper (`tests/helpers/testApp.js`)**
```js
import express from "express";
import session from "express-session";
import mountKeyAccountFeature from "../../keyAccountFeature.js";

export const makeApp = ({ requireSession }) => {
  const app = express();
  app.use(express.json());

  // Minimal in-memory session for testing
  app.use(session({ secret: "test", resave: false, saveUninitialized: true }));

  // Fake login route to set session.user for auth-required paths
  app.post("/login-test", (req, res) => {
    req.session.user = { email: req.body.email || "test@test.com" };
    res.status(200).json({ ok: true });
  });

  mountKeyAccountFeature(app, { basePath: "/ka", requireSession });

  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ msg: err.message });
  });

  return app;
};
```

**Integration tests (`tests/keyAccountFeature.int.test.js`)**
```js
import request from "supertest";
import { makeApp } from "./helpers/testApp.js";

describe("KeyAccount feature mounts", () => {
  it("rejects when session required and not logged in", async () => {
    const app = makeApp({ requireSession: true });
    const res = await request(app).get("/ka");
    expect(res.status).toBe(401);
  });

  it("allows when session required and logged in", async () => {
    const app = makeApp({ requireSession: true });
    const agent = request.agent(app);
    await agent.post("/login-test").send({ email: "user@example.com" });
    const res = await agent.get("/ka");
    expect(res.status).toBe(200);
    // add assertions for payload shape/pagination as needed
  });

  it("allows public mount when session not required", async () => {
    const app = makeApp({ requireSession: false });
    const res = await request(app).get("/ka");
    expect(res.status).toBe(200);
  });
});
```

**Commands**
```bash
npm install --save-dev supertest jest
npm test
```

**Flow (text diagram)**
```
supertest -> express test app
  -> session middleware sets req.session
  -> mountKeyAccountFeature @ /ka
       -> (optional) verifySession -> keyAccountRouter
  -> response asserted in test
```
