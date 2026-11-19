import dns from "dns";
import net from "net";
import { logger } from "./logger";

/**
 * Checks whether an IPv4 address is in a private, loopback, or reserved range.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map((part) => parseInt(part, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Treat malformed IPs as unsafe
  }

  const [a, b, c] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 10.0.0.0/8 (RFC 1918 private)
  if (a === 10) return true;

  // 100.64.0.0/10 (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 169.254.0.0/16 (Link-local / AWS & GCP cloud metadata 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (RFC 1918 private: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.0.0.0/24 (IETF protocol assignments)
  if (a === 192 && b === 0 && c === 0) return true;

  // 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0 && c === 2) return true;

  // 192.88.99.0/24 (6to4 Relay Anycast)
  if (a === 192 && b === 88 && c === 99) return true;

  // 192.168.0.0/16 (RFC 1918 private)
  if (a === 192 && b === 168) return true;

  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51 && c === 100) return true;

  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0 && c === 113) return true;

  // 224.0.0.0/4 (Multicast: 224 - 239)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved / Future use: 240 - 255)
  if (a >= 240) return true;

  return false;
}

/**
 * Checks whether an IPv6 address is in a private, loopback, or reserved range.
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // Loopback ::1
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;

  // Unspecified ::
  if (normalized === "::" || normalized === "0:0:0:0:0:0:0:0") return true;

  // IPv4-mapped IPv6 (::ffff:192.168.1.1 or ::ffff:c0a8:0101)
  if (normalized.startsWith("::ffff:")) {
    const v4Part = normalized.replace("::ffff:", "");
    if (net.isIPv4(v4Part)) {
      return isPrivateIPv4(v4Part);
    }
  }

  // Unique local addresses fc00::/7 (fc00... to fdff...)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

  // Link-local addresses fe80::/10 (fe80... to febf...)
  if (
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  ) {
    return true;
  }

  // Multicast ff00::/8
  if (normalized.startsWith("ff")) return true;

  // Documentation 2001:db8::/32
  if (normalized.startsWith("2001:db8") || normalized.startsWith("2001:0db8")) return true;

  return false;
}

/**
 * Result of SSRF safety validation.
 */
export interface SSRFValidationResult {
  isSafe: boolean;
  reason?: string;
  resolvedIp?: string;
  sanitizedUrl?: string;
}

/**
 * Validates a target URL against SSRF vulnerabilities:
 * - Checks protocols (strictly http/https)
 * - Checks domain blacklist (localhost, internal, cloud metadata)
 * - Resolves DNS and checks each resolved IP against private/reserved ranges
 */
export async function validateUrlForSSRF(rawUrl: string): Promise<SSRFValidationResult> {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { isSafe: false, reason: "URL cannot be empty" };
  }

  let parsed: URL;
  try {
    if (trimmed.includes("://")) {
      parsed = new URL(trimmed);
    } else {
      parsed = new URL(`https://${trimmed}`);
    }
  } catch {
    return { isSafe: false, reason: "Malformed URL" };
  }

  // 1. Restrict protocols strictly to HTTP and HTTPS
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { isSafe: false, reason: `Disallowed protocol: ${parsed.protocol}. Only HTTP and HTTPS are permitted.` };
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  // 2. Reject internal and loopback hostnames
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".arpa") ||
    hostname === "metadata.google.internal" ||
    hostname === "169.254.169.254"
  ) {
    return { isSafe: false, reason: "Access to internal, loopback, or metadata endpoints is prohibited." };
  }

  // 3. If hostname is directly an IP address, validate immediately
  if (net.isIPv4(hostname)) {
    if (isPrivateIPv4(hostname)) {
      return { isSafe: false, reason: `Private or reserved IP address blocked: ${hostname}` };
    }
    return { isSafe: true, resolvedIp: hostname, sanitizedUrl: parsed.toString() };
  }

  if (net.isIPv6(hostname)) {
    if (isPrivateIPv6(hostname)) {
      return { isSafe: false, reason: `Private or reserved IPv6 address blocked: ${hostname}` };
    }
    return { isSafe: true, resolvedIp: hostname, sanitizedUrl: parsed.toString() };
  }

  // 4. DNS resolution validation
  try {
    const lookupResults = await dns.promises.lookup(hostname, { all: true });

    if (!lookupResults || lookupResults.length === 0) {
      return { isSafe: false, reason: `Domain could not be resolved: ${hostname}` };
    }

    for (const record of lookupResults) {
      const { address, family } = record;
      if (family === 4 && isPrivateIPv4(address)) {
        logger.warn("[SSRF_VALIDATOR] Blocked DNS resolution to private IPv4", { hostname, address });
        return { isSafe: false, reason: `Domain resolves to a prohibited internal IP address: ${address}` };
      }
      if (family === 6 && isPrivateIPv6(address)) {
        logger.warn("[SSRF_VALIDATOR] Blocked DNS resolution to private IPv6", { hostname, address });
        return { isSafe: false, reason: `Domain resolves to a prohibited internal IPv6 address: ${address}` };
      }
    }

    return {
      isSafe: true,
      resolvedIp: lookupResults[0].address,
      sanitizedUrl: parsed.toString(),
    };
  } catch (error: any) {
    logger.warn("[SSRF_VALIDATOR] DNS resolution failed", { hostname, error: error?.message });
    return { isSafe: false, reason: `DNS resolution failed: ${error?.message || "Unknown error"}` };
  }
}
