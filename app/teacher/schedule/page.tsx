'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { teacherNav } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Plus, Trash2, Save, X, Video, XCircle } from 'lucide-react';

interface Schedule {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Booking {
  id: number;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  student_name: string;
  meeting_link?: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  const [newSlot, setNewSlot] = useState({
    day_of_week: new Date().getDay(),
    start_time: '09:00',
    end_time: '10:00',
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 30);

      const response = await fetch(
        `/api/teacher/schedule?include_bookings=true&start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
      );

      if (!response.ok) throw new Error('Failed to fetch schedules');

      const result = await response.json();
      setSchedules(result.data.schedules || []);
      setBookings(result.data.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    try {
      const response = await fetch('/api/teacher/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add schedule');
      }

      await fetchSchedules();
      setIsAddingSlot(false);
      setNewSlot({
        day_of_week: new Date().getDay(),
        start_time: '09:00',
        end_time: '10:00',
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add schedule');
    }
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

      await fetchSchedules();
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Failed to cancel session. Please try again.');
    }
  };

  const handleDeleteSlot = async (id: number) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) return;

    try {
      const response = await fetch(`/api/teacher/schedule?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete schedule');

      await fetchSchedules();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete schedule');
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getBookingsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return bookings.filter(b => b.scheduled_date === dateString);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add previous month's days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  //test1233456
  if (loading) {
    return (
      <DashboardShell
        title="Manage Schedule"
        subtitle="Loading your schedule..."
        breadcrumbs={[
          { label: 'Teacher', href: '/teacher' },
          { label: 'Schedule' },
        ]}
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

  return (
    <DashboardShell
      title="Manage Schedule"
      subtitle="Create availability slots for students to book sessions"
      breadcrumbs={[
        { label: 'Teacher', href: '/teacher' },
        { label: 'Schedule' },
      ]}
      navItems={teacherNav}
    >
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        {/* Calendar View */}
        <div className="rounded-3xl border border-[gray-200] bg-white p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.15)]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[black]">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <Button onClick={goToPreviousMonth} variant="secondary" className="px-4 py-2 text-xs">
                ←
              </Button>
              <Button onClick={goToNextMonth} variant="secondary" className="px-4 py-2 text-xs">
                →
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-[gray-600]">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {getDaysInMonth(selectedDate).map((day, index) => {
              const dayBookings = getBookingsForDate(day.date);
              const dayOfWeek = day.date.getDay();
              const hasAvailability = schedules.some(s => s.day_of_week === dayOfWeek && s.is_available);

              return (
                <div
                  key={index}
                  className={`min-h-[80px] rounded-xl border p-2 transition-all ${!day.isCurrentMonth
                    ? 'border-transparent bg-gray-50 text-gray-400'
                    : isToday(day.date)
                      ? 'border-[gray-300] bg-[gray-50] ring-2 ring-[gray-300]/20'
                      : hasAvailability
                        ? 'border-[gray-200] bg-white hover:border-[gray-300] hover:shadow-lg cursor-pointer'
                        : 'border-[gray-200] bg-white'
                    }`}
                >
                  <div className="text-right text-sm font-medium text-[black]">
                    {day.date.getDate()}
                  </div>
                  {day.isCurrentMonth && dayBookings.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {dayBookings.slice(0, 2).map((booking) => (
                        <div
                          key={booking.id}
                          className="truncate rounded bg-[gray-300]/20 px-1 text-xs text-[gray-600]"
                          title={`${booking.student_name} - ${booking.scheduled_time}`}
                        >
                          {booking.scheduled_time.substring(0, 5)}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-xs text-[gray-600]">+{dayBookings.length - 2} more</div>
                      )}
                    </div>
                  )}
                  {day.isCurrentMonth && hasAvailability && dayBookings.length === 0 && (
                    <div className="mt-1 text-xs text-[gray-300]">Available</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Availability Settings */}
        <div className="space-y-6">
          {/* Add New Slot */}
          <div className="rounded-3xl border border-[gray-200] bg-white p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.15)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[black]">Weekly Availability</h2>
              <Button
                onClick={() => setIsAddingSlot(!isAddingSlot)}
                variant="secondary"
                className="px-4 py-2 text-xs"
              >
                {isAddingSlot ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {isAddingSlot ? 'Cancel' : 'Add Slot'}
              </Button>
            </div>

            {isAddingSlot && (
              <div className="mb-4 space-y-3 rounded-2xl border border-[gray-200] bg-[gray-50] p-4">
                <div>
                  <Label htmlFor="day">Day of Week</Label>
                  <select
                    id="day"
                    value={newSlot.day_of_week}
                    onChange={(e) => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })}
                    className="w-full rounded-2xl border border-[gray-200] bg-white px-4 py-2 text-sm focus:border-[gray-300] focus:outline-none focus:ring-2 focus:ring-[gray-200]/80"
                  >
                    {DAYS.map((day, index) => (
                      <option key={index} value={index}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={newSlot.start_time}
                      onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newSlot.end_time}
                      onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleAddSlot} variant="secondary" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Availability
                </Button>
              </div>
            )}

            {/* Existing Schedules */}
            <div className="space-y-2">
              {schedules.length === 0 ? (
                <div className="py-8 text-center">
                  <Clock className="mx-auto h-12 w-12 text-[gray-300]" />
                  <p className="mt-2 text-sm text-[gray-600]">No availability slots set</p>
                  <p className="text-xs text-[gray-600]">Add slots to allow students to book sessions</p>
                </div>
              ) : (
                schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between rounded-xl border border-[gray-200] bg-white p-3 hover:border-[gray-300] hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[gray-300]/20">
                        <Clock className="h-5 w-5 text-[gray-600]" />
                      </div>
                      <div>
                        <div className="font-medium text-[black]">{DAYS[schedule.day_of_week]}</div>
                        <div className="text-sm text-[gray-600]">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteSlot(schedule.id)}
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 px-3 py-2 text-xs"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="rounded-3xl border border-[gray-200] bg-white p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.15)]">
            <h3 className="mb-4 font-semibold text-[black]">Upcoming Bookings</h3>
            <div className="space-y-2">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 rounded-lg border border-[gray-200]/50 bg-white p-3"
                >
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-[gray-300]/10 shrink-0">
                    <span className="text-xs text-[gray-600]">
                      {new Date(booking.scheduled_date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-base font-bold text-[black]">
                      {new Date(booking.scheduled_date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[black] truncate">{booking.student_name}</div>
                    <div className="text-sm text-[gray-600]">{formatTime(booking.scheduled_time)}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {booking.meeting_link && (
                      <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300"
                          title="Join Meeting"
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 hover:border-red-300"
                      onClick={() => handleCancelSession(booking.id)}
                      title="Cancel Session"
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <p className="py-4 text-center text-sm text-[gray-600]">No upcoming bookings</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}


