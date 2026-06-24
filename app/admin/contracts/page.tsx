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
import { Textarea } from '@/components/ui/textarea';
import { contractTemplates } from '@/lib/data/mock-data';
import { Pencil, Trash2, Plus, Search, FileText } from 'lucide-react';

export default function ContractsPage() {
  const [contractList, setContractList] = useState(contractTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const filtered = contractList.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setContractList((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const now = new Date().toISOString().split('T')[0];
    const newItem = {
      id: editItem?.id || Date.now().toString(),
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      content: formData.get('content') as string,
      createdAt: editItem?.createdAt || now,
      updatedAt: now,
    };

    setContractList((prev) =>
      editItem ? prev.map((i) => (i.id === editItem.id ? newItem : i)) : [...prev, newItem]
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
          <h1 className="text-2xl font-bold text-slate-800">Mẫu hợp đồng</h1>
          <p className="text-slate-500">Quản lý mẫu hợp đồng pháp lý</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm mẫu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm'} mẫu hợp đồng</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="name">Tên mẫu</Label><Input id="name" name="name" defaultValue={editItem?.name} required /></div>
                <div><Label htmlFor="type">Loại hợp đồng</Label><Input id="type" name="type" defaultValue={editItem?.type} required /></div>
              </div>
              <div>
                <Label htmlFor="content">Nội dung</Label>
                <Textarea id="content" name="content" defaultValue={editItem?.content} rows={10} required />
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
            <Input placeholder="Tìm theo tên hoặc loại..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Tên</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Loại</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Ngày tạo</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Cập nhật</th>
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
                    <td className="px-4 py-3 text-slate-600">{item.type}</td>
                    <td className="px-4 py-3 text-slate-600">{item.createdAt}</td>
                    <td className="px-4 py-3 text-slate-600">{item.updatedAt}</td>
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
              <div className="text-center py-8 text-slate-500">Không tìm thấy mẫu hợp đồng</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Chi tiết mẫu hợp đồng
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Tên:</span> <span className="font-medium">{viewItem.name}</span></div>
                <div><span className="text-slate-500">Loại:</span> {viewItem.type}</div>
                <div><span className="text-slate-500">Ngày tạo:</span> {viewItem.createdAt}</div>
                <div><span className="text-slate-500">Cập nhật:</span> {viewItem.updatedAt}</div>
              </div>
              <div className="border rounded-lg p-4 bg-slate-50">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Nội dung</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{viewItem.content}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
