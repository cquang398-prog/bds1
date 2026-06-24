import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { properties, buildings, appointments, landlords } from '@/lib/data/mock-data';
import { Building2, Home, CalendarDays, Users, TrendingUp, DollarSign } from 'lucide-react';

const statusLabels: Record<string, string> = {
  available: 'Còn trống',
  rented: 'Đã cho thuê',
  sold: 'Đã bán',
  pending: 'Đang chờ',
};

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

export default function AdminDashboardPage() {
  const stats = [
    {
      title: 'Tổng BĐS',
      value: properties.length,
      icon: Home,
      change: '+12%',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Tòa nhà',
      value: buildings.length,
      icon: Building2,
      change: '+5%',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Lịch hẹn',
      value: appointments.length,
      icon: CalendarDays,
      change: '+8%',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Chủ nhà',
      value: landlords.length,
      icon: Users,
      change: '+3%',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const recentAppointments = appointments.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan</h1>
        <p className="text-slate-500">Tổng quan hoạt động bất động sản của bạn</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">{stat.change}</span>
                  <span className="text-slate-400">so với tháng trước</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lịch hẹn gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-slate-800">{apt.customerName}</p>
                    <p className="text-sm text-slate-500">{apt.propertyTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{apt.date}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${statusColors[apt.status]}`}>
                      {statusLabelsApt[apt.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tình trạng BĐS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['available', 'rented', 'sold', 'pending'].map((status) => {
                const count = properties.filter((p) => p.status === status).length;
                const percentage = (count / properties.length) * 100;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{statusLabels[status]}</span>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tổng quan doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Tổng doanh thu tháng</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {properties.reduce((sum, p) => sum + p.price, 0).toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Home className="h-4 w-4" />
                <span className="text-sm">BĐS còn trống</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {properties.filter((p) => p.status === 'available').length}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Chủ nhà đang hoạt động</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {landlords.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
