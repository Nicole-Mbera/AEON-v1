// components/donate/donate-form.tsx
"use client";

import { useState } from "react";
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
function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [amount, setAmount] = useState("50");
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
                setMessage("Payment successful! Thank you for your donation.");

                // Reset form
                setEmail("");
                setName("");
                setAmount("50");

                setTimeout(() => {
                    window.location.href = "/donate";
                }, 2000);
            }
        } catch (error: any) {
            setMessageType("error");
            setMessage(error.message || "Something went wrong. Please try again.");
            console.error("Payment error:", error);
        } finally {
            setIsLoading(false);
        }
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

        supportedCountries: ['US', 'CA', 'GB', 'AU', 'RW'], // Add Rwanda
        placeholder: "Card number",
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
            autoComplete="off" // ADD THIS LINE
        >
            <div className="space-y-2">
                <Label htmlFor="amount" className="text-black font-medium text-sm">
                    Select Amount (USD)
                </Label>
                <div className="grid grid-cols-4 gap-2">
                    {["25", "50", "100", "250"].map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setAmount(value)}
                            className={`py-2 rounded border text-sm ${amount === value
                                ? "border-black bg-black text-white"
                                : "border-gray-300 hover:border-black"
                                }`}
                        >
                            ${value}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="customAmount" className="text-black font-medium text-sm">
                    Or enter custom amount
                </Label>
                <Input
                    id="customAmount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter amount in USD"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border-gray-300 focus:border-black text-sm"
                    required
                    autoComplete="off" // ADD THIS
                />
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
                    autoComplete="email" // KEEP THIS for email autofill
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="name" className="text-black font-medium text-sm">
                    Name
                </Label>
                <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-gray-300 focus:border-black text-sm"
                    placeholder="Your name"
                    required
                    autoComplete="name" // KEEP THIS for name autofill
                />
            </div>

            {/* UPDATED: Better Card Details Section */}
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

                    {/* Help text */}
                    <p className="text-xs text-gray-500 mt-1">
                        Click inside the box above to enter card number, expiry, and CVC
                    </p>
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
                {isLoading ? "Processing..." : `Donate $${amount}`}
            </Button>

            <div className="text-center space-y-2">
                <p className="text-xs text-gray-500">
                    Secure payment powered by Stripe. Your card details are never stored on our servers.
                </p>
            </div>
        </form>
    );
}

// Wrapper component that provides Stripe context
export function DonateForm() {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
}