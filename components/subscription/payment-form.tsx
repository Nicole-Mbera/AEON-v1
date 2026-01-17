
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Elements,
    CardElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Load Stripe outside component to avoid recreating object
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Main form component that uses Stripe hooks
function SubscriptionCheckoutForm({ redirectUrl = "/student/assessment" }: { redirectUrl?: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();

    // Fixed subscription amount (e.g., $5/month)
    const [amount] = useState("5");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"success" | "error">("success");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            // Create payment intent on your server
            const response = await fetch("/api/payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: Number(amount) * 100, // Convert to cents
                    email,
                    name,
                    type: "subscription", // Explicitly set type
                    metadata: {
                        source: "payment_form"
                    }
                }),
            });

            const { clientSecret, error: serverError } = await response.json();

            if (serverError) {
                throw new Error(serverError);
            }

            // Confirm the payment with card element
            const cardElement = elements.getElement(CardElement);

            if (!cardElement) {
                throw new Error("Card element not found");
            }

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name,
                            email,
                        },
                    },
                }
            );

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            if (paymentIntent?.status === "succeeded") {
                setMessageType("success");
                setMessage("Payment successful! Verifying...");

                // 1. Synchronous Verification
                try {
                    const verifyRes = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentIntentId: paymentIntent.id })
                    });

                    if (!verifyRes.ok) {
                        console.error("Verification failed, falling back to polling");
                    }
                } catch (e) {
                    console.error("Verification error:", e);
                }

                // 2. Refresh Session (now likely to succeed immediately)
                await handleRefreshSession();

                setMessage("Redirecting...");
                setTimeout(() => {
                    // Force hard reload to ensure middleware gets new cookie
                    window.location.href = redirectUrl;
                }, 1000);
            }
        } catch (error: any) {
            setMessageType("error");
            setMessage(error.message || "Something went wrong. Please try again.");
            console.error("Payment error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefreshSession = async () => {
        const maxRetries = 10;
        const delay = 1000; // 1 second

        for (let i = 0; i < maxRetries; i++) {
            try {
                const res = await fetch('/api/auth/refresh-session', {
                    method: 'POST',
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.subscription_status === 'active') {
                        console.log('Session refreshed and active');
                        return true;
                    }
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, delay));
            } catch (error) {
                console.error('Failed to check session status:', error);
            }
        }
        console.warn('Timed out waiting for subscription activation');
        return false;
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: "16px",
                color: "#000000",
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                "::placeholder": {
                    color: "#9CA3AF",
                },
                backgroundColor: "#FFFFFF",
            },
            invalid: {
                color: "#EF4444",
                iconColor: "#EF4444",
            },
            complete: {
                color: "#22C55E",
                iconColor: "#22C55E",
            }
        },
        hidePostalCode: true,
        classes: {
            base: "StripeElement",
            complete: "StripeElement--complete",
            empty: "StripeElement--empty",
            focus: "StripeElement--focus",
            invalid: "StripeElement--invalid",
            webkitAutofill: "StripeElement--webkit-autofill",
        },

        supportedCountries: ['US', 'CA', 'GB', 'AU', 'RW'],
        placeholder: "Card number",
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
            autoComplete="off"
        >
            <div className="rounded-lg bg-gray-100 p-4 border border-gray-200 mb-4">
                <p className="text-sm text-gray-700">Subscription Total:</p>
                <p className="text-2xl font-bold text-black">${amount}.00 <span className="text-sm font-normal text-gray-500">/ month</span></p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className="text-black font-medium text-sm">
                    Email (for receipt)
                </Label>
                <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-300 focus:border-black text-sm"
                    placeholder="you@example.com"
                    autoComplete="email"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="name" className="text-black font-medium text-sm">
                    Cardholder Name
                </Label>
                <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-gray-300 focus:border-black text-sm"
                    placeholder="Your name"
                    required
                    autoComplete="name"
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label className="text-black font-medium text-sm">
                        Card Details
                    </Label>
                    <span className="text-xs text-gray-500">
                        Enter card number manually
                    </span>
                </div>

                <div className="relative">
                    <div className="p-3 border border-gray-300 rounded-md bg-white">
                        <CardElement
                            options={cardElementOptions}
                            id="card-element"
                            className="min-h-[40px]"
                        />
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-md text-sm ${messageType === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                    {message}
                </div>
            )}

            <Button
                type="submit"
                disabled={!stripe || isLoading}
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Processing..." : `Subscribe Now ($${amount})`}
            </Button>

            <div className="text-center space-y-2">
                <p className="text-xs text-gray-500">
                    Secure payment powered by Stripe. You can cancel anytime.
                </p>
            </div>
        </form>
    );
}

// Wrapper component that provides Stripe context
export function PaymentForm({ redirectUrl }: { redirectUrl?: string }) {
    return (
        <Elements stripe={stripePromise}>
            <SubscriptionCheckoutForm redirectUrl={redirectUrl} />
        </Elements>
    );
}
