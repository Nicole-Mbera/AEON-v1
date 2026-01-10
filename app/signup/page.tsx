import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Create Account | AEON.Academy",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your AEON account"
      subtitle="Join our platform to connect with expert teachers, access personalized learning paths, and unlock educational opportunities without boundaries."
      description="Sign up as a student to learn or as a teacher to share your expertise—start your educational journey today."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[black]">
            Sign in
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}