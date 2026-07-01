'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Phone, Search, CalendarDays, Loader2, AlertCircle } from 'lucide-react';
import { useAppointments } from '@/lib/hooks/useEntities';
import { useAuth } from '@/lib/auth/AuthContext';
import type { DBAppointment } from '@/lib/supabase/types';

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Đã xác nhận',
  pending: 'Chờ duyệt',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export default function AppointmentsPage() {
  const { company } = useAuth();
  const { items: aptList, loading, error, update } = useAppointments(company?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewItem, setViewItem] = useState<DBAppointment | null>(null);
  const [contactItem, setContactItem] = useState<DBAppointment | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  const filtered = aptList.filter((a) => {
    const matchesSearch = a.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.customer_phone ?? '').includes(searchQuery);
    const matchesDate = !filterDate || a.date === filterDate;
    const matchesStatus = !filterStatus || a.status === filterStatus;
    return matchesSearch && matchesDate && matchesStatus;
  });

  const openView = (item: DBAppointment) => { setViewItem(item); setIsViewOpen(true); };
  const openContact = (item: DBAppointment) => { setContactItem(item); setIsContactOpen(true); };

  const handleStatusChange = async (id: string, status: DBAppointment['status']) => {
    await update(id, { status });
  };

  const handleContactSubmit = () => {
    setIsContactOpen(false);
    setContactMessage('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Lịch hẹn</h1>
        <p className="text-slate-500">Quản lý yêu cầu đặt lịch và lịch hẹn khách hàng</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Tìm theo tên khách hàng hoặc SĐT..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-40" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer">
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Khách hàng</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Bất động sản</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Ngày</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Giờ</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Khu vực</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Trạng thái</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{item.customer_name}</div>
                        <div className="text-xs text-slate-500">{item.customer_phone}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.room_title ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{item.date}</td>
                      <td className="px-4 py-3 text-slate-600">{item.time}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{item.area ?? '—'}</Badge></td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${statusColors[item.status]}`}>
                          {statusLabels[item.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openView(item)} title="Xem chi tiết"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openContact(item)} title="Liên hệ khách"><Phone className="h-4 w-4 text-blue-600" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-8 text-slate-500">Không tìm thấy lịch hẹn</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Chi tiết lịch hẹn
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Khách hàng:</span> <span className="font-medium">{viewItem.customer_name}</span></div>
                <div><span className="text-slate-500">SĐT:</span> {viewItem.customer_phone}</div>
                <div><span className="text-slate-500">Email:</span> {viewItem.customer_email}</div>
                <div><span className="text-slate-500">BĐS:</span> {viewItem.room_title}</div>
                <div><span className="text-slate-500">Ngày:</span> {viewItem.date}</div>
                <div><span className="text-slate-500">Giờ:</span> {viewItem.time}</div>
                <div><span className="text-slate-500">Khu vực:</span> {viewItem.area ? <Badge variant="outline">{viewItem.area}</Badge> : '—'}</div>
                <div><span className="text-slate-500">Trạng thái:</span> <span className={`inline-block px-2 py-0.5 rounded text-xs ${statusColors[viewItem.status]}`}>{statusLabels[viewItem.status]}</span></div>
              </div>
              <div className="text-sm"><span className="text-slate-500">Ghi chú:</span> {viewItem.notes}</div>
              <div className="flex gap-2 pt-2">
                {(['pending', 'confirmed', 'completed', 'cancelled'] as const).filter((s) => s !== viewItem.status).map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    onClick={() => { handleStatusChange(viewItem.id, s); setIsViewOpen(false); }}
                  >
                    {statusLabels[s]}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Liên hệ khách hàng
            </DialogTitle>
          </DialogHeader>
          {contactItem && (
            <div className="space-y-4 pt-4">
              <div className="p-4 bg-slate-50 rounded-lg text-sm space-y-2">
                <div><span className="text-slate-500">Tên:</span> <span className="font-medium">{contactItem.customer_name}</span></div>
                <div><span className="text-slate-500">SĐT:</span> {contactItem.customer_phone}</div>
                <div><span className="text-slate-500">Email:</span> {contactItem.customer_email}</div>
              </div>
              <div>
                <Label htmlFor="contact-msg">Tin nhắn</Label>
                <Textarea
                  id="contact-msg"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Nhập tin nhắn cho khách hàng..."
                  rows={4}
                />
              </div>
              <Button className="w-full" onClick={handleContactSubmit}>Gửi tin nhắn</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
