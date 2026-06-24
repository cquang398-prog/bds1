'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CreditCard, Plus, Edit, Calendar, Building2 } from 'lucide-react';
import { companies } from '@/lib/data/mock-data';

interface Subscription {
  id: string;
  companyId: string;
  companyName: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  seats: number;
  pricePerMonth: number;
  startsAt: string;
  endsAt: string | null;
}

const initialSubs: Subscription[] = companies.map((c, i) => ({
  id: `sub-${c.id}`,
  companyId: c.id,
  companyName: c.name,
  plan: c.plan,
  status: c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'cancelled',
  seats: c.plan === 'enterprise' ? 50 : c.plan === 'professional' ? 20 : 5,
  pricePerMonth: c.plan === 'enterprise' ? 5000000 : c.plan === 'professional' ? 2000000 : 500000,
  startsAt: c.createdAt,
  endsAt: c.status === 'trial' ? (c.trialEndsAt || null) : null,
}));

const planConfig: Record<string, { label: string; color: string }> = {
  starter:      { label: 'Starter',      color: 'bg-slate-100 text-slate-700' },
  professional: { label: 'Professional', color: 'bg-blue-100 text-blue-700' },
  enterprise:   { label: 'Enterprise',   color: 'bg-amber-100 text-amber-700' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active:    { label: 'Hoạt động', color: 'bg-green-100 text-green-700' },
  trial:     { label: 'Dùng thử',  color: 'bg-amber-100 text-amber-700' },
  expired:   { label: 'Hết hạn',   color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Đã hủy',    color: 'bg-slate-100 text-slate-600' },
};

function formatVND(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>(initialSubs);
  const [editItem, setEditItem] = useState<Subscription | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const totalMRR = subs.filter((s) => s.status === 'active').reduce((sum, s) => sum + s.pricePerMonth, 0);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!editItem) return;
    setSubs((prev) =>
      prev.map((s) =>
        s.id === editItem.id
          ? {
              ...s,
              plan: fd.get('plan') as Subscription['plan'],
              status: fd.get('status') as Subscription['status'],
              seats: Number(fd.get('seats') || s.seats),
              pricePerMonth: Number(fd.get('pricePerMonth') || s.pricePerMonth),
              endsAt: fd.get('endsAt') as string || s.endsAt,
            }
          : s
      )
    );
    setIsFormOpen(false);
    setEditItem(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gói đăng ký</h1>
        <p className="text-slate-500">Quản lý gói đăng ký của các công ty trên nền tảng</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">MRR (Doanh thu tháng)</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{formatVND(totalMRR)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Đang hoạt động</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {subs.filter((s) => s.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Đang dùng thử</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {subs.filter((s) => s.status === 'trial').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Công ty</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Gói</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-600">Seats</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Giá/tháng</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Hết hạn</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subs.map((sub) => {
                  const pc = planConfig[sub.plan];
                  const sc = statusConfig[sub.status];
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="font-medium text-slate-800">{sub.companyName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pc.color}`}>{pc.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-700">{sub.seats}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">{formatVND(sub.pricePerMonth)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {sub.endsAt ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(sub.endsAt).toLocaleDateString('vi-VN')}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => { setEditItem(sub); setIsFormOpen(true); }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa gói đăng ký — {editItem?.companyName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="plan">Gói dịch vụ</Label>
                <select id="plan" name="plan" defaultValue={editItem?.plan} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <select id="status" name="status" defaultValue={editItem?.status} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="active">Hoạt động</option>
                  <option value="trial">Dùng thử</option>
                  <option value="expired">Hết hạn</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              <div>
                <Label htmlFor="seats">Số chỗ (seats)</Label>
                <Input id="seats" name="seats" type="number" defaultValue={editItem?.seats} min={1} />
              </div>
              <div>
                <Label htmlFor="pricePerMonth">Giá/tháng (VNĐ)</Label>
                <Input id="pricePerMonth" name="pricePerMonth" type="number" defaultValue={editItem?.pricePerMonth} min={0} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="endsAt">Ngày hết hạn</Label>
                <Input id="endsAt" name="endsAt" type="date" defaultValue={editItem?.endsAt || ''} />
              </div>
            </div>
            <Button type="submit" className="w-full">Lưu thay đổi</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
