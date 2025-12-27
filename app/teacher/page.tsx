'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { StatCard } from '@/components/dashboard/stat-card';
import { teacherNav } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Clock, Users, CheckCircle, XCircle, Video } from 'lucide-react';

interface Booking {
  id: number;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  meeting_link?: string;
  student_name: string;
  student_username: string;
  student_picture?: string;
}

interface DashboardData {
  professional: {
    id: number;
    name: string;
    specialization: string;
    institution: string;
    experience: number;
    rating: number;
    total_reviews: number;
  };
  stats: {
    totalConsultations: number;
    scheduledConsultations: number;
    completedConsultations: number;
    cancelledConsultations: number;
    activePatients: number;
    todaysSessions: number;
  };
  todayConsultations: Booking[];
  upcomingConsultations: Booking[];
}

export default function TeacherDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teacher/dashboard');

      if (!response.ok) throw new Error('Failed to fetch dashboard data');

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes}${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCancelSession = async (sessionId: number) => {
    if (!confirm('Are you sure you want to cancel this session? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/teacher/sessions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          status: 'cancelled',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel session');
      }

      // Refresh dashboard data
      fetchDashboardData();
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Failed to cancel session. Please try again.');
    }
  };

  if (loading) {
    return (
      <DashboardShell
        title="Dashboard"
        subtitle="Loading your dashboard..."
        breadcrumbs={[{ label: "Teacher" }]}
        navItems={teacherNav}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[gray-300] border-t-transparent mx-auto"></div>
            <p className="mt-4 text-[gray-600]">Loading...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error || !data) {
    return (
      <DashboardShell
        title="Dashboard"
        subtitle="Error loading dashboard"
        breadcrumbs={[{ label: "Teacher" }]}
        navItems={teacherNav}
      >
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">{error || 'Failed to load dashboard data'}</p>
          <Button onClick={fetchDashboardData} variant="secondary" className="mt-4">
            Try Again
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={`Welcome back, ${data.professional.name.split(' ')[0]}!`}
      subtitle="Here's what's happening with your sessions today"
      breadcrumbs={[{ label: "Teacher" }]}
      navItems={teacherNav}
    >
      {/* Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          label="Today's Sessions"
          value={data.stats.todaysSessions.toString()}
        />
        <StatCard
          label="Upcoming Sessions"
          value={data.stats.scheduledConsultations.toString()}
        />
        <StatCard
          label="Active Students"
          value={data.stats.activePatients.toString()}
        />
        <StatCard
          label="Completed"
          value={data.stats.completedConsultations.toString()}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Today's Sessions */}
        <div className="rounded-3xl border border-[gray-200] bg-white p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.15)]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[black]">Today's Sessions</h2>
            <Link href="/teacher/schedule">
              <Button variant="secondary" className="px-4 py-2 text-xs">Manage Schedule</Button>
            </Link>
          </div>

          {data.todayConsultations.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-[gray-300]" />
              <p className="mt-4 text-[gray-600]">No sessions scheduled for today</p>
              <Link href="/teacher/schedule">
                <Button variant="secondary" className="mt-4 px-4 py-2 text-xs">
                  Create Availability
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.todayConsultations.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 rounded-2xl border border-[gray-200] bg-gradient-to-r from-[gray-50] to-white p-4 transition-all hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[gray-300]/20">
                    <Clock className="h-6 w-6 text-[gray-600]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[black]">{session.student_name}</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${session.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          session.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-sm text-[gray-600]">
                      {formatTime(session.scheduled_time)} • {session.duration_minutes} min
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {session.meeting_link && (
                      <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" className="px-4 py-2 text-xs">
                          <Video className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="destructive"
                      className="px-4 py-2 text-xs"
                      onClick={() => handleCancelSession(session.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="rounded-3xl border border-[gray-200] bg-white p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.15)]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[black]">Upcoming Sessions</h2>
            <span className="text-sm text-[gray-600]">Next 7 days</span>
          </div>

          {data.upcomingConsultations.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-[gray-300]" />
              <p className="mt-4 text-[gray-600]">No upcoming sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.upcomingConsultations.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start gap-3 rounded-xl border border-[gray-200]/50 bg-white p-3 transition-all hover:border-[gray-300] hover:shadow-md"
                >
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-[gray-300]/10 text-center">
                    <span className="text-xs font-medium text-[gray-600]">
                      {new Date(session.scheduled_date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-[black]">
                      {new Date(session.scheduled_date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-[black] truncate">{session.student_name}</h4>
                        <p className="text-sm text-[gray-600]">
                          {formatTime(session.scheduled_time)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCancelSession(session.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Cancel Session"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/teacher/schedule" className="block">
          <div className="group cursor-pointer rounded-3xl border border-[gray-200] bg-gradient-to-br from-white to-[gray-50] p-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.2)]">
            <Calendar className="h-10 w-10 text-[gray-600] mb-4 group-hover:text-[gray-300] transition-colors" />
            <h3 className="font-semibold text-[black] mb-2">Manage Schedule</h3>
            <p className="text-sm text-[gray-600]">Create and edit your availability slots</p>
          </div>
        </Link>

        <Link href="/teacher/students" className="block">
          <div className="group cursor-pointer rounded-3xl border border-[gray-200] bg-gradient-to-br from-white to-[gray-50] p-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.2)]">
            <Users className="h-10 w-10 text-[gray-600] mb-4 group-hover:text-[gray-300] transition-colors" />
            <h3 className="font-semibold text-[black] mb-2">View Students</h3>
            <p className="text-sm text-[gray-600]">Manage your student relationships</p>
          </div>
        </Link>

        <Link href="/teacher/profile" className="block">
          <div className="group cursor-pointer rounded-3xl border border-[gray-200] bg-gradient-to-br from-white to-[gray-50] p-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.2)]">
            <CheckCircle className="h-10 w-10 text-[gray-600] mb-4 group-hover:text-[gray-300] transition-colors" />
            <h3 className="font-semibold text-[black] mb-2">Update Profile</h3>
            <p className="text-sm text-[gray-600]">Edit your professional information</p>
          </div>
        </Link>
      </div>
    </DashboardShell>
  );
}


