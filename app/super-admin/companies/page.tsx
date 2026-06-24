'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Plus, Search, Building2, Edit, Trash2, Lock, Unlock,
  Users, MapPin, Mail, Phone, Eye,
} from 'lucide-react';
import { companies as initialCompanies } from '@/lib/data/mock-data';
import { Company } from '@/types';

const planConfig: Record<Company['plan'], { label: string; color: string }> = {
  starter:      { label: 'Starter',      color: 'bg-slate-100 text-slate-700' },
  professional: { label: 'Professional', color: 'bg-blue-100 text-blue-700' },
  enterprise:   { label: 'Enterprise',   color: 'bg-amber-100 text-amber-700' },
};

const statusConfig: Record<Company['status'], { label: string; color: string }> = {
  active:    { label: 'Hoạt động', color: 'bg-green-100 text-green-700' },
  trial:     { label: 'Dùng thử',  color: 'bg-amber-100 text-amber-700' },
  suspended: { label: 'Tạm khóa', color: 'bg-red-100 text-red-700' },
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('vi-VN');
}

export default function SuperAdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [editItem, setEditItem] = useState<Company | null>(null);
  const [viewItem, setViewItem] = useState<Company | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const filtered = companies.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPlan = planFilter === 'all' || c.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const toggleStatus = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'active' ? 'suspended' : 'active' }
          : c
      )
    );
  };

  const handleDelete = (id: string) => setCompanies((prev) => prev.filter((c) => c.id !== id));

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const item: Company = {
      id: editItem?.id || Date.now().toString(),
      name: fd.get('name') as string,
      domain: fd.get('domain') as string,
      plan: fd.get('plan') as Company['plan'],
      status: fd.get('status') as Company['status'],
      ownerName: fd.get('ownerName') as string,
      ownerEmail: fd.get('ownerEmail') as string,
      phone: fd.get('phone') as string,
      address: fd.get('address') as string,
      totalUsers: editItem?.totalUsers || 1,
      totalProperties: editItem?.totalProperties || 0,
      createdAt: editItem?.createdAt || new Date().toISOString().split('T')[0],
    };
    setCompanies((prev) =>
      editItem ? prev.map((c) => c.id === editItem.id ? item : c) : [...prev, item]
    );
    setIsFormOpen(false);
    setEditItem(null);
  };

  const openAdd = () => { setEditItem(null); setIsFormOpen(true); };
  const openEdit = (item: Company) => { setEditItem(item); setIsFormOpen(true); };
  const openView = (item: Company) => { setViewItem(item); setIsViewOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Công ty</h1>
          <p className="text-slate-500">Tất cả công ty trên nền tảng RealHome Business</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm công ty
        </Button>
      </div>

      {/* Plan filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'starter', 'professional', 'enterprise'].map((p) => (
          <button
            key={p}
            onClick={() => setPlanFilter(p)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${planFilter === p ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {p === 'all' ? `Tất cả (${companies.length})` : planConfig[p as Company['plan']].label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm công ty, email..."
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
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Công ty</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Chủ sở hữu</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Gói</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-600">Users</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Ngày tạo</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((item) => {
                  const pc = planConfig[item.plan];
                  const sc = statusConfig[item.status];
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={(e) => { if ((e.target as HTMLElement).closest('button')) return; openView(item); }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4 text-slate-500" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">{item.name}</div>
                            <div className="text-xs text-slate-400">{item.domain}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700">{item.ownerName}</div>
                        <div className="text-xs text-slate-400">{item.ownerEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pc.color}`}>{pc.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-slate-700 font-medium">{item.totalUsers}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" title="Xem chi tiết" onClick={(e) => { e.stopPropagation(); openView(item); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" title="Chỉnh sửa" onClick={(e) => { e.stopPropagation(); openEdit(item); }}><Edit className="h-4 w-4" /></Button>
                          <Button
                            variant="ghost" size="sm"
                            title={item.status === 'suspended' ? 'Mở khóa' : 'Khóa'}
                            onClick={(e) => { e.stopPropagation(); toggleStatus(item.id); }}
                          >
                            {item.status === 'suspended'
                              ? <Unlock className="h-4 w-4 text-green-600" />
                              : <Lock className="h-4 w-4 text-red-500" />
                            }
                          </Button>
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
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>Không tìm thấy công ty nào</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Detail Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {viewItem?.name}
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg text-sm">
                <div className="flex items-center gap-2 text-slate-600"><Mail className="h-4 w-4 text-slate-400" />{viewItem.ownerEmail}</div>
                <div className="flex items-center gap-2 text-slate-600"><Phone className="h-4 w-4 text-slate-400" />{viewItem.phone}</div>
                <div className="col-span-2 flex items-center gap-2 text-slate-600"><MapPin className="h-4 w-4 text-slate-400" />{viewItem.address}</div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-xs text-slate-400 mb-1">Gói</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${planConfig[viewItem.plan].color}`}>{planConfig[viewItem.plan].label}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-xs text-slate-400 mb-1">Trạng thái</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[viewItem.status].color}`}>{statusConfig[viewItem.status].label}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-xs text-slate-400 mb-1">Users</p>
                  <p className="font-bold text-slate-800">{viewItem.totalUsers}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setIsViewOpen(false); openEdit(viewItem); }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant={viewItem.status === 'suspended' ? 'default' : 'destructive'}
                  className="flex-1"
                  onClick={() => { toggleStatus(viewItem.id); setIsViewOpen(false); }}
                >
                  {viewItem.status === 'suspended' ? <><Unlock className="h-4 w-4 mr-2" />Mở khóa</> : <><Lock className="h-4 w-4 mr-2" />Khóa</>}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm'} công ty</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="name">Tên công ty</Label>
                <Input id="name" name="name" defaultValue={editItem?.name} required />
              </div>
              <div>
                <Label htmlFor="domain">Tên miền</Label>
                <Input id="domain" name="domain" defaultValue={editItem?.domain} placeholder="company.vn" />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" name="phone" defaultValue={editItem?.phone} />
              </div>
              <div>
                <Label htmlFor="ownerName">Chủ sở hữu</Label>
                <Input id="ownerName" name="ownerName" defaultValue={editItem?.ownerName} required />
              </div>
              <div>
                <Label htmlFor="ownerEmail">Email</Label>
                <Input id="ownerEmail" name="ownerEmail" type="email" defaultValue={editItem?.ownerEmail} required />
              </div>
              <div>
                <Label htmlFor="plan">Gói dịch vụ</Label>
                <select id="plan" name="plan" defaultValue={editItem?.plan || 'starter'} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <select id="status" name="status" defaultValue={editItem?.status || 'trial'} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="active">Hoạt động</option>
                  <option value="trial">Dùng thử</option>
                  <option value="suspended">Tạm khóa</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input id="address" name="address" defaultValue={editItem?.address} />
              </div>
            </div>
            <Button type="submit" className="w-full">Lưu</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
