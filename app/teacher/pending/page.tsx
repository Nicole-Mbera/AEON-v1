'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import { AuthShell } from "@/components/layout/auth-shell";

export default function TeacherPendingPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                        <ShieldAlert className="h-6 w-6 text-yellow-600" />
                    </div>

                    <h2 className="mt-2 text-2xl font-bold text-gray-900">Account Pending Verification</h2>

                    <div className="mt-4 text-sm text-gray-600 space-y-4">
                        <p>
                            Thank you for registering as a teacher on AEON Education.
                        </p>
                        <p>
                            Your account is currently under review by our administration team. We are verifying your credentials to ensure the highest quality of education for our students.
                        </p>
                        <div className="bg-blue-50 p-4 rounded-md text-left">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" /> Next Steps:
                            </h4>
                            <ul className="list-disc list-inside text-blue-800 space-y-1 ml-1">
                                <li>Wait for email confirmation</li>
                                <li>Review usually takes 24-48 hours</li>
                                <li>Prepare your profile materials</li>
                            </ul>
                        </div>
                        <p>
                            You will receive an email notification once your account has been approved.
                        </p>
                    </div>

                    <div className="mt-8">
                        <Link href="/">
                            <Button variant="outline" className="w-full">
                                Return to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
