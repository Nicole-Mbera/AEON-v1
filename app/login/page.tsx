import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Login | AEON.Academy",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your personalized learning journey with AEON."
      description="Access your dashboard, connect with expert teachers, and continue your educational path."
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[black]">
            Create one
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}