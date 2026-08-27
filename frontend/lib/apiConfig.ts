export const getBackendUrl = (): string => {
  let url = "http://localhost:4000";
  
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    url = process.env.NEXT_PUBLIC_BACKEND_URL;
  } else if (process.env.NEXT_PUBLIC_API_URL) {
    url = process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      url = "http://localhost:4000";
    }
  }

  return url.trim().replace(/\/+$/, "").replace(/\/api$/, "");
};
