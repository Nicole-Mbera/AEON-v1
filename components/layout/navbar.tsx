import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-6 z-50 flex justify-center px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 rounded-full border border-black/20 bg-gradient-to-r from-white/65 via-white/90 to-white/65 px-8 py-4 text-sm text-black shadow-[0_40px_90px_-70px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
        <Link
          href="/"
          className="flex items-center gap-3 text-base font-semibold tracking-tight"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-bold uppercase text-white">
            AEON
          </span>
          AEON Education
        </Link>
        <div className="flex items-center gap-3 lg:hidden">
          <Link href="/donate" className="text-sm font-semibold text-black/70">
            Donate
          </Link>
          <Link href="/signup" className="text-sm font-semibold text-black/70">
            Sign Up
          </Link>
        </div>
        <nav className="hidden items-center gap-8 text-black/70 lg:flex">
          {NAV_LINKS.filter((link) => link.label !== "Login").map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/donate"
            className="rounded-full px-5 py-2 text-sm font-semibold text-black/70 transition hover:text-black"
          >
            Donate
          </Link>
          <Link
            href={NAV_LINKS.find((link) => link.label === "Login")?.href ?? "#"}
            className="rounded-full px-5 py-2 text-sm font-semibold text-black/70 transition hover:text-black"
          >
            Login
          </Link>
          <Link href="/signup" className={buttonVariants({ variant: "secondary" })}>
            Get Started
          </Link>
        </div>

      </div>
    </header>
  );
}