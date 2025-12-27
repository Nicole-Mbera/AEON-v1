'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import { teacherNav } from '@/lib/navigation';
import { Users } from 'lucide-react';

interface Student {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  grade_level: string | null;
  profile_picture: string | null;
  total_sessions: number;
  last_session: string | null;
  next_session: string | null;
  english_proficiency: string | null;
  proficiency_certificate: string | null;
}

export default function TeacherStudentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'teacher') return;

    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/teacher/students', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }

        const data = await response.json();
        setStudents(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <DashboardShell
        title="My Students"
        subtitle="Loading your students..."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Students" }]}
        navItems={teacherNav}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading students...</div>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell
        title="My Students"
        subtitle="Error loading students"
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Students" }]}
        navItems={teacherNav}
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="My Students"
      subtitle="View and manage all students who have booked sessions with you"
      breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Students" }]}
      navItems={teacherNav}
    >
      <div className="space-y-6">
        {students.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-16 text-center shadow-[0_20px_60px_-50px_rgba(0,0,0,0.1)]">
            <Users className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-black mb-3">
              No Students Yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto text-lg">
              Students who book sessions with you will appear here. Make sure your schedule is set up to start receiving bookings.
            </p>
            <Link href="/teacher/schedule" className="inline-block mt-6">
              <Button className="bg-gray-300 hover:bg-[gray-400] text-white px-8 py-6 text-lg rounded-2xl">
                Set Up Schedule
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <div
                key={student.user_id}
                className="group rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-[gray-50] p-8 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-start gap-4 mb-6">
                  {student.profile_picture ? (
                    <img
                      src={student.profile_picture}
                      alt={student.full_name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-2xl border-2 border-gray-200">
                      {(student.full_name || 'S').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-black truncate">
                      {student.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">@{student.username}</p>
                    <a href={`mailto:${student.email}`} className="text-xs text-blue-600 hover:underline block mt-1">
                      {student.email}
                    </a>
                    {student.grade_level && (
                      <span className="inline-block mt-2 px-3 py-1 bg-gray-300/20 text-gray-700 text-xs font-medium rounded-full">
                        {student.grade_level}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4 px-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">English Level</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize border ${student.english_proficiency === 'beginner' ? 'bg-green-50 text-green-700 border-green-200' :
                      student.english_proficiency === 'intermediate' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        student.english_proficiency === 'advanced' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                      {student.english_proficiency || 'Not set'}
                    </span>
                  </div>
                  {student.proficiency_certificate && (
                    <a
                      href={student.proficiency_certificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                      View Certificate
                    </a>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                      <p className="text-xs text-gray-600 mb-1">Total Sessions</p>
                      <p className="text-3xl font-bold text-black">
                        {student.total_sessions}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                      <p className="text-xs text-gray-600 mb-1">Last Session</p>
                      <p className="text-sm font-semibold text-black">
                        {student.last_session
                          ? new Date(student.last_session).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {student.next_session && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-gray-300/10 to-gray-400/10 rounded-2xl border border-gray-300/30">
                      <p className="text-xs text-gray-600 mb-1 font-medium">Next Session</p>
                      <p className="text-sm font-bold text-black">
                        {new Date(student.next_session).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
