"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const links = [
  { href: "/", label: "Hoy" },
  { href: "/salud", label: "Salud" },
  { href: "/historial", label: "Historial" },
  { href: "/plan", label: "Plan" },
  { href: "/comida", label: "Comida" },
  { href: "/chat", label: "Chat Sensei" },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="border-b border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[#21D177] text-xl font-bold tracking-tight">SENSEI</span>
          <span className="text-xs text-neutral-500 hidden sm:inline">· tu coach</span>
        </Link>
        <nav className="flex gap-1 flex-wrap">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx("nav-link", path === l.href && "active")}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
