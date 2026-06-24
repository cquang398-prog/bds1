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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { accounts } from '@/lib/data/mock-data';
import { Pencil, Trash2, Plus, Search, Lock, Unlock, KeyRound, Shield } from 'lucide-react';

const statusLabels: Record<string, string> = {
  active: 'Hoạt động',
  locked: 'Đã khóa',
};

export default function AccountsPage() {
  const [accountList, setAccountList] = useState(accounts);
  const [searchQuery, setSearchQuery] = useState('');
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const filtered = accountList.filter((a) =>
    a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setAccountList((prev) => prev.filter((i) => i.id !== id));
  };

  const handleToggleLock = (id: string) => {
    setAccountList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === 'active' ? 'locked' : 'active' } : a))
    );
  };

  const handleResetPassword = (id: string) => {
    alert('Đã gửi liên kết đặt lại mật khẩu đến email người dùng');
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const now = new Date().toISOString().split('T')[0];
    const newItem: any = {
      id: editItem?.id || Date.now().toString(),
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      status: 'active',
      lastLogin: '-',
      createdAt: editItem?.createdAt || now,
    };

    setAccountList((prev) =>
      editItem ? prev.map((i) => (i.id === editItem.id ? newItem : i)) : [...prev, newItem as any]
    );
    setIsDialogOpen(false);
    setEditItem(null);
  };

  const openAdd = () => { setEditItem(null); setIsDialogOpen(true); };
  const openEdit = (item: any) => { setEditItem(item); setIsDialogOpen(true); };
  const openView = (item: any) => { setViewItem(item); setIsViewOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Tài khoản</h1>
          <p className="text-slate-500">Quản lý tài khoản người dùng, vai trò và quyền hạn</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm tài khoản
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm'} tài khoản</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="username">Tên đăng nhập</Label><Input id="username" name="username" defaultValue={editItem?.username} required /></div>
                <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" defaultValue={editItem?.email} required /></div>
              </div>
              <div>
                <Label htmlFor="role">Vai trò</Label>
                <select id="role" name="role" defaultValue={editItem?.role || 'User'} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="Administrator">Quản trị viên</option>
                  <option value="Manager">Quản lý</option>
                  <option value="User">Người dùng</option>
                </select>
              </div>
              {!editItem && (
                <div><Label htmlFor="password">Mật khẩu</Label><Input id="password" name="password" type="password" required={!editItem} /></div>
              )}
              <Button type="submit" className="w-full">Lưu</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Tìm theo tên đăng nhập, email hoặc vai trò..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Tên đăng nhập</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Vai trò</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Đăng nhập cuối</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button')) return;
                      openView(item);
                    }}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">{item.username}</td>
                    <td className="px-4 py-3 text-slate-600">{item.email}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{item.role}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge variant={item.status === 'active' ? 'default' : 'destructive'}>
                        {statusLabels[item.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.lastLogin}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(item); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleToggleLock(item.id); }} title={item.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}>
                          {item.status === 'active' ? <Lock className="h-4 w-4 text-orange-500" /> : <Unlock className="h-4 w-4 text-green-500" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleResetPassword(item.id); }} title="Đặt lại mật khẩu"><KeyRound className="h-4 w-4 text-blue-500" /></Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-500">Không tìm thấy tài khoản</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Chi tiết tài khoản
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Tên đăng nhập:</span> <span className="font-medium">{viewItem.username}</span></div>
                <div><span className="text-slate-500">Email:</span> {viewItem.email}</div>
                <div><span className="text-slate-500">Vai trò:</span> <Badge variant="outline">{viewItem.role}</Badge></div>
                <div><span className="text-slate-500">Trạng thái:</span> <Badge variant={viewItem.status === 'active' ? 'default' : 'destructive'}>{statusLabels[viewItem.status]}</Badge></div>
                <div><span className="text-slate-500">Đăng nhập cuối:</span> {viewItem.lastLogin}</div>
                <div><span className="text-slate-500">Ngày tạo:</span> {viewItem.createdAt}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
