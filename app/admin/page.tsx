import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { adminNav } from "@/lib/navigation";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <DashboardShell
      title="Platform Administration"
      subtitle="Monitor platform health, user analytics, and approve teacher registrations."
      actions={
        <div className="flex gap-3">
          <Link
            href="/admin/users"
            className="rounded-full bg-[gray-300] px-5 py-3 text-sm font-semibold text-white shadow-[0_25px_70px_-55px_rgba(0,0,0,0.2)] transition hover:bg-[gray-400]"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/teachers"
            className="rounded-full bg-[black] px-5 py-3 text-sm font-semibold text-white shadow-[0_25px_70px_-55px_rgba(0,0,0,0.2)] transition hover:bg-[gray-800]"
          >
            Review Teachers
          </Link>
        </div>
      }
      breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
      navItems={adminNav}
    >
      <AdminDashboard />
    </DashboardShell>
  );
}


