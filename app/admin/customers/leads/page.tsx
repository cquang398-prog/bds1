'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Plus, Search, UserSearch, Phone, Mail, MapPin,
  ChevronDown, Clock, Edit, Trash2, User, Calendar,
  MessageCircle, PhoneCall, ArrowRightLeft,
} from 'lucide-react';
import { leads as initialLeads, leadTimelines as initialTimelines, employees } from '@/lib/data/mock-data';
import { Lead, LeadTimeline } from '@/types';

const statusConfig: Record<Lead['status'], { label: string; color: string }> = {
  new:         { label: 'Mới',          color: 'bg-slate-100 text-slate-700' },
  contacted:   { label: 'Đã liên hệ',   color: 'bg-blue-100 text-blue-700' },
  qualified:   { label: 'Đủ điều kiện', color: 'bg-teal-100 text-teal-700' },
  negotiating: { label: 'Đàm phán',     color: 'bg-yellow-100 text-yellow-700' },
  won:         { label: 'Thành công',   color: 'bg-green-100 text-green-700' },
  lost:        { label: 'Thất bại',     color: 'bg-red-100 text-red-700' },
};

const sourceConfig: Record<Lead['source'], string> = {
  website:   'Website',
  referral:  'Giới thiệu',
  social:    'Mạng xã hội',
  cold_call: 'Gọi lạnh',
  walk_in:   'Trực tiếp',
  other:     'Khác',
};

const timelineTypeConfig: Record<LeadTimeline['type'], { label: string; icon: React.ElementType; color: string }> = {
  note:          { label: 'Ghi chú',          icon: MessageCircle, color: 'bg-slate-100 text-slate-600' },
  call:          { label: 'Cuộc gọi',         icon: PhoneCall,     color: 'bg-blue-100 text-blue-600' },
  email:         { label: 'Email',             icon: Mail,          color: 'bg-purple-100 text-purple-600' },
  meeting:       { label: 'Gặp mặt',          icon: Calendar,      color: 'bg-green-100 text-green-600' },
  status_change: { label: 'Đổi trạng thái',   icon: ArrowRightLeft, color: 'bg-yellow-100 text-yellow-600' },
  assignment:    { label: 'Phân công',         icon: User,          color: 'bg-orange-100 text-orange-600' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function LeadsPage() {
  const [leadList, setLeadList] = useState<Lead[]>(initialLeads);
  const [timelines, setTimelines] = useState<LeadTimeline[]>(initialTimelines);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Lead | null>(null);
  const [newTimelineContent, setNewTimelineContent] = useState('');
  const [newTimelineType, setNewTimelineType] = useState<LeadTimeline['type']>('note');

  const filtered = leadList.filter((l) => {
    const matchSearch =
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: string) => setLeadList((prev) => prev.filter((l) => l.id !== id));

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const item: Lead = {
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
    };
    setLeadList((prev) => editItem ? prev.map((l) => l.id === editItem.id ? item : l) : [...prev, item]);
    setIsFormOpen(false);
    setEditItem(null);
  };

  const openAdd = () => { setEditItem(null); setIsFormOpen(true); };
  const openEdit = (item: Lead) => { setEditItem(item); setIsFormOpen(true); };
  const openDetail = (item: Lead) => { setSelectedLead(item); setIsDetailOpen(true); };

  const addTimeline = () => {
    if (!selectedLead || !newTimelineContent.trim()) return;
    const entry: LeadTimeline = {
      id: Date.now().toString(),
      leadId: selectedLead.id,
      type: newTimelineType,
      content: newTimelineContent,
      createdBy: 'acc1',
      createdByName: 'Admin',
      createdAt: new Date().toISOString(),
    };
    setTimelines((prev) => [entry, ...prev]);
    setNewTimelineContent('');
  };

  const leadTimelines = timelines.filter((t) => t.leadId === selectedLead?.id);

  const counts = Object.keys(statusConfig).reduce((acc, s) => {
    acc[s] = leadList.filter((l) => l.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Khách hàng tiềm năng</h1>
          <p className="text-slate-500">Quản lý và theo dõi leads bán hàng</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm lead
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Tất cả ({leadList.length})
        </button>
        {(Object.keys(statusConfig) as Lead['status'][]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {statusConfig[s].label} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {/* Table */}
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
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Quan tâm</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Phân công</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Nguồn</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Ngân sách</th>
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
                      onClick={(e) => { if ((e.target as HTMLElement).closest('button')) return; openDetail(item); }}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{item.fullName}</div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{item.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{item.preferredRoomType}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />{item.preferredArea}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{item.assignedToName || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500">{sourceConfig[item.source]}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {item.budget.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
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
                <div className="flex items-center gap-2 text-slate-600"><Mail className="h-4 w-4 text-slate-400" />{selectedLead.email}</div>
                <div className="flex items-center gap-2 text-slate-600 col-span-2">
                  <span className="text-slate-400">Trạng thái:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedLead.status].color}`}>
                    {statusConfig[selectedLead.status].label}
                  </span>
                </div>
                <div className="text-slate-600"><span className="text-slate-400">Quan tâm:</span> {selectedLead.interest}</div>
                <div className="text-slate-600"><span className="text-slate-400">Ngân sách:</span> {selectedLead.budget.toLocaleString('vi-VN')}đ</div>
                <div className="text-slate-600"><span className="text-slate-400">Khu vực:</span> {selectedLead.preferredArea}</div>
                <div className="text-slate-600"><span className="text-slate-400">Phân công:</span> {selectedLead.assignedToName || '—'}</div>
                {selectedLead.notes && (
                  <div className="col-span-2 text-slate-500 italic text-xs">{selectedLead.notes}</div>
                )}
              </div>

              {/* Add timeline entry */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">Lịch sử hoạt động</h3>
                <div className="flex gap-2">
                  <select
                    value={newTimelineType}
                    onChange={(e) => setNewTimelineType(e.target.value as LeadTimeline['type'])}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {(Object.keys(timelineTypeConfig) as LeadTimeline['type'][]).map((t) => (
                      <option key={t} value={t}>{timelineTypeConfig[t].label}</option>
                    ))}
                  </select>
                  <Input
                    placeholder="Ghi chú hoạt động..."
                    value={newTimelineContent}
                    onChange={(e) => setNewTimelineContent(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addTimeline} disabled={!newTimelineContent.trim()}>Thêm</Button>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                {leadTimelines.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">Chưa có hoạt động nào</p>
                )}
                {leadTimelines.map((entry) => {
                  const tc = timelineTypeConfig[entry.type];
                  const EntryIcon = tc.icon;
                  return (
                    <div key={entry.id} className="flex gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${tc.color}`}>
                        <EntryIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-slate-600">{tc.label}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-400">{entry.createdByName}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
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
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input id="fullName" name="fullName" defaultValue={editItem?.fullName} required />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" name="phone" defaultValue={editItem?.phone} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editItem?.email} />
              </div>
              <div>
                <Label htmlFor="source">Nguồn</Label>
                <select id="source" name="source" defaultValue={editItem?.source || 'website'} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {(Object.keys(sourceConfig) as Lead['source'][]).map((s) => (
                    <option key={s} value={s}>{sourceConfig[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <select id="status" name="status" defaultValue={editItem?.status || 'new'} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {(Object.keys(statusConfig) as Lead['status'][]).map((s) => (
                    <option key={s} value={s}>{statusConfig[s].label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="interest">Quan tâm</Label>
                <Input id="interest" name="interest" defaultValue={editItem?.interest} placeholder="Căn hộ 2 phòng ngủ, view sông..." />
              </div>
              <div>
                <Label htmlFor="budget">Ngân sách (VNĐ/tháng)</Label>
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
                <Label htmlFor="assignedTo">Phân công cho</Label>
                <select id="assignedTo" name="assignedTo" defaultValue={editItem?.assignedTo || ''} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.filter((emp) => emp.status === 'active').map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
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
