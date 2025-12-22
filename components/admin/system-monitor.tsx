"use client";

import { useState, useEffect } from "react";
import {
  RiDatabase2Line,
  RiServerLine,
  RiTimeLine,
  RiAlertLine,
  RiCheckLine,
} from "react-icons/ri";

interface ActivityLog {
  id: number;
  activity_type: string;
  details: string | null;
  created_at: string;
  email: string;
  role: string;
}

export function SystemMonitor() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      const response = await fetch('/api/admin/activity', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity data');
      }

      const result = await response.json();
      setActivities(result.data.slice(0, 10)); // Show last 10 activities
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getActionIcon = (action: string | null) => {
    if (!action) return <RiDatabase2Line className="h-5 w-5 text-[black]" />;
    
    if (action.includes('created') || action.includes('registered')) {
      return <RiCheckLine className="h-5 w-5 text-green-600" />;
    }
    if (action.includes('updated') || action.includes('approved')) {
      return <RiServerLine className="h-5 w-5 text-blue-600" />;
    }
    if (action.includes('deleted') || action.includes('rejected')) {
      return <RiAlertLine className="h-5 w-5 text-red-600" />;
    }
    return <RiDatabase2Line className="h-5 w-5 text-[black]" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[black] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[black]">
            Recent Activity
          </h3>
          <p className="text-sm text-[gray-500]">
            Latest platform activities and system events
          </p>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="rounded-2xl border border-[gray-200] bg-[gray-50] p-6 text-center">
            <p className="text-sm text-[gray-500]">No recent activities</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-2xl border border-[gray-200] bg-white p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-full bg-[gray-50] p-2">
                  {getActionIcon(activity.activity_type)}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[black]">
                      {activity.activity_type || 'Activity'}
                    </p>
                    <span className="flex items-center text-xs text-[gray-500]">
                      <RiTimeLine className="mr-1 h-3 w-3" />
                      {formatRelativeTime(activity.created_at)}
                    </span>
                  </div>
                  <p className="mb-1 text-sm text-[gray-700]">
                    {activity.details || 'No details'}
                  </p>
                  <p className="text-xs text-[gray-400]">
                    by {activity.email} ({activity.role})
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
