'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Shield, Edit, Trash2, Search, Check, Lock } from 'lucide-react';
import { roles as initialRoles } from '@/lib/data/mock-data';
import { Role } from '@/types';

const ALL_PERMISSIONS: { group: string; items: { key: string; label: string }[] }[] = [
  {
    group: 'Bất động sản',
    items: [
      { key: 'buildings.read', label: 'Xem tòa nhà' },
      { key: 'buildings.write', label: 'Quản lý tòa nhà' },
      { key: 'rooms.read', label: 'Xem phòng' },
      { key: 'rooms.write', label: 'Quản lý phòng' },
    ],
  },
  {
    group: 'Khách hàng',
    items: [
      { key: 'leads.read', label: 'Xem leads' },
      { key: 'leads.write', label: 'Quản lý leads' },
      { key: 'consultations.read', label: 'Xem tư vấn' },
      { key: 'consultations.write', label: 'Quản lý tư vấn' },
      { key: 'appointments.read', label: 'Xem lịch hẹn' },
      { key: 'appointments.write', label: 'Quản lý lịch hẹn' },
    ],
  },
  {
    group: 'Nhân sự',
    items: [
      { key: 'employees.read', label: 'Xem nhân viên' },
      { key: 'employees.write', label: 'Quản lý nhân viên' },
    ],
  },
  {
    group: 'Hợp đồng & Chủ nhà',
    items: [
      { key: 'landlords.read', label: 'Xem chủ nhà' },
      { key: 'landlords.write', label: 'Quản lý chủ nhà' },
      { key: 'contracts.read', label: 'Xem hợp đồng' },
      { key: 'contracts.write', label: 'Quản lý hợp đồng' },
    ],
  },
  {
    group: 'Hệ thống',
    items: [
      { key: 'reports.read', label: 'Xem báo cáo' },
      { key: 'accounts.read', label: 'Xem tài khoản' },
      { key: 'accounts.write', label: 'Quản lý tài khoản' },
      { key: 'roles.read', label: 'Xem phân quyền' },
      { key: 'roles.write', label: 'Quản lý phân quyền' },
    ],
  },
];

export default function RolesPage() {
  const [roleList, setRoleList] = useState<Role[]>(initialRoles);
  const [searchQuery, setSearchQuery] = useState('');
  const [editItem, setEditItem] = useState<Role | null>(null);
  const [viewItem, setViewItem] = useState<Role | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const filtered = roleList.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => setRoleList((prev) => prev.filter((r) => r.id !== id));

  const openAdd = () => {
    setEditItem(null);
    setSelectedPerms([]);
    setIsFormOpen(true);
  };

  const openEdit = (item: Role) => {
    setEditItem(item);
    setSelectedPerms(item.permissions.includes('*') ? ['*'] : [...item.permissions]);
    setIsFormOpen(true);
  };

  const openView = (item: Role) => { setViewItem(item); setIsViewOpen(true); };

  const togglePerm = (key: string) => {
    setSelectedPerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const item: Role = {
      id: editItem?.id || Date.now().toString(),
      name: fd.get('name') as string,
      description: fd.get('description') as string,
      permissions: selectedPerms,
      isSystem: editItem?.isSystem || false,
      usersCount: editItem?.usersCount || 0,
      createdAt: editItem?.createdAt || new Date().toISOString().split('T')[0],
    };
    setRoleList((prev) => editItem ? prev.map((r) => r.id === editItem.id ? item : r) : [...prev, item]);
    setIsFormOpen(false);
    setEditItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vai trò & Phân quyền</h1>
          <p className="text-slate-500">Quản lý vai trò và quyền hạn trong hệ thống</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm vai trò
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm vai trò..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {filtered.map((item) => {
              const isSuperAdmin = item.permissions.includes('*');
              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={(e) => { if ((e.target as HTMLElement).closest('button')) return; openView(item); }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.isSystem ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {item.isSystem ? <Lock className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        {item.isSystem && (
                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Hệ thống</span>
                        )}
                        <span className="text-xs text-slate-400">{item.usersCount} người dùng</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {isSuperAdmin ? (
                          <span className="text-xs bg-slate-800 text-white px-2 py-0.5 rounded">Toàn quyền</span>
                        ) : (
                          item.permissions.slice(0, 5).map((p) => (
                            <span key={p} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{p}</span>
                          ))
                        )}
                        {!isSuperAdmin && item.permissions.length > 5 && (
                          <span className="text-xs text-slate-400">+{item.permissions.length - 5} quyền khác</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!item.isSystem && (
                    <div className="flex items-center gap-1 ml-4">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(item); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {viewItem?.name}
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-slate-500">{viewItem.description}</p>
              {viewItem.permissions.includes('*') ? (
                <div className="p-3 bg-slate-900 text-white rounded-lg text-sm text-center">Toàn quyền hệ thống</div>
              ) : (
                ALL_PERMISSIONS.map((group) => {
                  const active = group.items.filter((item) => viewItem.permissions.includes(item.key));
                  if (!active.length) return null;
                  return (
                    <div key={group.group}>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{group.group}</p>
                      <div className="flex flex-wrap gap-2">
                        {active.map((item) => (
                          <span key={item.key} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded">
                            <Check className="h-3 w-3" />{item.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm'} vai trò</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5 pt-2">
            <div>
              <Label htmlFor="name">Tên vai trò</Label>
              <Input id="name" name="name" defaultValue={editItem?.name} required />
            </div>
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Input id="description" name="description" defaultValue={editItem?.description} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Phân quyền</p>
              <div className="space-y-4">
                {ALL_PERMISSIONS.map((group) => (
                  <div key={group.group}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{group.group}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.items.map((perm) => (
                        <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPerms.includes(perm.key)}
                            onChange={() => togglePerm(perm.key)}
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm text-slate-600">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full">Lưu</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
