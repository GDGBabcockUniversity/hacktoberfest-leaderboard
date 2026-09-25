import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const jar = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn(), delete: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => jar }));
import { isAdmin, requireAdmin, signIn, signOut } from "./auth";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("ADMIN_USERNAME", "organizer");
  vi.stubEnv("ADMIN_PASSWORD", "test-password-only");
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

async function login() {
  expect(await signIn("organizer", "test-password-only")).toBe(true);
  const token = jar.set.mock.calls[0][1] as string;
  jar.get.mockReturnValue({ value: token });
  return token;
}

describe("admin authentication", () => {
  it("fails closed when credentials or a session are missing", async () => {
    expect(await isAdmin()).toBe(false);
    for (const key of ["ADMIN_USERNAME", "ADMIN_PASSWORD"]) {
      vi.stubEnv(key, "");
      expect(await isAdmin()).toBe(false);
      expect(await signIn("organizer", "test-password-only")).toBe(false);
    }
    await expect(requireAdmin()).rejects.toThrow("Unauthorized");
    expect(jar.set).not.toHaveBeenCalled();
  });
  it("requires both correct credentials", async () => {
    expect(await signIn("other", "test-password-only")).toBe(false);
    expect(await signIn("organizer", "wrong")).toBe(false);
    expect(jar.set).not.toHaveBeenCalled();
  });
  it("issues a signed, protected production cookie without the password", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const token = await login();
    expect(token).not.toContain("test-password-only");
    expect(jar.set).toHaveBeenCalledWith("admin_session", token, {
      httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 28800,
    });
    expect(await isAdmin()).toBe(true);
    await expect(requireAdmin()).resolves.toBeUndefined();
  });
  it("rejects tampered, malformed, and legacy password cookies", async () => {
    const token = await login();
    for (const value of [token.replace(/^./, "9"), "invalid", "test-password-only", `${token}.extra`]) {
      jar.get.mockReturnValue({ value });
      expect(await isAdmin()).toBe(false);
    }
  });
  it("expires sessions after eight hours", async () => {
    vi.useFakeTimers();
    await login();
    vi.advanceTimersByTime(8 * 60 * 60 * 1000);
    expect(await isAdmin()).toBe(false);
  });
  it.each(["ADMIN_USERNAME", "ADMIN_PASSWORD"])("invalidates sessions when %s changes", async (key) => {
    await login();
    vi.stubEnv(key, "changed");
    expect(await isAdmin()).toBe(false);
  });
  it("clears the session on sign out", async () => {
    await signOut();
    expect(jar.delete).toHaveBeenCalledWith("admin_session");
  });
});
