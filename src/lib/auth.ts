import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_SECONDS = 8 * 60 * 60;

function matches(actual: string, expected: string) {
  return timingSafeEqual(
    createHash("sha256").update(actual).digest(),
    createHash("sha256").update(expected).digest(),
  );
}

function signature(payload: string, username: string, password: string) {
  return createHmac("sha256", password)
    .update(JSON.stringify(["admin-session-v1", username, payload]))
    .digest("hex");
}

export async function signIn(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;
  const validUsername = matches(username, expectedUsername);
  const validPassword = matches(password, expectedPassword);
  if (!validUsername || !validPassword) return false;

  const expires = Date.now() + SESSION_SECONDS * 1000;
  const payload = `${expires}.${randomBytes(32).toString("hex")}`;
  (await cookies()).set("admin_session", `${payload}.${signature(payload, expectedUsername, expectedPassword)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return true;
}

export async function isAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return false;
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expires, nonce, signed] = parts;
  if (!/^\d+$/.test(expires) || !/^[a-f0-9]{64}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(signed)) return false;
  if (Number(expires) <= Date.now()) return false;
  return matches(signed, signature(`${expires}.${nonce}`, username, password));
}

export async function signOut() {
  (await cookies()).delete("admin_session");
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}
