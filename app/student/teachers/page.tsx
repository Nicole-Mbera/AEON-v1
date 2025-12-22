'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import { studentNav } from '@/lib/navigation';
import Link from 'next/link';

interface Doctor {
  id: number;
  user_id: number;
  full_name: string;
  bio: string;
  specialization: string;
  years_of_experience: number;
  profile_picture: string | null;
  average_rating: number;
  total_reviews: number;
  phone: string;
  institution_name: string;
  institution_id: number;
  institution_location: string;
  institution_verification: string;
}

export default function UserDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm, specializationFilter]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (specializationFilter) params.append('specialization', specializationFilter);

      const response = await fetch(`/api/student/teachers?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch doctors');

      const result = await response.json();
      setDoctors(result.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Fetch doctors error:', err);
    } finally {
      setLoading(false);
    }
  };

  const specializations = Array.from(new Set(doctors.map(d => d.specialization))).filter(Boolean);

  return (
    <DashboardShell
      title="Find your support team"
      subtitle="Explore verified BodyWise professionals and book culturally aligned sessions."
      breadcrumbs={[{ label: 'User', href: '/user' }, { label: 'Teachers' }]}
      navItems={studentNav}
    >
      {/* Search and Filter Section */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="Search by name, specialization, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-black/50 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
          />
        </div>
        <div>
          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="w-full rounded-2xl border border-black/20 bg-white px-4 py-3 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchDoctors} className="mt-4">Retry</Button>
        </div>
      ) : doctors.length === 0 ? (
        <div className="rounded-3xl border border-black/20 bg-white p-12 text-center">
          <p className="text-lg font-semibold text-black">No teachers found</p>
          <p className="mt-2 text-sm text-black/70">Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-black/70">
            Found {doctors.length} professional{doctors.length !== 1 ? 's' : ''}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex flex-col gap-4 rounded-3xl border border-black/20 bg-white p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.2)] transition-shadow hover:shadow-[0_30px_80px_-50px_rgba(0,0,0,0.3)]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black/5 text-lg font-semibold text-black">
                    {doctor.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-lg font-semibold text-black">{doctor.full_name}</h3>
                    <p className="text-sm text-black/70">{doctor.specialization}</p>
                    {doctor.institution_name && (
                      <p className="text-xs text-black/60">{doctor.institution_name}</p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-black/70 line-clamp-3">{doctor.bio}</p>

                <div className="flex items-center gap-4 text-xs text-black/60">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 font-semibold text-white">
                    Rating: {doctor.average_rating ? doctor.average_rating.toFixed(1) : 'New'}
                  </span>
                  <span>{doctor.years_of_experience}+ years exp</span>
                  {doctor.total_reviews > 0 && (
                    <span>{doctor.total_reviews} reviews</span>
                  )}
                </div>

                <Link href={`/student/teachers/${doctor.id}`} className="mt-auto">
                  <Button variant="secondary" className="w-full">
                    View Profile & Book
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardShell>
  );
}