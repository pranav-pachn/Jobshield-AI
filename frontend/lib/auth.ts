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

export function googleSignIn(): void {
  const backendUrl = getBackendBaseUrl();
  window.location.href = `${backendUrl}/api/auth/google`;
}

export function handleGoogleCallback(token: string, user: string): LoginResponse {
  const parsedUser = JSON.parse(decodeURIComponent(user)) as AuthUser;
  
  if (typeof token !== "string" || typeof parsedUser?.email !== "string") {
    throw new Error("Invalid Google callback response");
  }

  return { token, user: parsedUser };
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
