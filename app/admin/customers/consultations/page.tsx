'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Plus, Search, MessageSquare, Phone, Mail, Building2,
  Edit, Trash2, Eye, User,
} from 'lucide-react';
import { consultations as initialConsultations, employees } from '@/lib/data/mock-data';
import { Consultation } from '@/types';

const statusConfig: Record<Consultation['status'], { label: string; color: string }> = {
  new:         { label: 'Mới',           color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'Đang xử lý',   color: 'bg-yellow-100 text-yellow-700' },
  resolved:    { label: 'Đã giải quyết', color: 'bg-green-100 text-green-700' },
  closed:      { label: 'Đã đóng',       color: 'bg-slate-100 text-slate-600' },
};

const sourceLabels: Record<Consultation['source'], string> = {
  website:  'Website',
  phone:    'Điện thoại',
  email:    'Email',
  walk_in:  'Trực tiếp',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function ConsultationsPage() {
  const [list, setList] = useState<Consultation[]>(initialConsultations);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewItem, setViewItem] = useState<Consultation | null>(null);
  const [editItem, setEditItem] = useState<Consultation | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filtered = list.filter((c) => {
    const matchSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: string) => setList((prev) => prev.filter((c) => c.id !== id));

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const item: Consultation = {
      id: editItem?.id || Date.now().toString(),
      fullName: fd.get('fullName') as string,
      phone: fd.get('phone') as string,
      email: fd.get('email') as string,
      message: fd.get('message') as string,
      status: fd.get('status') as Consultation['status'],
      source: fd.get('source') as Consultation['source'],
      assignedTo: fd.get('assignedTo') as string,
      assignedToName: employees.find((emp) => emp.id === fd.get('assignedTo'))?.name || '',
      createdAt: editItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setList((prev) => editItem ? prev.map((c) => c.id === editItem.id ? item : c) : [...prev, item]);
    setIsFormOpen(false);
    setEditItem(null);
  };

  const openAdd = () => { setEditItem(null); setIsFormOpen(true); };
  const openEdit = (item: Consultation) => { setEditItem(item); setIsFormOpen(true); };
  const openView = (item: Consultation) => { setViewItem(item); setIsViewOpen(true); };

  const counts = Object.keys(statusConfig).reduce((acc, s) => {
    acc[s] = list.filter((c) => c.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Yêu cầu tư vấn</h1>
          <p className="text-slate-500">Quản lý các yêu cầu tư vấn từ khách hàng</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm yêu cầu
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Tất cả ({list.length})
        </button>
        {(Object.keys(statusConfig) as Consultation['status'][]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {statusConfig[s].label} ({counts[s] || 0})
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên, SĐT hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Khách hàng</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Yêu cầu</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Phụ trách</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Nguồn</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Ngày tạo</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((item) => {
                  const sc = statusConfig[item.status];
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={(e) => { if ((e.target as HTMLElement).closest('button')) return; openView(item); }}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{item.fullName}</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Phone className="h-3 w-3" />{item.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-slate-600 truncate text-xs">{item.message}</p>
                        {item.propertyTitle && (
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3 w-3" />{item.propertyTitle}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{item.assignedToName || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{sourceLabels[item.source]}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openView(item); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(item); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>Không tìm thấy yêu cầu tư vấn</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chi tiết yêu cầu tư vấn
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg text-sm">
                <div className="flex items-center gap-2 text-slate-600"><User className="h-4 w-4 text-slate-400" />{viewItem.fullName}</div>
                <div className="flex items-center gap-2 text-slate-600"><Phone className="h-4 w-4 text-slate-400" />{viewItem.phone}</div>
                <div className="flex items-center gap-2 text-slate-600 col-span-2"><Mail className="h-4 w-4 text-slate-400" />{viewItem.email}</div>
                {viewItem.propertyTitle && (
                  <div className="flex items-center gap-2 text-slate-600 col-span-2"><Building2 className="h-4 w-4 text-slate-400" />{viewItem.propertyTitle}</div>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Nội dung yêu cầu</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{viewItem.message}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Trạng thái</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${statusConfig[viewItem.status].color}`}>
                    {statusConfig[viewItem.status].label}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Phụ trách</p>
                  <p className="font-medium text-slate-700 mt-1">{viewItem.assignedToName || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Nguồn</p>
                  <p className="font-medium text-slate-700 mt-1">{sourceLabels[viewItem.source]}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm'} yêu cầu tư vấn</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input id="fullName" name="fullName" defaultValue={editItem?.fullName} required />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" name="phone" defaultValue={editItem?.phone} required />
              </div>
              <div className="col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editItem?.email} />
              </div>
              <div>
                <Label htmlFor="source">Nguồn</Label>
                <select id="source" name="source" defaultValue={editItem?.source || 'website'} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {(Object.keys(sourceLabels) as Consultation['source'][]).map((s) => (
                    <option key={s} value={s}>{sourceLabels[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <select id="status" name="status" defaultValue={editItem?.status || 'new'} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {(Object.keys(statusConfig) as Consultation['status'][]).map((s) => (
                    <option key={s} value={s}>{statusConfig[s].label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="assignedTo">Phụ trách</Label>
                <select id="assignedTo" name="assignedTo" defaultValue={editItem?.assignedTo || ''} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.filter((emp) => emp.status === 'active').map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="message">Nội dung yêu cầu</Label>
                <textarea
                  id="message"
                  name="message"
                  defaultValue={editItem?.message}
                  required
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">Lưu</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
