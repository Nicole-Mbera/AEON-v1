
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { PaymentForm } from "@/components/subscription/payment-form";

export const metadata = {
    title: "Teacher Subscription | AEON Education",
};

export default function TeacherSubscriptionPage() {
    return (
        <AuthShell
            title="Activate Your Teacher Account"
            subtitle="Subscribe to start teaching and earning on AEON Education."
            description="Join our faculty of expert educators."
            footer={
                <p>
                    Already have an active account?{" "}
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
                            As a verified teacher, you'll get access to:
                        </p>

                        <ul className="list-disc pl-5 space-y-1">
                            <li>Dedicated teacher dashboard</li>
                            <li>Student booking management tools</li>
                            <li>Secure payment processing for your earnings</li>
                            <li>Professional profile listing</li>
                        </ul>
                    </div>
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm">
                    <h4 className="font-semibold text-blue-900 mb-1">Risk-Free Start</h4>
                    <p className="text-blue-800">
                        You can cancel your subscription at any time.
                    </p>
                </div>

                <PaymentForm redirectUrl="/teacher" />

                <p className="text-xs text-gray-500 text-center">
                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </AuthShell>
    );
}
