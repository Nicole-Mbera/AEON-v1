'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { DataTable } from '@/components/dashboard/data-table';
import { adminNav } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface User extends Record<string, unknown> {
  id: number;
  email: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  full_name: string | null;
  username: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    teachers: 0,
    admins: 0,
    active: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.users || []);
      setStats(data.stats || { total: 0, students: 0, teachers: 0, admins: 0, active: 0 });
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: newAdminEmail,
          password: newAdminPassword,
          full_name: newAdminName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create admin');
      }

      setShowAddAdmin(false);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin');
    }
  };

  const columns = [
    { key: 'email' as const, header: 'Email' },
    { key: 'full_name' as const, header: 'Full Name' },
    { key: 'role' as const, header: 'Role' },
    { 
      key: 'is_verified' as const, 
      header: 'Status',
      render: (value: any, user: User) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          user.is_verified ? 'bg-[gray-300]/30 text-[black]' : 'bg-[gray-50] text-[gray-600]'
        }`}>
          {user.is_verified ? 'Verified' : 'Pending'}
        </span>
      )
    },
    { 
      key: 'is_active' as const, 
      header: 'Active',
      render: (value: any, user: User) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          user.is_active ? 'bg-[gray-300]/30 text-[black]' : 'bg-[gray-200] text-[gray-400]'
        }`}>
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'created_at' as const,
      header: 'Joined',
      render: (value: any, user: User) => new Date(user.created_at).toLocaleDateString(),
    },
  ];

  return (
    <DashboardShell
      title="User Management"
      subtitle="Manage all platform users and add new administrators"
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Users' }]}
      navItems={adminNav}
      actions={
        <Button
          onClick={() => setShowAddAdmin(!showAddAdmin)}
          className="bg-[black] hover:bg-[gray-800] text-white rounded-full px-6 py-3"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      }
    >
      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <div className="rounded-3xl border border-[gray-200] bg-white p-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.1)]">
          <p className="text-sm text-[gray-600]">Total Users</p>
          <p className="text-3xl font-bold text-[black]">{stats.total}</p>
        </div>
        <div className="rounded-3xl border border-[gray-200] bg-white p-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.1)]">
          <p className="text-sm text-[gray-600]">Students</p>
          <p className="text-3xl font-bold text-[gray-700]">{stats.students}</p>
        </div>
        <div className="rounded-3xl border border-[gray-200] bg-white p-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.1)]">
          <p className="text-sm text-[gray-600]">Teachers</p>
          <p className="text-3xl font-bold text-[black]">{stats.teachers}</p>
        </div>
        <div className="rounded-3xl border border-[gray-200] bg-white p-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.1)]">
          <p className="text-sm text-[gray-600]">Admins</p>
          <p className="text-3xl font-bold text-[gray-800]">{stats.admins}</p>
        </div>
        <div className="rounded-3xl border border-[gray-200] bg-white p-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.1)]">
          <p className="text-sm text-[gray-600]">Active</p>
          <p className="text-3xl font-bold text-[gray-300]">{stats.active}</p>
        </div>
      </div>

      {/* Add Admin Form */}
      {showAddAdmin && (
        <div className="mb-6 rounded-3xl border border-[gray-200] bg-white p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.15)]">
          <h3 className="text-lg font-semibold text-[black] mb-4">Add New Administrator</h3>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[gray-700] mb-1">Full Name</label>
              <input
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="w-full rounded-2xl border border-[gray-200] px-4 py-3 focus:border-[gray-300] focus:outline-none focus:ring-2 focus:ring-[gray-300]/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[gray-700] mb-1">Email</label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full rounded-2xl border border-[gray-200] px-4 py-3 focus:border-[gray-300] focus:outline-none focus:ring-2 focus:ring-[gray-300]/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[gray-700] mb-1">Password</label>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="w-full rounded-2xl border border-[gray-200] px-4 py-3 focus:border-[gray-300] focus:outline-none focus:ring-2 focus:ring-[gray-300]/20"
                minLength={8}
                required
              />
            </div>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
            )}
            <div className="flex gap-3">
              <Button type="submit" className="bg-[black] hover:bg-[gray-800] text-white">
                Create Admin
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddAdmin(false)}
                className="bg-[gray-50] hover:bg-[gray-100] text-[black] border border-[gray-200]"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : (
        <DataTable columns={columns} data={users} />
      )}
    </DashboardShell>
  );
}
