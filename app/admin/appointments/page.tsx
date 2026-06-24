'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { appointments, areas } from '@/lib/data/mock-data';
import { Eye, Phone, Search, CalendarDays, ImagePlus } from 'lucide-react';

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
  const [aptList, setAptList] = useState(appointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [viewItem, setViewItem] = useState<any>(null);
  const [contactItem, setContactItem] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  const filtered = aptList.filter((a) => {
    const matchesSearch = a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.customerPhone.includes(searchQuery);
    const matchesDate = !filterDate || a.date === filterDate;
    const matchesArea = !filterArea || a.area === filterArea;
    return matchesSearch && matchesDate && matchesArea;
  });

  const openView = (item: any) => { setViewItem(item); setIsViewOpen(true); };
  const openContact = (item: any) => { setContactItem(item); setIsContactOpen(true); };

  const handleUploadEvidence = (id: string) => {
    setAptList((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, evidenceImages: [...a.evidenceImages, 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'] }
          : a
      )
    );
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

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Tìm theo tên khách hàng hoặc SĐT..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-40" />
            <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Tất cả khu vực</option>
              {areas.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent>
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
                      <div className="font-medium text-slate-800">{item.customerName}</div>
                      <div className="text-xs text-slate-500">{item.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.propertyTitle}</td>
                    <td className="px-4 py-3 text-slate-600">{item.date}</td>
                    <td className="px-4 py-3 text-slate-600">{item.time}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{item.area}</Badge></td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${statusColors[item.status]}`}>
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openView(item)} title="Xem chi tiết"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openContact(item)} title="Liên hệ khách"><Phone className="h-4 w-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleUploadEvidence(item.id)} title="Tải ảnh chứng từ"><ImagePlus className="h-4 w-4 text-green-600" /></Button>
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
                <div><span className="text-slate-500">Khách hàng:</span> <span className="font-medium">{viewItem.customerName}</span></div>
                <div><span className="text-slate-500">SĐT:</span> {viewItem.customerPhone}</div>
                <div><span className="text-slate-500">Email:</span> {viewItem.customerEmail}</div>
                <div><span className="text-slate-500">BĐS:</span> {viewItem.propertyTitle}</div>
                <div><span className="text-slate-500">Ngày:</span> {viewItem.date}</div>
                <div><span className="text-slate-500">Giờ:</span> {viewItem.time}</div>
                <div><span className="text-slate-500">Khu vực:</span> <Badge variant="outline">{viewItem.area}</Badge></div>
                <div><span className="text-slate-500">Trạng thái:</span> <span className={`inline-block px-2 py-0.5 rounded text-xs ${statusColors[viewItem.status]}`}>{statusLabels[viewItem.status]}</span></div>
              </div>
              <div className="text-sm"><span className="text-slate-500">Ghi chú:</span> {viewItem.notes}</div>
              {viewItem.evidenceImages.length > 0 && (
                <div>
                  <span className="text-slate-500 text-sm">Ảnh chứng từ:</span>
                  <div className="flex gap-2 mt-2">
                    {viewItem.evidenceImages.map((img: string, idx: number) => (
                      <img key={idx} src={img} alt="Chứng từ" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}
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
                <div><span className="text-slate-500">Tên:</span> <span className="font-medium">{contactItem.customerName}</span></div>
                <div><span className="text-slate-500">SĐT:</span> {contactItem.customerPhone}</div>
                <div><span className="text-slate-500">Email:</span> {contactItem.customerEmail}</div>
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
