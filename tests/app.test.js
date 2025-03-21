const request = require("supertest");
const { app } = require("../index.js");

describe("User Login API", () => {
  it("POST /loginUser should authenticate when passing correct credentials", async () => {
    const res = await request(app).post("/login").send({
      email: "user@example.com",
      password: "securePassword123",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("token");
  });

  it("POST /loginUser should reject when passing incorrect credentials", async () => {
    const res = await request(app).post("/login").send({
      email: "user@example.com",
      password: "wrongPassword",
    });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Invalid credentials");
  });

  it("POST /loginUser shoulder return error when email or password missing", async () => {
    const res = await request(app).post("/login").send({
      email: "user@example.com",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Eamil or password is required." });
  });

  it("should allow login after waiting for cooldown", async () => {
    const userData = {
      email: "user@example.com",
      password: "securePassword123",
    };

    //  5 login attempts for rate limit
    for (let i = 0; i < 5; i++) {
      await request(app).post("/login").send(userData);
    }

    // 6 attempt get blocked
    const blockRes = await request(app).post("/login").send(userData);
    expect(blockRes.status).toBe(429);
    expect(blockRes.body.error).toBe(
      "Too many login attempts. Try again later."
    );

    setTimeout(async () => {
      const res = await request(app).post("/login").send(userData);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    }, 60000);
  });

  it("should return 5 failed attempts in 1 min", async () => {
    const userData = {
      email: "user@example.com",
      password: "securePassword123",
    };

    //  5 login attempts for rate limit
    for (let i = 0; i < 5; i++) {
      await request(app).post("/login").send(userData);
    }

    for (let i = 5; i < 10; i++) {
      let wrongattempts = await request(app).post("/login").send(userData);
      expect(wrongattempts.body.error).toEqual({
        error: "Too many login attempts. Try again later.",
      });
    }

    // 6 attempt get blocked
    const blockRes = await request(app).post("/login").send(userData);
    expect(blockRes.status).toBe(429);
    expect(blockRes.body.error).toBe(
      "Too many login attempts. Try again later."
    );
  });
});
