import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:4000/api";

type ApiErrorPayload = {
  message?: string;
};

function getAxiosStatus(error: unknown): number | undefined {
  return (error as AxiosError)?.response?.status;
}

function getAxiosPayload(error: unknown): ApiErrorPayload | undefined {
  return (error as AxiosError<ApiErrorPayload>)?.response?.data;
}

async function testAuthBug(): Promise<void> {
  console.log("Testing authentication vulnerability...\n");

  console.log("Test 1: Login with empty password");
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: "test@example.com",
      password: "",
    });
    console.log("VULNERABILITY: Login succeeded without password!");
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    const status = getAxiosStatus(error);
    const payload = getAxiosPayload(error);
    if (status === 400) {
      console.log("Correctly rejected: Password required");
      console.log("Error:", payload?.message);
    } else {
      console.log("Unexpected error:", status, payload);
    }
  }

  console.log("\n\nTest 2: Login with whitespace password");
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: "test@example.com",
      password: "   ",
    });
    console.log("VULNERABILITY: Login succeeded without password!");
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    const status = getAxiosStatus(error);
    const payload = getAxiosPayload(error);
    if (status === 400) {
      console.log("Correctly rejected: Password required or invalid credentials");
      console.log("Error:", payload?.message);
    } else {
      console.log("Unexpected error:", status, payload);
    }
  }

  console.log("\n\nTest 3: Login with null/missing password");
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: "test@example.com",
    });
    console.log("VULNERABILITY: Login succeeded without password!");
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    const status = getAxiosStatus(error);
    const payload = getAxiosPayload(error);
    if (status === 400) {
      console.log("Correctly rejected: Password required");
      console.log("Error:", payload?.message);
    } else {
      console.log("Unexpected error:", status, payload);
    }
  }

  console.log("\n\nTest 4: Scenario - Google Sign-In user attempting password login");
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: "google-user@example.com",
      password: "",
    });
    console.log("VULNERABILITY: Login succeeded without password!");
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    const status = getAxiosStatus(error);
    const payload = getAxiosPayload(error);
    if (status === 400) {
      console.log("Correctly rejected");
      console.log("Error:", payload?.message);
    } else {
      console.log("Unexpected error:", status, payload);
    }
  }

  console.log("\nAuth vulnerability tests completed");
}

void testAuthBug().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown test error";
  console.error("Test suite error:", message);
  process.exit(1);
});
