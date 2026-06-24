import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  properties, buildings, appointments, landlords,
  leads, consultations, kpis, notifications,
} from '@/lib/data/mock-data';
import {
  Building2, Home, CalendarDays, Users, TrendingUp, DollarSign,
  UserSearch, MessageSquare, Bell, Target,
} from 'lucide-react';
import Link from 'next/link';

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

const leadStatusColors: Record<string, string> = {
  new:         'bg-slate-100 text-slate-700',
  contacted:   'bg-blue-100 text-blue-700',
  qualified:   'bg-teal-100 text-teal-700',
  negotiating: 'bg-yellow-100 text-yellow-700',
  won:         'bg-green-100 text-green-700',
  lost:        'bg-red-100 text-red-700',
};

const leadStatusLabels: Record<string, string> = {
  new: 'Mới', contacted: 'Đã liên hệ', qualified: 'Đủ điều kiện',
  negotiating: 'Đàm phán', won: 'Thành công', lost: 'Thất bại',
};

const propertyStatusLabels: Record<string, string> = {
  available: 'Còn trống',
  rented: 'Đã cho thuê',
  sold: 'Đã bán',
  pending: 'Đang chờ',
};

export default function AdminDashboardPage() {
  const currentMonthKpis = kpis.filter((k) => k.period === '2024-01');
  const totalRevenue = currentMonthKpis.reduce((s, k) => s + k.revenueGenerated, 0);
  const newLeads = leads.filter((l) => l.status === 'new' || l.status === 'contacted').length;
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const stats = [
    {
      title: 'Tổng BĐS',
      value: properties.length,
      icon: Home,
      change: '+12%',
      color: 'bg-blue-50 text-blue-600',
      href: '/admin/real-estate/rooms',
    },
    {
      title: 'Tòa nhà',
      value: buildings.length,
      icon: Building2,
      change: '+5%',
      color: 'bg-green-50 text-green-600',
      href: '/admin/real-estate/buildings',
    },
    {
      title: 'Leads đang xử lý',
      value: newLeads,
      icon: UserSearch,
      change: '+18%',
      color: 'bg-teal-50 text-teal-600',
      href: '/admin/customers/leads',
    },
    {
      title: 'Lịch hẹn',
      value: appointments.length,
      icon: CalendarDays,
      change: '+8%',
      color: 'bg-orange-50 text-orange-600',
      href: '/admin/customers/appointments',
    },
    {
      title: 'Tư vấn mới',
      value: consultations.filter((c) => c.status === 'new').length,
      icon: MessageSquare,
      change: '+3%',
      color: 'bg-purple-50 text-purple-600',
      href: '/admin/customers/consultations',
    },
    {
      title: 'Thông báo chưa đọc',
      value: unreadNotifs,
      icon: Bell,
      change: '',
      color: 'bg-red-50 text-red-600',
      href: '/admin/system/notifications',
    },
    {
      title: 'Chủ nhà',
      value: landlords.length,
      icon: Users,
      change: '+3%',
      color: 'bg-slate-50 text-slate-600',
      href: '/admin/landlords',
    },
    {
      title: 'Doanh thu tháng',
      value: (totalRevenue / 1_000_000).toFixed(0) + 'M',
      icon: DollarSign,
      change: '+15%',
      color: 'bg-emerald-50 text-emerald-600',
      href: '/admin/hr/kpi',
    },
  ];

  const recentLeads = leads.slice(0, 4);
  const recentAppointments = appointments.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan</h1>
        <p className="text-slate-500">Tổng quan hoạt động kinh doanh bất động sản</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => {
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
                  {stat.change && (
                    <div className="flex items-center gap-1 mt-3 text-xs">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600 font-medium">{stat.change}</span>
                      <span className="text-slate-400">so với tháng trước</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Leads gần đây</CardTitle>
              <Link href="/admin/customers/leads" className="text-xs text-blue-600 hover:underline">Xem tất cả</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{lead.fullName}</p>
                    <p className="text-xs text-slate-400">{lead.preferredRoomType} · {lead.preferredArea}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${leadStatusColors[lead.status]}`}>
                      {leadStatusLabels[lead.status]}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">{lead.assignedToName}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Lịch hẹn gần đây</CardTitle>
              <Link href="/admin/customers/appointments" className="text-xs text-blue-600 hover:underline">Xem tất cả</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{apt.customerName}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{apt.propertyTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{apt.date} {apt.time}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs mt-0.5 ${statusColors[apt.status]}`}>
                      {statusLabelsApt[apt.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tình trạng BĐS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['available', 'rented', 'sold', 'pending'].map((status) => {
                const count = properties.filter((p) => p.status === status).length;
                const percentage = properties.length ? (count / properties.length) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{propertyStatusLabels[status]}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          status === 'available' ? 'bg-green-500' :
                          status === 'rented' ? 'bg-blue-500' :
                          status === 'sold' ? 'bg-slate-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* KPI Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">KPI Tháng 01/2024</CardTitle>
              <Link href="/admin/hr/kpi" className="text-xs text-blue-600 hover:underline">Chi tiết</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentMonthKpis.map((kpi) => {
                const rate = kpi.targetRevenue ? Math.round((kpi.revenueGenerated / kpi.targetRevenue) * 100) : 0;
                return (
                  <div key={kpi.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700 font-medium truncate">{kpi.employeeName}</span>
                        <span className="text-slate-500 text-xs ml-2 flex-shrink-0">{rate}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${rate >= 100 ? 'bg-green-500' : rate >= 80 ? 'bg-blue-500' : 'bg-red-400'}`}
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${
                        kpi.score >= 90 ? 'bg-green-100 text-green-700' :
                        kpi.score >= 70 ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {kpi.score}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
