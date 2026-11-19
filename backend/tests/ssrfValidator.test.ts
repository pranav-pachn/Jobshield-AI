import { validateUrlForSSRF } from "../src/utils/ssrfValidator";

describe("SSRF Validator", () => {
  it("blocks localhost and loopback IPv4 addresses", async () => {
    const res1 = await validateUrlForSSRF("http://localhost:3000/internal");
    expect(res1.isSafe).toBe(false);

    const res2 = await validateUrlForSSRF("http://127.0.0.1:8000/api");
    expect(res2.isSafe).toBe(false);

    const res3 = await validateUrlForSSRF("http://127.0.1.1");
    expect(res3.isSafe).toBe(false);
  });

  it("blocks AWS and GCP cloud metadata IP addresses", async () => {
    const res = await validateUrlForSSRF("http://169.254.169.254/latest/meta-data/");
    expect(res.isSafe).toBe(false);
    expect(res.reason).toMatch(/internal|prohibited|private|blocked/i);
  });

  it("blocks private RFC 1918 subnets", async () => {
    const res1 = await validateUrlForSSRF("http://10.0.0.1/admin");
    expect(res1.isSafe).toBe(false);

    const res2 = await validateUrlForSSRF("http://192.168.1.100/router");
    expect(res2.isSafe).toBe(false);

    const res3 = await validateUrlForSSRF("http://172.16.0.5:5000");
    expect(res3.isSafe).toBe(false);
  });

  it("blocks non-HTTP protocols like file, ftp, javascript, and gopher", async () => {
    const res1 = await validateUrlForSSRF("file:///etc/passwd");
    expect(res1.isSafe).toBe(false);

    const res2 = await validateUrlForSSRF("ftp://ftp.example.com/test");
    expect(res2.isSafe).toBe(false);

    const res3 = await validateUrlForSSRF("gopher://example.com");
    expect(res3.isSafe).toBe(false);
  });

  it("allows safe, publicly resolvable HTTPS web URLs", async () => {
    const res = await validateUrlForSSRF("https://github.com/jobs");
    expect(res.isSafe).toBe(true);
    expect(res.sanitizedUrl).toBe("https://github.com/jobs");
  });
});
