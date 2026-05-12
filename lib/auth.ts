import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "sensei_auth";
const VALID_PASSCODE = process.env.SENSEI_PASSCODE || "manuel-sensei-2026";

export async function requireAuth() {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (token !== VALID_PASSCODE) {
    redirect("/login");
  }
}

export async function setAuthCookie(passcode: string): Promise<boolean> {
  if (passcode !== VALID_PASSCODE) return false;
  const c = await cookies();
  c.set(COOKIE_NAME, passcode, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
  return true;
}

export async function clearAuthCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}
