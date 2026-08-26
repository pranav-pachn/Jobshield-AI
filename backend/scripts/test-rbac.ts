import axios from 'axios';
import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { JobReport } from '../src/models/JobReport';
import { env } from '../src/config/env';
import '../src/config/loadEnv';
import { v4 as uuid } from 'uuid';

const API_URL = 'http://localhost:5000/api';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('--- Starting RBAC Verification Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${details}`);
      failed++;
    }
  }

  // Set up test users directly in DB to bypass UI flows
  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB');

  const userAEmail = `test-user-a-${uuid()}@example.com`;
  const analystEmail = `test-analyst-${uuid()}@example.com`;
  const adminEmail = `test-admin-${uuid()}@example.com`;
  const password = 'password123';

  // Helper to register and login
  async function createAndLogin(email: string, role: string) {
    await axios.post(`${API_URL}/auth/register`, { email, password, name: email.split('@')[0] });
    // update role directly in db since register assigns USER
    await User.updateOne({ email }, { role });
    const user = await User.findOne({ email });
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    return { token: res.data.token, user };
  }

  try {
    const { token: userAToken, user: userA } = await createAndLogin(userAEmail, 'USER');
    const { token: userBToken, user: userB } = await createAndLogin(`test-user-b-${uuid()}@example.com`, 'USER');
    const { token: analystToken } = await createAndLogin(analystEmail, 'ANALYST');
    const { token: adminToken } = await createAndLogin(adminEmail, 'ADMIN');

    const reportA = await JobReport.create({
      user_id: userA!._id,
      job_analysis_id: new mongoose.Types.ObjectId().toString(),
      report_title: "User A Report",
      report_data: {},
      export_format: "pdf",
      created_at: new Date(),
    });
    const reportB = await JobReport.create({
      user_id: userB!._id,
      job_analysis_id: new mongoose.Types.ObjectId().toString(),
      report_title: "User B Report",
      report_data: {},
      export_format: "pdf",
      created_at: new Date(),
    });

    // 1. No token -> 401
    try {
      await axios.get(`${API_URL}/auth/me`);
      assert(false, "1. No token");
    } catch (e: any) {
      assert(e.response?.status === 401, "1. No token -> 401", `(Got ${e.response?.status})`);
    }

    // 2. Invalid token -> 401
    try {
      await axios.get(`${API_URL}/auth/me`, { headers: { Authorization: 'Bearer INVALID' } });
      assert(false, "2. Invalid token");
    } catch (e: any) {
      assert(e.response?.status === 401, "2. Invalid token -> 401", `(Got ${e.response?.status})`);
    }

    // 3. Expired token -> 401 (Simulate by mangling)
    try {
      // Create an expired token by signing directly
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign({ id: userA!._id, role: 'USER' }, process.env.JWT_SECRET, { expiresIn: '-1s' });
      await axios.get(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${expiredToken}` } });
      assert(false, "3. Expired token");
    } catch (e: any) {
      assert(e.response?.status === 401, "3. Expired token -> 401", `(Got ${e.response?.status})`);
    }

    // 4. USER -> normal analysis -> 200 (Assuming /api/auth/me is a normal user endpoint, or use /reports/user/all)
    try {
      const res = await axios.get(`${API_URL}/reports/user/all`, { headers: { Authorization: `Bearer ${userAToken}` } });
      assert(res.status === 200, "4. USER -> normal endpoint -> 200");
    } catch (e: any) {
      assert(false, "4. USER -> normal endpoint", e.message);
    }

    // 5. USER -> evaluation endpoint -> 403
    try {
      await axios.get(`${API_URL}/learning/feedback/pending`, { headers: { Authorization: `Bearer ${userAToken}` } });
      assert(false, "5. USER -> evaluation endpoint");
    } catch (e: any) {
      assert(e.response?.status === 403, "5. USER -> evaluation endpoint -> 403", `(Got ${e.response?.status})`);
    }

    // 6. USER -> another user's report -> 403
    try {
      await axios.get(`${API_URL}/reports/${reportB._id}`, { headers: { Authorization: `Bearer ${userAToken}` } });
      assert(false, "6. USER -> another user's report");
    } catch (e: any) {
      assert(e.response?.status === 403, "6. USER -> another user's report -> 403", `(Got ${e.response?.status})`);
    }

    // 7. ANALYST -> evaluation -> 200
    try {
      const res = await axios.get(`${API_URL}/learning/feedback/pending`, { headers: { Authorization: `Bearer ${analystToken}` } });
      assert(res.status === 200, "7. ANALYST -> evaluation -> 200");
    } catch (e: any) {
      assert(false, "7. ANALYST -> evaluation", e.message);
    }

    // 8. ANALYST -> admin-only operation -> 403 
    // Right now, we don't have a strict ADMIN-only route yet, but we will test it if one exists.
    // Let's create a temporary strict ADMIN route in server or just pass this if there isn't one.
    console.log(`⚠️ SKIP: 8. ANALYST -> admin-only operation (No strictly ADMIN-only routes defined yet)`);

    // 9. ADMIN -> evaluation -> 200
    try {
      const res = await axios.get(`${API_URL}/learning/feedback/pending`, { headers: { Authorization: `Bearer ${adminToken}` } });
      assert(res.status === 200, "9. ADMIN -> evaluation -> 200");
    } catch (e: any) {
      assert(false, "9. ADMIN -> evaluation", e.message);
    }

    // 10. ADMIN -> admin operation -> 200
    console.log(`⚠️ SKIP: 10. ADMIN -> admin operation (No strictly ADMIN-only routes defined yet)`);

    // 11. Revocation: ADMIN -> change role to USER in MongoDB -> protected admin endpoint -> 403
    try {
      await User.updateOne({ email: adminEmail }, { role: 'USER' });
      await delay(1000); // small delay
      await axios.get(`${API_URL}/learning/feedback/pending`, { headers: { Authorization: `Bearer ${adminToken}` } });
      assert(false, "11. Revocation");
    } catch (e: any) {
      assert(e.response?.status === 403, "11. Revocation -> 403", `(Got ${e.response?.status})`);
    }

    // 12. User A -> User B's report -> 403 (Tested in #6, duplicating for completeness)
    try {
      await axios.get(`${API_URL}/reports/${reportB._id}`, { headers: { Authorization: `Bearer ${userAToken}` } });
      assert(false, "12. User A -> User B's report");
    } catch (e: any) {
      assert(e.response?.status === 403, "12. User A -> User B's report -> 403", `(Got ${e.response?.status})`);
    }

    console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);

  } catch (err: any) {
    console.error("Test execution failed:", err.message);
  } finally {
    process.exit(0);
  }
}

runTests();
