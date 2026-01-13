'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import { adminNav } from '@/lib/navigation';

interface Testimonial {
  id: number;
  content: string;
  rating: number | null;
  is_featured: number;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_type: string;
  user_email: string;
  user_name: string;
  additional_info: string | null;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, [filter]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/testimonials?status=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      const result = await response.json();
      setTestimonials(result.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, isFeatured: boolean = false) => {
    try {
      setActionLoading(id);
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_status: 'approved', is_featured: isFeatured }),
      });

      if (!response.ok) throw new Error('Failed to approve testimonial');
      fetchTestimonials();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setActionLoading(id);
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_status: 'rejected' }),
      });

      if (!response.ok) throw new Error('Failed to reject testimonial');
      fetchTestimonials();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardShell
      title="Testimonial Management"
      subtitle="Review and approve user testimonials"
      breadcrumbs={[{ label: 'Admin' }, { label: 'Testimonials' }]}
      navItems={adminNav}
    >
      <div className="mb-6 flex gap-3">
        {['pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-2xl px-6 py-3 text-sm font-semibold transition-all ${filter === status
                ? 'bg-black text-white shadow-lg scale-105'
                : 'bg-white text-black border-2 border-gray-200 hover:border-black hover:shadow-md'
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[black] border-t-transparent"></div>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="rounded-3xl border border-[gray-200] bg-white p-12 text-center">
          <p className="text-lg font-semibold text-[black]">No {filter} testimonials</p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.15)]"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-black">{testimonial.user_name}</h3>
                  <p className="text-sm text-gray-500">
                    {testimonial.user_email} • {testimonial.user_type}
                    {testimonial.additional_info && ` • ${testimonial.additional_info}`}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(testimonial.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {testimonial.rating && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-200/80 px-3 py-1 text-sm font-semibold text-gray-700">
                    {testimonial.rating}/5
                  </span>
                )}
              </div>

              <p className="mb-4 text-sm text-gray-700">{testimonial.content}</p>

              {testimonial.approval_status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(testimonial.id, false)}
                    disabled={actionLoading === testimonial.id}
                    className="flex-1 bg-black hover:bg-gray-800 text-white rounded-2xl"
                  >
                    {actionLoading === testimonial.id ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    onClick={() => handleApprove(testimonial.id, true)}
                    disabled={actionLoading === testimonial.id}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-black rounded-2xl"
                  >
                    {actionLoading === testimonial.id ? 'Processing...' : 'Approve as Featured'}
                  </Button>
                  <Button
                    onClick={() => handleReject(testimonial.id)}
                    disabled={actionLoading === testimonial.id}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-2xl"
                  >
                    Reject
                  </Button>
                </div>
              )}

              {testimonial.is_featured === 1 && (
                <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-gray-300/30 px-3 py-1 text-xs font-semibold text-black">
                  Featured Testimonial
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
