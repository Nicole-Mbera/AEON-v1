'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { StatCard } from '@/components/dashboard/stat-card';
import { ScheduleList } from '@/components/dashboard/schedule-list';
import { studentNav } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DashboardData {
  patient: { name: string; username: string };
  stats: {
    totalConsultations: number;
    scheduledConsultations: number;
    completedConsultations: number;
    cancelledConsultations: number;
  };
  upcomingAppointments: Array<{
    id: number; scheduled_date: string; scheduled_time: string; duration_minutes: number;
    meeting_link: string; status: string; notes: string; doctor_name: string;
    specialization: string; doctor_picture: string | null; institution_name: string;
  }>;
  recentArticles: Array<{
    id: number; title: string; content: string; category: string; thumbnail_url: string | null;
    views_count: number; created_at: string; author_name: string;
    author_specialization: string | null; institution_name: string;
  }>;
  pendingInvitations: Array<{
    id: number; invitee_email: string; status: string; sent_at: string;
    scheduled_date: string; scheduled_time: string; doctor_name: string;
  }>;
}

const habitChecklist = [
  'Reflect and journal your day in English(10 mins)',
  'Practice and revise conent shared by your learning coach',
  'Read at least one article',
] as const;

export default function UserProfilePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const result = await response.json();
      setData(result.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell title="Loading your learning snapshot..." subtitle="Please wait" breadcrumbs={[{ label: 'User' }, { label: 'Dashboard' }]} navItems={studentNav}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
        </div>
      </DashboardShell>
    );
  }

  if (error || !data) {
    return (
      <DashboardShell title="Error loading dashboard" subtitle="Please try again" breadcrumbs={[{ label: 'User' }, { label: 'Dashboard' }]} navItems={studentNav}>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">{error || 'Failed to load dashboard data'}</p>
          <Button onClick={fetchDashboardData} className="mt-4">Retry</Button>
        </div>
      </DashboardShell>
    );
  }

  const userStats = [
    { label: 'Total Sessions', value: data.stats.totalConsultations.toString(), trend: data.stats.totalConsultations > 0 ? 'up' : undefined },
    { label: 'Upcoming', value: data.stats.scheduledConsultations.toString(), trend: data.stats.scheduledConsultations > 0 ? 'up' : undefined },
    { label: 'Completed', value: data.stats.completedConsultations.toString(), trend: 'stable' },
  ];

  const formattedAppointments = data.upcomingAppointments.map((apt) => {
    const startTime = new Date(`2000-01-01T${apt.scheduled_time}`);
    const endTime = new Date(startTime.getTime() + (apt.duration_minutes || 30) * 60000);
    const timeRange = `${startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

    return {
      title: `Session with ${apt.doctor_name}`,
      date: new Date(apt.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: timeRange,
      duration: `${apt.duration_minutes || 30} min`,
      specialist: apt.specialization,
      status: apt.status,
      meeting_link: apt.meeting_link,
    };
  });

  return (
    <DashboardShell
      title={`Hi ${data.patient.name}, here's your learning journey snapshot`}
      breadcrumbs={[{ label: 'User' }, { label: 'Dashboard' }]}
      navItems={studentNav}
    >
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {userStats.map((stat) => <StatCard key={stat.label} label={stat.label} value={stat.value} trend={stat.trend as any} />)}
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-black/20 bg-white p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.2)]">
          <h3 className="text-sm font-semibold text-black">Today&apos;s Education focus</h3>
          <ul className="mt-5 space-y-3 text-sm text-black">
            {habitChecklist.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl bg-black/5 px-3 py-2">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border border-black/30 text-black focus:ring-black" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </section>

      {formattedAppointments.length > 0 ? (
        <ScheduleList heading="Upcoming appointments" items={formattedAppointments} />
      ) : (
        <div className="rounded-3xl border border-black/20 bg-white p-8 text-center shadow-[0_30px_80px_-60px_rgba(0,0,0,0.2)]">
          <h3 className="mb-2 text-lg font-semibold text-black">No upcoming appointments</h3>
          <p className="mb-4 text-sm text-black/70">Book your first session with a verified learning coach</p>
          <Link href="/student/teachers"><Button variant="secondary">Find teachers</Button></Link>
        </div>
      )}

      {data.recentArticles.length > 0 && (
        <section className="rounded-3xl border border-black/20 bg-white p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.2)]">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">Latest Articles </h3>
            <Link href="/education" className="text-sm font-medium text-black/70 hover:text-black">View all →</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.recentArticles.map((article) => (
              <div key={article.id} className="group cursor-pointer">
                <div className="mb-3 overflow-hidden rounded-2xl bg-black/5">
                  {article.thumbnail_url ? (
                    <img src={article.thumbnail_url} alt={article.title} className="h-40 w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-40 items-center justify-center"><span className="text-4xl text-black/50">Education</span></div>
                  )}
                </div>
                <span className="mb-1 inline-block rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">{article.category}</span>
                <h4 className="mb-1 text-sm font-semibold text-black line-clamp-2">{article.title}</h4>
                <p className="text-xs text-black/60">By {article.author_name} {article.author_specialization && `• ${article.author_specialization}`}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-black/20 bg-gradient-to-br from-white to-black/5 p-8 text-center shadow-[0_30px_80px_-60px_rgba(0,0,0,0.2)]">
        <h3 className="mb-2 text-lg font-semibold text-black">Share Your Story</h3>
        <p className="mb-4 text-sm text-black/70">Help others on their education journey by sharing your experience with AEON</p>
        <Link href="/testimonials"><Button variant="secondary">Share Testimonial</Button></Link>
      </section>
    </DashboardShell>
  );
}