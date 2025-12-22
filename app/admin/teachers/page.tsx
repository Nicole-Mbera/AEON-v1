'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { adminNav } from '@/lib/navigation';
import { Button } from '@/components/ui/button';

interface Teacher {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  specialization: string;
  years_of_experience: number;
  bio: string;
  phone: string;
  license_number?: string;
  institution_name?: string;
  country?: string;
  contact_email?: string;
  mission?: string;
  documents?: string; // JSON string
  created_at: string;
  is_verified: number;
  is_active: number;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');

  useEffect(() => {
    fetchTeachers();
  }, [filter]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/teachers?status=${filter}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch teachers');

      const result = await response.json();
      setTeachers(result.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (teacherId: number, userId: number) => {
    if (!confirm('Are you sure you want to approve this teacher?')) return;

    try {
      setActionLoading(teacherId);
      const response = await fetch('/api/admin/teachers/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ teacher_id: teacherId, user_id: userId, action: 'approve' }),
      });

      if (!response.ok) throw new Error('Failed to approve teacher');

      alert('Teacher approved successfully!');
      fetchTeachers();
    } catch (err: any) {
      alert(err.message || 'Failed to approve teacher');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (teacherId: number, userId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setActionLoading(teacherId);
      const response = await fetch('/api/admin/teachers/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          teacher_id: teacherId,
          user_id: userId,
          action: 'reject',
          reason
        }),
      });

      if (!response.ok) throw new Error('Failed to reject teacher');

      alert('Teacher registration rejected');
      fetchTeachers();
    } catch (err: any) {
      alert(err.message || 'Failed to reject teacher');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardShell
      title="Teacher Approvals"
      subtitle="Review and approve teacher registrations"
      breadcrumbs={[{ label: 'Admin' }, { label: 'Teachers' }]}
      navItems={adminNav}
    >
      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === 'pending'
            ? 'bg-[black] text-white'
            : 'bg-white border border-[gray-200] text-[black] hover:bg-[gray-100]'
            }`}
        >
          Pending Approval
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === 'approved'
            ? 'bg-[black] text-white'
            : 'bg-white border border-[gray-200] text-[black] hover:bg-[gray-100]'
            }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === 'all'
            ? 'bg-[black] text-white'
            : 'bg-white border border-[gray-200] text-[black] hover:bg-[gray-100]'
            }`}
        >
          All Teachers
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[black] border-t-transparent"></div>
        </div>
      ) : teachers.length === 0 ? (
        <div className="rounded-3xl border border-[gray-200] bg-white p-12 text-center">
          <p className="text-lg font-semibold text-[black]">
            {filter === 'pending' ? 'No pending teacher approvals' : 'No teachers found'}
          </p>
          <p className="mt-2 text-sm text-[gray-700]">
            {filter === 'pending' ? 'All teacher registrations have been reviewed' : 'No teachers match the current filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="rounded-3xl border border-[gray-200] bg-white p-6 shadow-[0_25px_70px_-60px_rgba(0,0,0,0.15)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-[black]">
                      {teacher.full_name}
                    </h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${teacher.is_verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {teacher.is_verified ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  <div className="grid gap-2 text-sm text-[gray-700]">
                    <p><strong className="text-[black]">Email:</strong> {teacher.email}</p>
                    <p><strong className="text-[black]">Specialization:</strong> {teacher.specialization}</p>
                    <p><strong className="text-[black]">Experience:</strong> {teacher.years_of_experience} years</p>
                    <p><strong className="text-[black]">Phone:</strong> {teacher.phone || 'N/A'}</p>
                    <p><strong className="text-[black]">Institution:</strong> {teacher.institution_name || 'N/A'}</p>
                    <p><strong className="text-[black]">Country:</strong> {teacher.country || 'N/A'}</p>
                    <p><strong className="text-[black]">License:</strong> {teacher.license_number || 'N/A'}</p>

                    {teacher.contact_email && <p><strong className="text-[black]">Contact Email:</strong> {teacher.contact_email}</p>}

                    {teacher.mission && (
                      <div className="mt-2">
                        <strong className="text-[black]">Mission:</strong>
                        <p className="mt-1 text-sm italic border-l-2 border-gray-300 pl-3">{teacher.mission}</p>
                      </div>
                    )}

                    <p><strong className="text-[black]">Bio:</strong> {teacher.bio}</p>

                    {teacher.documents && (
                      <div className="mt-2">
                        <strong className="text-[black]">Documents:</strong>
                        <div className="mt-1 text-xs">
                          {/* Documents are stored as a JSON string of filenames */}
                          {(() => {
                            try {
                              const docs = JSON.parse(teacher.documents as any);
                              if (Array.isArray(docs) && docs.length > 0) {
                                return (
                                  <ul className="list-disc list-inside space-y-1">
                                    {docs.map((doc: string, i: number) => {
                                      const fileName = doc.split('/').pop() || doc;
                                      return (
                                        <li key={i}>
                                          <a
                                            href={doc}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline break-all"
                                          >
                                            {fileName}
                                          </a>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                );
                              }
                              return <span className="text-gray-500">No documents uploaded</span>;
                            } catch (e) {
                              return <span className="text-gray-500">Invalid document format</span>;
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-[gray-500] mt-4">
                      Registered: {new Date(teacher.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {!teacher.is_verified && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(teacher.id, teacher.user_id)}
                      disabled={actionLoading === teacher.id}
                      className="bg-[black] hover:bg-[gray-800] rounded-2xl"
                    >
                      {actionLoading === teacher.id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleReject(teacher.id, teacher.user_id)}
                      disabled={actionLoading === teacher.id}
                      variant="secondary"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
