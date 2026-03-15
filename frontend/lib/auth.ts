export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

const AUTH_TOKEN_KEY = "jobshield_auth_token";
const AUTH_USER_KEY = "jobshield_auth_user";

function getBackendBaseUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${getBackendBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof payload?.message === "string" ? payload.message : "Login failed";
    throw new Error(message);
  }

  if (typeof payload?.token !== "string" || typeof payload?.user?.email !== "string") {
    throw new Error("Invalid login response");
  }

  return payload as LoginResponse;
}

export async function registerRequest(payload: RegisterPayload): Promise<void> {
  const response = await fetch(`${getBackendBaseUrl()}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.message === "string" ? body.message : "Registration failed";
    throw new Error(message);
  }
}

export function googleSignIn(): void {
  const backendUrl = getBackendBaseUrl();
  window.location.href = `${backendUrl}/api/auth/google`;
}

// Fetch user from token in secure cookie (after OAuth redirect)
export async function getCurrentUser(token?: string | null): Promise<AuthUser | null> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${getBackendBaseUrl()}/api/auth/me`, {
      method: "GET",
      credentials: "include", // Send cookies
      headers,
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    if (typeof payload?.user?.email !== "string") {
      return null;
    }

    return payload.user as AuthUser;
  } catch {
    return null;
  }
}

export function saveAuthSession(token: string, user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;

  const rawValue = localStorage.getItem(AUTH_USER_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as Partial<AuthUser>;
    if (typeof parsed.id !== "string" || typeof parsed.email !== "string") {
      return null;
    }
    return parsed as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getStoredToken());
}
