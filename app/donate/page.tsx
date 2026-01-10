// app/donate/page.tsx
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { DonateForm } from "@/components/donate/donate-form"; // Add this import

export const metadata = {
  title: "Support Women's Education | AEON.Academy",
};

export default function DonatePage() {
  return (
    <AuthShell
      title="Support Women's Education in Afghanistan"
      subtitle="Help Afghan women access education despite the Taliban's ban."
      description="Your donation provides not only digital learning opportunity, but also hope for the future."
      footer={
        <p>
          Return to{" "}
          <Link href="/" className="font-semibold text-black">
            Home
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-black">
            Education Crisis in Afghanistan
          </h3>

          <div className="space-y-2 text-sm text-gray-700">
            <p>
              Since the Taliban's takeover in August 15, 2021, Afghan women and girls have been systematically excluded from education.
            </p>

            <p>
              Secondary schools remain closed. Universities ban women. Female teachers have lost their livelihoods.
            </p>

            <p className="font-medium text-black">
              Despite these oppressive measures, Afghan women continue to resist through secret schools and digital learning.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm">
          <h4 className="font-semibold text-black mb-1">Our Response</h4>
          <p className="text-gray-700">
            We provide digital learning platforms, educational resources, and support for Afghan women teachers.
          </p>
        </div>

        {/* Replace the old donation section with the DonateForm */}
        <DonateForm />

        <p className="text-xs text-gray-500 text-center">
          100% of funds go to educational programs
        </p>
      </div>
    </AuthShell>
  );
}