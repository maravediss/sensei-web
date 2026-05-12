import { NextResponse } from "next/server";
import { setAuthCookie, clearAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const { passcode } = await req.json();
  const ok = await setAuthCookie(passcode);
  if (!ok) return new NextResponse("invalid", { status: 401 });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}
