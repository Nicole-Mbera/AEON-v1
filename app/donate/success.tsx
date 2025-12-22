// app/donate/success/page.tsx
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";

export default function DonateSuccessPage() {
  return (
    <AuthShell
      title="Thank You for Your Donation!"
      subtitle="Your payment was successful"
      description="A receipt has been sent to your email"
      footer={
        <p>
          Return to{" "}
          <Link href="/" className="font-semibold text-black">
            Home
          </Link>
        </p>
      }
    >
      <div className="space-y-6 text-center">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-black">
            Donation Received
          </h3>
          
          <p className="text-sm text-gray-700">
            Your support will help provide education for Afghan women and girls. Thank you for making a difference.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            <Link href="/">
              Return to Home
            </Link>
          </Button>
          
          <Button
            className="w-full border-black text-black hover:bg-gray-50"
          >
            <Link href="/donate">
              Make Another Donation
            </Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}