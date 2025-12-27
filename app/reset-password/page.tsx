
'use client';

import { useState, FormEvent, Suspense } from 'react'; // Added Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthShell } from '@/components/layout/auth-shell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!token) {
        return (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-800 text-center">
                <p className="font-semibold mb-2">Invalid Link</p>
                <p>This password reset link is invalid or has expired.</p>
                <Link href="/forgot-password" className="mt-4 inline-block underline">
                    Request a new link
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            setIsSuccess(true);
            // Optional: Redirect after a few seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Password Reset Successful</h3>
                <p className="text-gray-600 mb-6">Your password has been updated. You can now log in with your new password.</p>
                <Button
                    onClick={() => router.push('/login')}
                    className="w-full"
                >
                    Go to Login
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password" requiredIndicator>
                        New Password
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" requiredIndicator>
                        Confirm Password
                    </Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>

            <Button
                type="submit"
                variant="secondary"
                className="w-full"
                disabled={isLoading}
            >
                {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <AuthShell
            title="Reset Password"
            subtitle="Create a new password"
            description="Please choose a strong password for your account."
            footer={
                <Link
                    href="/login"
                    className="inline-flex items-center text-sm font-semibold text-black hover:text-gray-700 transition"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                </Link>
            }
        >
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </AuthShell>
    );
}
