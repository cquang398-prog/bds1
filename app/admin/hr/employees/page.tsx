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
import { employees } from '@/lib/data/mock-data';
import { Pencil, Trash2, Plus, Search, User } from 'lucide-react';

const statusLabels: Record<string, string> = {
  active: 'Đang làm việc',
  inactive: 'Đã nghỉ việc',
};

export default function EmployeesPage() {
  const [employeeList, setEmployeeList] = useState(employees);
  const [searchQuery, setSearchQuery] = useState('');
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const filtered = employeeList.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setEmployeeList((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: any = {
      id: editItem?.id || Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      department: formData.get('department') as string,
      position: formData.get('position') as string,
      joinDate: formData.get('joinDate') as string,
      status: formData.get('status') as string,
    };

    setEmployeeList((prev) =>
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
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Nhân viên</h1>
          <p className="text-slate-500">Quản lý nhân sự và thông tin nhân viên</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm nhân viên
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm'} nhân viên</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="name">Họ tên</Label><Input id="name" name="name" defaultValue={editItem?.name} required /></div>
                <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" defaultValue={editItem?.email} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="phone">Số điện thoại</Label><Input id="phone" name="phone" defaultValue={editItem?.phone} /></div>
                <div><Label htmlFor="department">Phòng ban</Label><Input id="department" name="department" defaultValue={editItem?.department} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="position">Chức vụ</Label><Input id="position" name="position" defaultValue={editItem?.position} required /></div>
                <div><Label htmlFor="joinDate">Ngày vào làm</Label><Input id="joinDate" name="joinDate" type="date" defaultValue={editItem?.joinDate} required /></div>
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <select id="status" name="status" defaultValue={editItem?.status || 'active'} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="active">Đang làm việc</option>
                  <option value="inactive">Đã nghỉ việc</option>
                </select>
              </div>
              <Button type="submit" className="w-full">Lưu</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Tìm theo tên, email hoặc phòng ban..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Họ tên</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Phòng ban</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Chức vụ</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Trạng thái</th>
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
                    <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.email}</td>
                    <td className="px-4 py-3 text-slate-600">{item.department}</td>
                    <td className="px-4 py-3 text-slate-600">{item.position}</td>
                    <td className="px-4 py-3">
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {statusLabels[item.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(item); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-500">Không tìm thấy nhân viên</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Chi tiết nhân viên
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Họ tên:</span> <span className="font-medium">{viewItem.name}</span></div>
                <div><span className="text-slate-500">Email:</span> {viewItem.email}</div>
                <div><span className="text-slate-500">SĐT:</span> {viewItem.phone}</div>
                <div><span className="text-slate-500">Phòng ban:</span> {viewItem.department}</div>
                <div><span className="text-slate-500">Chức vụ:</span> {viewItem.position}</div>
                <div><span className="text-slate-500">Ngày vào làm:</span> {viewItem.joinDate}</div>
                <div><span className="text-slate-500">Trạng thái:</span> <Badge variant={viewItem.status === 'active' ? 'default' : 'secondary'}>{statusLabels[viewItem.status]}</Badge></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
