import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/constants";
import {
  RiTwitterXLine,
  RiInstagramLine,
  RiYoutubeLine,
  RiLinkedinBoxLine,
} from "react-icons/ri";

const columns = [
  {
    title: "Platform",
    links: [
      { name: "About Us", href: "/#about" },
      { name: "How It Works", href: "/#features" },
      { name: "Success Stories", href: "/testimonials" },
      { name: "Education Hub", href: "/education" },
    ],
  },
  {
    title: "Get Started",
    links: [
      { name: "Sign In", href: "/login" },
      { name: "Sign Up", href: "/signup" },
      { name: "Find Teachers", href: "/student/doctors" },
      { name: "API Documentation", href: "/api-docs" },
    ],
  },
];

const socialIcons = {
  X: RiTwitterXLine,
  Instagram: RiInstagramLine,
  YouTube: RiYoutubeLine,
  LinkedIn: RiLinkedinBoxLine,
} as const;

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 md:flex-row md:items-start md:justify-between">
        <div className="space-y-6 max-w-xs">
          <div className="flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-sm font-bold uppercase text-white">
              AEON
            </span>
           AEON Education
          </div>
          <div className="flex items-center gap-4 text-sm text-white/80">
            {SOCIAL_LINKS.map((link) => {
              const Icon =
                socialIcons[link.name as keyof typeof socialIcons];
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-label={link.name}
                  className="transition hover:text-white"
                >
                  {Icon ? (
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span>{link.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="grid flex-1 gap-10 md:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title} className="space-y-5">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
                {column.title}
              </h4>
              <ul className="space-y-2 text-sm text-white/80">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:text-white transition">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}