import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { HERO_STATS } from "@/lib/data";
import Link from "next/link";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden rounded-[40px] bg-black px-8 pb-16 pt-20 text-white shadow-[0_45px_90px_-45px_rgba(0,0,0,0.9)] sm:px-12 lg:px-16"
    >
      <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-[gray-200]/10 blur-[140px]" />
      <div className="absolute right-[-120px] top-[-80px] h-[360px] w-[360px] rounded-full bg-[gray-300]/20 blur-[120px]" />
      <div className="relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-10">
          <div className="space-y-6">
            <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-[-0.015em] sm:text-5xl">
              AEON, Revolutionizing Education Acessibility and Efficiency, Together.
            </h1>

            {/* Mobile Image */}
            <div className="relative block lg:hidden">
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/10 p-2 shadow-[0_45px_75px_-35px_rgba(0,0,0,0.5)] backdrop-blur">
                <div className="overflow-hidden rounded-[24px]">
                  <Image
                    src="/uploads/Hero.JPG"
                    alt="AEON Academy"
                    width={520}
                    height={660}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            <p className="max-w-lg text-base text-white/70 sm:text-lg">
              We connect passionate students with expert teachers through simple booking of one on one seamless authentic connection.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/login">
              <Button id="cta">Start for Free </Button>
            </Link>
            <Link
              href="#education"
              className={buttonVariants({ variant: "ghost" })}
            >
              Explore Resources
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 text-left text-white/80">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-2xl font-semibold text-white">
                  {stat.value}
                </span>
                <span className="text-sm text-white/70">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative ml-auto hidden max-w-sm justify-end lg:flex">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/10 p-2 shadow-[0_45px_75px_-35px_rgba(0,0,0,0.5)] backdrop-blur">
            <div className="overflow-hidden rounded-[24px]">
              <Image
                src="/uploads/Hero.JPG"
                alt="AEON Academy"
                width={520}
                height={660}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}