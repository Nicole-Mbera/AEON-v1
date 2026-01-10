
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { PaymentForm } from "@/components/subscription/payment-form";

export const metadata = {
    title: "Monthly Subscription | AEON.Academy",
};

export default function SubscriptionPage() {
    return (
        <AuthShell
            title="Complete Your Registration"
            subtitle="Subscribe to unlock unlimited access to premium educational resources."
            description="Join our community of learners and start your journey today."
            footer={
                <p>
                    Already subscribed?{" "}
                    <Link href="/login" className="font-semibold text-black">
                        Log in
                    </Link>
                </p>
            }
        >
            <div className="space-y-6">
                <div className="space-y-3">
                    <h3 className="text-base font-semibold text-black">
                        Why Subscribe?
                    </h3>

                    <div className="space-y-2 text-sm text-gray-700">
                        <p>
                            Get access to expert-led courses, personalized mentorship, and a vast library of learning materials.
                        </p>

                        <ul className="list-disc pl-5 space-y-1">
                            <li>Unlimited access to all video lessons</li>
                            <li>One-on-one sessions with verified teachers</li>
                            <li>Exclusive study guides and practice tests</li>
                            <li>Downloadable resources for offline learning</li>
                        </ul>
                    </div>
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm">
                    <h4 className="font-semibold text-blue-900 mb-1">Satisfaction Guarantee</h4>
                    <p className="text-blue-800">
                        Try it risk-free. You can cancel your subscription at any time from your dashboard.
                    </p>
                </div>

                <PaymentForm />

                <p className="text-xs text-gray-500 text-center">
                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </AuthShell>
    );
}
