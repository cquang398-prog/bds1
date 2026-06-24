'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, Minus, Search, ChevronUp } from 'lucide-react';
import { kpis as initialKpis, employees } from '@/lib/data/mock-data';
import { KPI } from '@/types';

const statusConfig: Record<KPI['status'], { label: string; color: string; icon: React.ElementType }> = {
  exceeded:  { label: 'Vượt chỉ tiêu', color: 'bg-green-100 text-green-700',  icon: TrendingUp },
  on_track:  { label: 'Đúng tiến độ',  color: 'bg-blue-100 text-blue-700',    icon: Minus },
  behind:    { label: 'Chậm tiến độ',  color: 'bg-red-100 text-red-700',      icon: TrendingDown },
};

const periods = ['2024-01', '2023-12', '2023-11'];

function formatVND(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + ' triệu';
  return n.toLocaleString('vi-VN') + 'đ';
}

export default function KpiPage() {
  const [kpiList, setKpiList] = useState<KPI[]>(initialKpis);
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewItem, setViewItem] = useState<KPI | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<KPI | null>(null);

  const filtered = kpiList.filter((k) => {
    const matchPeriod = k.period === selectedPeriod;
    const matchSearch = k.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchPeriod && matchSearch;
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const emp = employees.find((emp) => emp.id === fd.get('employeeId'));
    const revenue = Number(fd.get('revenueGenerated') || 0);
    const target = Number(fd.get('targetRevenue') || 0);
    const score = Number(fd.get('score') || 0);
    let status: KPI['status'] = 'on_track';
    if (score >= 90 || revenue > target) status = 'exceeded';
    else if (score < 70 || revenue < target * 0.8) status = 'behind';

    const item: KPI = {
      id: editItem?.id || Date.now().toString(),
      employeeId: fd.get('employeeId') as string,
      employeeName: emp?.name || '',
      period: fd.get('period') as string,
      leadsAssigned: Number(fd.get('leadsAssigned') || 0),
      leadsConverted: Number(fd.get('leadsConverted') || 0),
      appointmentsCompleted: Number(fd.get('appointmentsCompleted') || 0),
      contractsSigned: Number(fd.get('contractsSigned') || 0),
      revenueGenerated: revenue,
      targetRevenue: target,
      score,
      status,
    };
    setKpiList((prev) => editItem ? prev.map((k) => k.id === editItem.id ? item : k) : [...prev, item]);
    setIsFormOpen(false);
    setEditItem(null);
  };

  const openAdd = () => { setEditItem(null); setIsFormOpen(true); };
  const openEdit = (item: KPI) => { setEditItem(item); setIsFormOpen(true); };
  const openView = (item: KPI) => { setViewItem(item); setIsViewOpen(true); };

  const avgScore = filtered.length ? Math.round(filtered.reduce((s, k) => s + k.score, 0) / filtered.length) : 0;
  const totalRevenue = filtered.reduce((s, k) => s + k.revenueGenerated, 0);
  const totalTarget = filtered.reduce((s, k) => s + k.targetRevenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">KPI Nhân viên</h1>
          <p className="text-slate-500">Theo dõi và đánh giá hiệu suất kinh doanh</p>
        </div>
        <Button onClick={openAdd}>
          Thêm đánh giá KPI
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Điểm TB ({selectedPeriod})</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{avgScore}<span className="text-base text-slate-400 font-normal">/100</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Doanh thu thực tế</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{formatVND(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Đạt / Mục tiêu</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">
              {totalTarget ? Math.round((totalRevenue / totalTarget) * 100) : 0}<span className="text-base text-slate-400 font-normal">%</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedPeriod === p ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm nhân viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-48"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Nhân viên</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-600">Leads</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-600">Chuyển đổi</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-600">Lịch hẹn</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-600">Hợp đồng</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Doanh thu</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-600">Điểm</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-600">Đánh giá</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((item) => {
                  const sc = statusConfig[item.status];
                  const StatusIcon = sc.icon;
                  const revenueRate = item.targetRevenue ? Math.round((item.revenueGenerated / item.targetRevenue) * 100) : 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={(e) => { if ((e.target as HTMLElement).closest('button')) return; openView(item); }}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">{item.employeeName}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{item.leadsAssigned}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-slate-700 font-medium">{item.leadsConverted}</span>
                        <span className="text-xs text-slate-400 ml-1">
                          ({item.leadsAssigned ? Math.round((item.leadsConverted / item.leadsAssigned) * 100) : 0}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">{item.appointmentsCompleted}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{item.contractsSigned}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-slate-800 font-medium">{formatVND(item.revenueGenerated)}</div>
                        <div className={`text-xs ${revenueRate >= 100 ? 'text-green-600' : 'text-slate-400'}`}>
                          {revenueRate}% mục tiêu
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-800 font-bold text-sm">
                          {item.score}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                          <StatusIcon className="h-3 w-3" />{sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>Sửa</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>Không có dữ liệu KPI cho kỳ này</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết KPI — {viewItem?.employeeName}</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-2">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-4xl font-bold text-slate-800">{viewItem.score}</div>
                <div className="text-sm text-slate-400 mt-0.5">Điểm / 100</div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${statusConfig[viewItem.status].color}`}>
                  {statusConfig[viewItem.status].label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-400">Leads phân công</p>
                  <p className="text-xl font-bold text-slate-800">{viewItem.leadsAssigned}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-400">Leads chuyển đổi</p>
                  <p className="text-xl font-bold text-green-700">{viewItem.leadsConverted}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-400">Lịch hẹn hoàn thành</p>
                  <p className="text-xl font-bold text-slate-800">{viewItem.appointmentsCompleted}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-400">Hợp đồng ký</p>
                  <p className="text-xl font-bold text-blue-700">{viewItem.contractsSigned}</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Doanh thu</span>
                  <span className="font-medium">{formatVND(viewItem.revenueGenerated)} / {formatVND(viewItem.targetRevenue)}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${viewItem.revenueGenerated >= viewItem.targetRevenue ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((viewItem.revenueGenerated / viewItem.targetRevenue) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {Math.round((viewItem.revenueGenerated / viewItem.targetRevenue) * 100)}% so với mục tiêu
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm'} đánh giá KPI</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Nhân viên</label>
                <select name="employeeId" defaultValue={editItem?.employeeId || ''} required className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.filter((e) => e.status === 'active').map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Kỳ (YYYY-MM)</label>
                <Input name="period" defaultValue={editItem?.period || selectedPeriod} required pattern="\d{4}-\d{2}" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Leads phân công</label>
                <Input name="leadsAssigned" type="number" defaultValue={editItem?.leadsAssigned} min={0} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Leads chuyển đổi</label>
                <Input name="leadsConverted" type="number" defaultValue={editItem?.leadsConverted} min={0} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Lịch hẹn hoàn thành</label>
                <Input name="appointmentsCompleted" type="number" defaultValue={editItem?.appointmentsCompleted} min={0} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Hợp đồng ký</label>
                <Input name="contractsSigned" type="number" defaultValue={editItem?.contractsSigned} min={0} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Doanh thu thực (đ)</label>
                <Input name="revenueGenerated" type="number" defaultValue={editItem?.revenueGenerated} min={0} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Mục tiêu (đ)</label>
                <Input name="targetRevenue" type="number" defaultValue={editItem?.targetRevenue} min={0} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 block mb-1">Điểm (0–100)</label>
                <Input name="score" type="number" defaultValue={editItem?.score} min={0} max={100} required />
              </div>
            </div>
            <Button type="submit" className="w-full">Lưu</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
