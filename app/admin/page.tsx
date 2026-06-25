'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2, Home, CalendarDays, Users, TrendingUp, DollarSign,
  UserSearch, MessageSquare, Bell, AlertCircle, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDashboardStats } from '@/lib/supabase/repositories/dashboard';

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabelsApt: Record<string, string> = {
  confirmed: 'Đã xác nhận',
  pending: 'Chờ duyệt',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const roomStatusLabels: Record<string, string> = {
  available: 'Còn trống',
  rented: 'Đã cho thuê',
  maintenance: 'Bảo trì',
  reserved: 'Đang giữ',
};

type Stats = Awaited<ReturnType<typeof getDashboardStats>>;

export default function AdminDashboardPage() {
  const { company } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!company?.id) return;
    setLoading(true);
    getDashboardStats(company.id)
      .then((data) => { setStats(data); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [company?.id]);

  const statCards = stats ? [
    { title: 'Tổng phòng', value: stats.totalRooms, icon: Home, color: 'bg-blue-50 text-blue-600', href: '/admin/real-estate/rooms' },
    { title: 'Tòa nhà', value: stats.totalBuildings, icon: Building2, color: 'bg-green-50 text-green-600', href: '/admin/real-estate/buildings' },
    { title: 'Leads đang xử lý', value: stats.newLeads, icon: UserSearch, color: 'bg-teal-50 text-teal-600', href: '/admin/customers/leads' },
    { title: 'Lịch hẹn', value: stats.recentAppointments.length, icon: CalendarDays, color: 'bg-orange-50 text-orange-600', href: '/admin/customers/appointments' },
    { title: 'Tư vấn mới', value: stats.newConsultations, icon: MessageSquare, color: 'bg-purple-50 text-purple-600', href: '/admin/customers/consultations' },
    { title: 'Thông báo chưa đọc', value: stats.unreadNotifications, icon: Bell, color: 'bg-red-50 text-red-600', href: '/admin/system/notifications' },
    { title: 'Chủ nhà', value: stats.totalLeads, icon: Users, color: 'bg-slate-50 text-slate-600', href: '/admin/landlords' },
    { title: 'Phòng trống', value: stats.availableRooms, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', href: '/admin/real-estate/rooms' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan</h1>
        <p className="text-slate-500">Tổng quan hoạt động kinh doanh bất động sản</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">{stat.title}</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-2.5 rounded-lg ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Lịch hẹn gần đây</CardTitle>
                <Link href="/admin/customers/appointments" className="text-xs text-blue-600 hover:underline">Xem tất cả</Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats.recentAppointments.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">Chưa có lịch hẹn nào</div>
              ) : (
                <div className="space-y-3">
                  {stats.recentAppointments.map((apt: any) => (
                    <div key={apt.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{apt.customer_name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{apt.room_title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{apt.date} {apt.time}</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs mt-0.5 ${statusColors[apt.status] ?? ''}`}>
                          {statusLabelsApt[apt.status] ?? apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tình trạng phòng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { status: 'available', count: stats.availableRooms, color: 'bg-green-500' },
                  { status: 'rented', count: stats.rentedRooms, color: 'bg-blue-500' },
                  { status: 'maintenance', count: stats.totalRooms - stats.availableRooms - stats.rentedRooms < 0 ? 0 : stats.totalRooms - stats.availableRooms - stats.rentedRooms, color: 'bg-yellow-500' },
                ].map(({ status, count, color }) => {
                  const percentage = stats.totalRooms ? (count / stats.totalRooms) * 100 : 0;
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{roomStatusLabels[status]}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                <span className="text-slate-500">Tổng số phòng</span>
                <span className="font-bold text-slate-800">{stats.totalRooms}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
