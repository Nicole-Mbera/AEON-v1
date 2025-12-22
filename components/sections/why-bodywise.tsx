import { WHY_BODYWISE } from "@/lib/data";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  PiTargetBold,
  PiWarningDiamondBold,
  PiChatsCircleBold,
} from "react-icons/pi";

const iconComponents = [PiTargetBold, PiWarningDiamondBold, PiChatsCircleBold];

export function WhyBodyWiseSection() {
  return (
    <section
      id="why"
      className="rounded-[36px] bg-black px-8 py-20 shadow-[0_35px_80px_-60px_rgba(0,0,0,0.6)] sm:px-12 lg:px-16"
    >
      <SectionHeading
        eyebrow="Why AEON?"
        title="Breaking down barriers to quality education through personalized, boundary-free learning."
        description=""
        align="center"
        className="mb-14 text-white"
      />
      <div className="grid gap-10 md:grid-cols-3">
        {WHY_BODYWISE.map((item, index) => {
          const Icon = iconComponents[index];
          return (
            <div
              key={item.title}
              className="space-y-5 rounded-3xl bg-white p-8 shadow-[0_25px_65px_-55px_rgba(0,0,0,0.3)]"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                {Icon ? <Icon className="h-6 w-6" aria-hidden="true" /> : null}
              </span>
              <h3 className="text-lg font-semibold text-black">
                {item.title}
              </h3>
              <p className="text-sm text-black/70">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}