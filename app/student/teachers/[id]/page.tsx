'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import { studentNav } from '@/lib/navigation';
import { BookingPaymentModal } from '@/components/booking/booking-payment-modal';

interface Doctor {
  id: number;
  full_name: string;
  bio: string;
  specialization: string;
  years_of_experience: number;
  average_rating: number;
  total_reviews: number;
  institution_name: string;
  contact_email?: string;
  monthly_fee?: number;
  is_onboarded?: boolean;
}

interface AvailableSlot {
  id: number;
  teacher_id: number;
  slot_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
  end_time: string;
  is_booked: number;
}

interface RecurringOption {
  dayOfWeek: string; // "Tuesday"
  time: string; // "10:00:00"
  slots: AvailableSlot[]; // The specific dates this matches
}

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Recurring state
  const [recurringOptions, setRecurringOptions] = useState<RecurringOption[]>([]);
  const [selectedRecurring, setSelectedRecurring] = useState<string[]>([]); // Array of "Day-Time" strings e.g. "Tuesday-10:00:00"

  const [notes, setNotes] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchDoctorAndSlots();
  }, [doctorId]);

  const fetchDoctorAndSlots = async () => {
    try {
      setLoading(true);
      const [doctorRes, slotsRes] = await Promise.all([
        fetch(`/api/student/teachers/${doctorId}`, { credentials: 'include' }),
        fetch(`/api/student/available-slots?teacher_id=${doctorId}`, { credentials: 'include' })
      ]);

      if (!doctorRes.ok) throw new Error('Failed to fetch doctor data');

      const doctorData = await doctorRes.json();
      const slotsData = slotsRes.ok ? await slotsRes.json() : { data: [] };
      const rawSlots: AvailableSlot[] = slotsData.data || [];

      setDoctor(doctorData.data);

      // Group slots by Day + Time to find recurring patterns
      const groups: Record<string, AvailableSlot[]> = {};

      rawSlots.forEach(slot => {
        const date = new Date(slot.slot_date); // Note: server returns YYYY-MM-DD, might need 'T00:00' for local time safety if not UTC
        // Just parsing text for day of week
        const dayName = new Date(slot.slot_date).toLocaleDateString('en-US', { weekday: 'long' });
        const key = `${dayName}-${slot.start_time}`;

        if (!groups[key]) groups[key] = [];
        groups[key].push(slot);
      });

      // Convert to options
      const options: RecurringOption[] = Object.entries(groups).map(([key, groupSlots]) => {
        const [day, time] = key.split('-');
        return {
          dayOfWeek: day,
          time: time,
          slots: groupSlots
        };
      }).sort((a, b) => a.dayOfWeek.localeCompare(b.dayOfWeek) || a.time.localeCompare(b.time));

      setRecurringOptions(options);

    } catch (err: any) {
      console.error('Fetch error:', err);
      alert(err.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecurringSelection = (key: string) => {
    setSelectedRecurring(prev => {
      if (prev.includes(key)) return prev.filter(k => k !== key);
      // Limit to 2 per week? Not enforced by code, but requirement said "book two sessions"
      if (prev.length >= 2) {
        const confirm = window.confirm("You usually select 2 sessions per week. Replace one?");
        if (!confirm) return prev;
        return [prev[1], key]; // Keep last one + new one
      }
      return [...prev, key];
    });
  };

  const handleBooking = () => {
    if (selectedRecurring.length === 0) {
      alert('Please select at least one recurring time slot');
      return;
    }
    setShowPaymentModal(true);
  };

  const confirmBooking = async (paymentIntentId: string) => {
    try {
      setShowPaymentModal(false);
      setBookingLoading(true);

      // Gather all 'bookingItems' (list of dates) from selected recurring options
      // selectedRecurring has keys "Day-Time"
      // recurringOptions has the actual slots

      const allBookingItems: { scheduledDate: string, scheduledTime: string }[] = [];

      selectedRecurring.forEach(key => {
        const [day, time] = key.split('-');
        const option = recurringOptions.find(opt => opt.dayOfWeek === day && opt.time === time);
        if (option) {
          option.slots.forEach(slot => {
            allBookingItems.push({
              scheduledDate: slot.slot_date,
              scheduledTime: slot.start_time
            });
          });
        }
      });

      const response = await fetch('/api/student/sessions/book', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: parseInt(doctorId),
          bookingItems: allBookingItems,
          notes,
          paymentIntentId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Booking failed');
      }

      alert('Monthly subscription active! ' + result.count + ' sessions booked.');
      router.push('/student');
    } catch (err: any) {
      alert(err.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell title="Loading..." subtitle="Please wait" breadcrumbs={[{ label: 'User', href: '/user' }, { label: 'Teachers', href: '/user/doctors' }, { label: 'Details' }]} navItems={studentNav}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-900 border-t-transparent"></div>
        </div>
      </DashboardShell>
    );
  }

  if (!doctor) return null;

  return (
    <DashboardShell
      title={doctor.full_name}
      subtitle={doctor.specialization}
      breadcrumbs={[{ label: 'User', href: '/user' }, { label: 'Teachers', href: '/user/doctors' }, { label: doctor.full_name }]}
      navItems={studentNav}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
        {/* Teacher Info */}
        <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-lg">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-3xl font-semibold text-gray-700">
            {doctor.full_name.charAt(0)}
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">{doctor.full_name}</h2>
          <p className="mb-4 text-sm text-gray-700">{doctor.specialization}</p>
          <div className="mb-4 flex items-center gap-2 text-sm">
            <span className="text-gray-600">{doctor.total_reviews} reviews</span>
          </div>
          <p className="mb-4 text-sm text-gray-700">{doctor.bio}</p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>{doctor.years_of_experience}+ years experience</p>
            <p className="font-semibold text-black mt-2">
              Monthly Subscription: ${doctor.monthly_fee ? (doctor.monthly_fee / 100).toFixed(2) : '60.00'}
            </p>
          </div>
        </div>

        {/* Recurring Booking Section */}
        <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Select Your Weekly Schedule</h3>
          <p className="text-sm text-gray-500 mb-4">
            Select 2 days/times that work for you. These will recur for the next 4 weeks.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-6">
            {recurringOptions.map((opt) => {
              const key = `${opt.dayOfWeek}-${opt.time}`;
              const isSelected = selectedRecurring.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleRecurringSelection(key)}
                  className={`p-3 rounded-xl border text-left transition-all ${isSelected
                    ? 'border-black bg-black text-white shadow-md'
                    : 'border-gray-200 hover:border-black/50'
                    }`}
                >
                  <div className="text-sm font-bold">{opt.dayOfWeek}</div>
                  <div className="text-xs opacity-80">
                    {new Date(`2000-01-01T${opt.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm"
                placeholder="Any goals for this month?"
                rows={2}
              />
            </div>

            <Button
              onClick={handleBooking}
              disabled={selectedRecurring.length === 0 || bookingLoading || !doctor.is_onboarded}
              className="w-full h-12 text-base"
            >
              {bookingLoading ? 'Processing...' : (!doctor.is_onboarded ? 'Teacher Not Available' : `Subscribe & Book Month`)}
            </Button>
          </div>
        </div>
      </div>

      {doctor && (
        <BookingPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={doctor.monthly_fee || 6000}
          teacherName={doctor.full_name}
          teacherId={doctor.id}
          onSuccess={confirmBooking}
        />
      )}
    </DashboardShell>
  );
}