import { cookies } from "next/headers";

export async function isAdmin() {
  return (
    (await cookies()).get("admin_session")?.value === process.env.ADMIN_PASSWORD
  );
}
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}
