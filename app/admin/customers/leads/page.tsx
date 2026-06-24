'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Plus, Search, UserSearch, Phone, Mail, MapPin,
  Clock, Edit, Trash2, User, Calendar,
  MessageCircle, PhoneCall, ArrowRightLeft, Video, MessageSquare,
} from 'lucide-react';
import { leads as initialLeads, employees } from '@/lib/data/mock-data';
import { Lead } from '@/types';

// ─── New RealHome Business statuses ──────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string }> = {
  new:         { label: 'Mới',          color: 'bg-slate-100 text-slate-700' },
  consulting:  { label: 'Đang tư vấn',  color: 'bg-blue-100 text-blue-700' },
  appointment: { label: 'Hẹn xem',      color: 'bg-purple-100 text-purple-700' },
  viewed:      { label: 'Đã xem',       color: 'bg-teal-100 text-teal-700' },
  deposited:   { label: 'Đã cọc',       color: 'bg-orange-100 text-orange-700' },
  rented:      { label: 'Đã thuê',      color: 'bg-green-100 text-green-700' },
  cancelled:   { label: 'Đã hủy',       color: 'bg-red-100 text-red-700' },
  contacted:   { label: 'Đã liên hệ',   color: 'bg-cyan-100 text-cyan-700' },
  won:         { label: 'Thành công',   color: 'bg-emerald-100 text-emerald-700' },
  lost:        { label: 'Thất bại',     color: 'bg-rose-100 text-rose-700' },
};

// ─── New RealHome Business sources ───────────────────────────────────────────
const sourceConfig: Record<string, string> = {
  website:   'Website',
  facebook:  'Facebook',
  tiktok:    'TikTok',
  zalo:      'Zalo',
  chotot:    'Chợ Tốt',
  referral:  'Giới thiệu',
  cold_call: 'Gọi lạnh',
  walk_in:   'Trực tiếp',
  social:    'Mạng xã hội',
  other:     'Khác',
};

// ─── Activity types ───────────────────────────────────────────────────────────
interface LeadActivity {
  id: string;
  leadId: string;
  type: 'call' | 'meeting' | 'zalo' | 'email' | 'note' | 'status_change';
  content: string;
  oldStatus?: string;
  newStatus?: string;
  createdByName: string;
  createdAt: string;
}

const activityTypeConfig: Record<LeadActivity['type'], { label: string; icon: React.ElementType; color: string }> = {
  call:          { label: 'Cuộc gọi',       icon: PhoneCall,     color: 'bg-blue-100 text-blue-600' },
  meeting:       { label: 'Gặp mặt',        icon: Calendar,      color: 'bg-green-100 text-green-600' },
  zalo:          { label: 'Zalo',           icon: MessageSquare, color: 'bg-teal-100 text-teal-600' },
  email:         { label: 'Email',          icon: Mail,          color: 'bg-purple-100 text-purple-600' },
  note:          { label: 'Ghi chú',        icon: MessageCircle, color: 'bg-slate-100 text-slate-600' },
  status_change: { label: 'Đổi trạng thái', icon: ArrowRightLeft, color: 'bg-amber-100 text-amber-600' },
};

const mockActivities: LeadActivity[] = [
  {
    id: 'la1', leadId: 'ld1', type: 'call',
    content: 'Gọi điện giới thiệu căn hộ The Metropolitan. Khách hàng quan tâm.',
    createdByName: 'Nguyễn Thị Hồng', createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'la2', leadId: 'ld1', type: 'status_change',
    content: 'Chuyển trạng thái từ "Mới" sang "Đang tư vấn"',
    oldStatus: 'new', newStatus: 'consulting',
    createdByName: 'Nguyễn Thị Hồng', createdAt: '2024-01-12T10:30:00Z',
  },
  {
    id: 'la3', leadId: 'ld1', type: 'meeting',
    content: 'Dẫn khách xem căn hộ P-101. Khách rất thích view thành phố.',
    createdByName: 'Nguyễn Thị Hồng', createdAt: '2024-01-18T14:30:00Z',
  },
  {
    id: 'la4', leadId: 'ld2', type: 'zalo',
    content: 'Gửi ảnh và thông tin Penthouse Skyline Tower qua Zalo.',
    createdByName: 'Vũ Thị Thanh', createdAt: '2024-01-09T09:00:00Z',
  },
  {
    id: 'la5', leadId: 'ld2', type: 'call',
    content: 'Trao đổi chi tiết về hợp đồng và quản lý tòa nhà.',
    createdByName: 'Vũ Thị Thanh', createdAt: '2024-01-15T14:00:00Z',
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const statusOrder = ['new', 'consulting', 'appointment', 'viewed', 'deposited', 'rented', 'cancelled', 'contacted', 'won', 'lost'];

export default function LeadsPage() {
  const [leadList, setLeadList] = useState<Lead[]>(initialLeads);
  const [activities, setActivities] = useState<LeadActivity[]>(mockActivities);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Lead | null>(null);
  const [newActivityContent, setNewActivityContent] = useState('');
  const [newActivityType, setNewActivityType] = useState<LeadActivity['type']>('call');
  const [newStatus, setNewStatus] = useState('');

  const filtered = leadList.filter((l) => {
    const matchSearch =
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: string) => setLeadList((prev) => prev.filter((l) => l.id !== id));

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const item = {
      ...(editItem || {}),
      id: editItem?.id || Date.now().toString(),
      fullName: fd.get('fullName') as string,
      phone: fd.get('phone') as string,
      email: fd.get('email') as string,
      source: fd.get('source') as Lead['source'],
      status: fd.get('status') as Lead['status'],
      interest: fd.get('interest') as string,
      budget: Number(fd.get('budget') || 0),
      preferredArea: fd.get('preferredArea') as string,
      preferredRoomType: fd.get('preferredRoomType') as string,
      assignedTo: fd.get('assignedTo') as string,
      assignedToName: employees.find((emp) => emp.id === fd.get('assignedTo'))?.name || '',
      notes: fd.get('notes') as string,
      createdAt: editItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Lead;
    setLeadList((prev) => editItem ? prev.map((l) => l.id === editItem.id ? item : l) : [...prev, item]);
    setIsFormOpen(false);
    setEditItem(null);
  };

  const addActivity = () => {
    if (!selectedLead || !newActivityContent.trim()) return;
    const entry: LeadActivity = {
      id: Date.now().toString(),
      leadId: selectedLead.id,
      type: newActivityType,
      content: newActivityContent,
      createdByName: 'Admin',
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [entry, ...prev]);
    setNewActivityContent('');
  };

  const changeLeadStatus = () => {
    if (!selectedLead || !newStatus || newStatus === selectedLead.status) return;
    const entry: LeadActivity = {
      id: Date.now().toString(),
      leadId: selectedLead.id,
      type: 'status_change',
      content: `Chuyển trạng thái từ "${statusConfig[selectedLead.status]?.label}" sang "${statusConfig[newStatus]?.label}"`,
      oldStatus: selectedLead.status,
      newStatus,
      createdByName: 'Admin',
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [entry, ...prev]);
    setLeadList((prev) =>
      prev.map((l) => l.id === selectedLead.id ? { ...l, status: newStatus as Lead['status'] } : l)
    );
    setSelectedLead((prev) => prev ? { ...prev, status: newStatus as Lead['status'] } : null);
    setNewStatus('');
  };

  const leadActivities = activities.filter((a) => a.leadId === selectedLead?.id);

  const counts = Object.keys(statusConfig).reduce((acc, s) => {
    acc[s] = leadList.filter((l) => l.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Khách hàng tiềm năng</h1>
          <p className="text-slate-500">Quản lý và theo dõi leads bán hàng</p>
        </div>
        <Button onClick={() => { setEditItem(null); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm lead
        </Button>
      </div>

      {/* Status pipeline */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Tất cả ({leadList.length})
        </button>
        {statusOrder.filter((s) => counts[s] > 0 || s === 'new').map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {statusConfig[s]?.label} ({counts[s] || 0})
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
            <table className="w-full text-sm min-w-[750px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Khách hàng</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Quan tâm</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Phân công</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Nguồn</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Ngân sách</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((item) => {
                  const sc = statusConfig[item.status] || statusConfig['new'];
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button')) return;
                        setSelectedLead(item);
                        setIsDetailOpen(true);
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{item.fullName}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <Phone className="h-3 w-3" />{item.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="text-sm">{item.preferredRoomType || '—'}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />{item.preferredArea || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{item.assignedToName || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500">{sourceConfig[item.source] || item.source}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700 font-medium">
                        {item.budget.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditItem(item); setIsFormOpen(true); }}><Edit className="h-4 w-4" /></Button>
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
                <UserSearch className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>Không tìm thấy lead nào</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail / Timeline Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserSearch className="h-5 w-5" />
              {selectedLead?.fullName}
            </DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-5 pt-2">
              {/* Info */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg text-sm">
                <div className="flex items-center gap-2 text-slate-600"><Phone className="h-4 w-4 text-slate-400" />{selectedLead.phone}</div>
                <div className="flex items-center gap-2 text-slate-600"><Mail className="h-4 w-4 text-slate-400" />{selectedLead.email || '—'}</div>
                <div className="col-span-2 flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400 text-xs">Trạng thái hiện tại:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(statusConfig[selectedLead.status] || statusConfig.new).color}`}>
                    {(statusConfig[selectedLead.status] || statusConfig.new).label}
                  </span>
                </div>
                <div className="text-slate-600 text-xs"><span className="text-slate-400">Quan tâm:</span> {selectedLead.interest || '—'}</div>
                <div className="text-slate-600 text-xs"><span className="text-slate-400">Ngân sách:</span> {selectedLead.budget.toLocaleString('vi-VN')}đ</div>
                <div className="text-slate-600 text-xs"><span className="text-slate-400">Khu vực:</span> {selectedLead.preferredArea || '—'}</div>
                <div className="text-slate-600 text-xs"><span className="text-slate-400">Phân công:</span> {selectedLead.assignedToName || '—'}</div>
              </div>

              {/* Change status */}
              <div className="flex items-center gap-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">-- Chuyển trạng thái --</option>
                  {statusOrder.map((s) => (
                    <option key={s} value={s}>{statusConfig[s]?.label}</option>
                  ))}
                </select>
                <Button size="sm" onClick={changeLeadStatus} disabled={!newStatus}>Cập nhật</Button>
              </div>

              {/* Add activity */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-800 text-sm">Ghi nhận hoạt động</h3>
                <div className="flex gap-2">
                  <select
                    value={newActivityType}
                    onChange={(e) => setNewActivityType(e.target.value as LeadActivity['type'])}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {(Object.keys(activityTypeConfig) as LeadActivity['type'][]).filter((t) => t !== 'status_change').map((t) => (
                      <option key={t} value={t}>{activityTypeConfig[t].label}</option>
                    ))}
                  </select>
                  <Input
                    placeholder="Nội dung hoạt động..."
                    value={newActivityContent}
                    onChange={(e) => setNewActivityContent(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={addActivity} disabled={!newActivityContent.trim()}>Thêm</Button>
                </div>
              </div>

              {/* Activities timeline */}
              <div>
                <h3 className="font-semibold text-slate-800 text-sm mb-3">Lịch sử hoạt động</h3>
                <div className="space-y-3">
                  {leadActivities.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-lg">Chưa có hoạt động nào</p>
                  )}
                  {leadActivities.map((entry) => {
                    const tc = activityTypeConfig[entry.type];
                    const EntryIcon = tc.icon;
                    return (
                      <div key={entry.id} className="flex gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${tc.color}`}>
                          <EntryIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0 pb-3 border-b border-dashed last:border-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-slate-600">{tc.label}</span>
                            <span className="text-xs text-slate-400">· {entry.createdByName}</span>
                            <span className="text-xs text-slate-400 flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />{formatDate(entry.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 mt-0.5">{entry.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm'} lead</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="fullName">Họ và tên <span className="text-red-500">*</span></Label>
                <Input id="fullName" name="fullName" defaultValue={editItem?.fullName} required />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
                <Input id="phone" name="phone" defaultValue={editItem?.phone} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editItem?.email} />
              </div>
              <div>
                <Label htmlFor="source">Nguồn lead</Label>
                <select id="source" name="source" defaultValue={editItem?.source || 'website'} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {Object.entries(sourceConfig).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <select id="status" name="status" defaultValue={editItem?.status || 'new'} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {statusOrder.map((s) => (
                    <option key={s} value={s}>{statusConfig[s]?.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="interest">Quan tâm</Label>
                <Input id="interest" name="interest" defaultValue={editItem?.interest} placeholder="Căn hộ 2PN view sông..." />
              </div>
              <div>
                <Label htmlFor="budget">Ngân sách (đ/tháng)</Label>
                <Input id="budget" name="budget" type="number" defaultValue={editItem?.budget} />
              </div>
              <div>
                <Label htmlFor="preferredArea">Khu vực</Label>
                <Input id="preferredArea" name="preferredArea" defaultValue={editItem?.preferredArea} />
              </div>
              <div>
                <Label htmlFor="preferredRoomType">Loại phòng</Label>
                <Input id="preferredRoomType" name="preferredRoomType" defaultValue={editItem?.preferredRoomType} />
              </div>
              <div>
                <Label htmlFor="assignedTo">Phân công</Label>
                <select id="assignedTo" name="assignedTo" defaultValue={editItem?.assignedTo || ''} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.filter((e) => e.status === 'active').map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Input id="notes" name="notes" defaultValue={editItem?.notes} />
              </div>
            </div>
            <Button type="submit" className="w-full">Lưu</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
