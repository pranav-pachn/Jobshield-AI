import request from "supertest";
import mongoose from "mongoose";
import app from "../src/server";
import { UserFeedback } from "../src/models/UserFeedback";
import { JobAnalysis } from "../src/models/JobAnalysis";
import { User } from "../src/models/User";
import jwt from "jsonwebtoken";
import { env } from "../src/config/env";

describe("Feedback API endpoints", () => {
  let userAToken: string;
  let userBToken: string;
  let adminToken: string;
  let userAId: mongoose.Types.ObjectId;
  let userBId: mongoose.Types.ObjectId;
  let adminId: mongoose.Types.ObjectId;
  let analysisIdForUserA: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await mongoose.connect(env.mongoUri);
    
    // Create users
    userAId = new mongoose.Types.ObjectId();
    userBId = new mongoose.Types.ObjectId();
    adminId = new mongoose.Types.ObjectId();

    userAToken = jwt.sign({ id: userAId.toString(), role: "USER" }, env.jwtSecret);
    userBToken = jwt.sign({ id: userBId.toString(), role: "USER" }, env.jwtSecret);
    adminToken = jwt.sign({ id: adminId.toString(), role: "ADMIN" }, env.jwtSecret);

    // Create an analysis owned by User A
    analysisIdForUserA = new mongoose.Types.ObjectId();
    await JobAnalysis.create({
      _id: analysisIdForUserA,
      user_id: userAId,
      job_text: "test job for A",
      text_hash: "hash_a",
      scam_probability: 0.9,
      risk_level: "High",
    });
  });

  afterAll(async () => {
    await JobAnalysis.deleteMany({});
    await UserFeedback.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await UserFeedback.deleteMany({});
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(app)
      .post("/api/investigations/feedback")
      .send({ analysisId: analysisIdForUserA.toString(), wasCorrect: true });
    
    expect(res.status).toBe(401);
  });

  it("should return 401 if invalid token provided", async () => {
    const res = await request(app)
      .post("/api/investigations/feedback")
      .set("Authorization", "Bearer invalidtoken")
      .send({ analysisId: analysisIdForUserA.toString(), wasCorrect: true });
    
    expect(res.status).toBe(401);
  });

  it("should return 400 if analysisId is missing", async () => {
    const res = await request(app)
      .post("/api/investigations/feedback")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ wasCorrect: true });
    
    expect(res.status).toBe(400);
  });

  it("should allow User A to submit feedback on their own investigation (201)", async () => {
    const res = await request(app)
      .post("/api/investigations/feedback")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ analysisId: analysisIdForUserA.toString(), wasCorrect: true });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const feedback = await UserFeedback.findOne({ analysisId: analysisIdForUserA.toString(), userId: userAId.toString() });
    expect(feedback).not.toBeNull();
  });

  it("should return 409 Conflict if User A submits feedback twice", async () => {
    await request(app)
      .post("/api/investigations/feedback")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ analysisId: analysisIdForUserA.toString(), wasCorrect: true });

    const res = await request(app)
      .post("/api/investigations/feedback")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ analysisId: analysisIdForUserA.toString(), wasCorrect: false });
    
    expect(res.status).toBe(409);
  });

  it("should return 403 if User B tries to submit feedback on User A's investigation", async () => {
    const res = await request(app)
      .post("/api/investigations/feedback")
      .set("Authorization", `Bearer ${userBToken}`)
      .send({ analysisId: analysisIdForUserA.toString(), wasCorrect: true });
    
    expect(res.status).toBe(403);
  });

  it("should allow Admin to submit feedback on User A's investigation (201)", async () => {
    const res = await request(app)
      .post("/api/investigations/feedback")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ analysisId: analysisIdForUserA.toString(), wasCorrect: true });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
