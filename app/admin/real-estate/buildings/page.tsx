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
import { buildings, areas } from '@/lib/data/mock-data';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus, Search, Building2 } from 'lucide-react';

export default function BuildingsPage() {
  const router = useRouter();
  const [buildingList, setBuildingList] = useState(buildings);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [editItem, setEditItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filtered = buildingList.filter((b) => {
    const matchesSearch = b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = !filterArea || b.area === filterArea;
    const matchesYear = !filterYear || b.yearBuilt.toString().includes(filterYear);
    return matchesSearch && matchesArea && matchesYear;
  });

  const handleDelete = (id: string) => {
    setBuildingList((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem = {
      id: editItem?.id || Date.now().toString(),
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      area: formData.get('area') as string,
      address: formData.get('address') as string,
      yearBuilt: Number(formData.get('yearBuilt')),
      totalFloors: Number(formData.get('totalFloors')),
      totalRooms: Number(formData.get('totalRooms')),
      description: formData.get('description') as string,
      image: editItem?.image || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
    };

    setBuildingList((prev) =>
      editItem ? prev.map((i) => (i.id === editItem.id ? newItem : i)) : [...prev, newItem]
    );
    setIsDialogOpen(false);
    setEditItem(null);
  };

  const openAdd = () => { setEditItem(null); setIsDialogOpen(true); };
  const openEdit = (item: any) => { setEditItem(item); setIsDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Tòa nhà</h1>
          <p className="text-slate-500">Quản lý tòa nhà và thông tin chi tiết</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm tòa nhà
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm'} tòa nhà</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="code">Mã tòa nhà</Label><Input id="code" name="code" defaultValue={editItem?.code} required /></div>
                <div><Label htmlFor="name">Tên tòa nhà</Label><Input id="name" name="name" defaultValue={editItem?.name} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="area">Khu vực</Label>
                  <select id="area" name="area" defaultValue={editItem?.area || ''} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="">Chọn khu vực</option>
                    {areas.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div><Label htmlFor="yearBuilt">Năm xây dựng</Label><Input id="yearBuilt" name="yearBuilt" type="number" defaultValue={editItem?.yearBuilt} required /></div>
              </div>
              <div><Label htmlFor="address">Địa chỉ</Label><Input id="address" name="address" defaultValue={editItem?.address} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="totalFloors">Số tầng</Label><Input id="totalFloors" name="totalFloors" type="number" defaultValue={editItem?.totalFloors} required /></div>
                <div><Label htmlFor="totalRooms">Số phòng</Label><Input id="totalRooms" name="totalRooms" type="number" defaultValue={editItem?.totalRooms} required /></div>
              </div>
              <div><Label htmlFor="description">Mô tả</Label><Input id="description" name="description" defaultValue={editItem?.description} /></div>
              <Button type="submit" className="w-full">Lưu</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Tìm theo mã hoặc tên..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer">
              <option value="">Tất cả khu vực</option>
              {areas.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
            <Input placeholder="Lọc theo năm" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Mã</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Tên</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Khu vực</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Năm XD</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Số tầng</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Số phòng</th>
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
                      router.push(`/admin/real-estate/buildings/${item.id}`);
                    }}
                  >
                    <td className="px-4 py-3 font-mono text-slate-600">{item.code}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800 hover:text-blue-600">
                        {item.name}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline">{item.area}</Badge></td>
                    <td className="px-4 py-3 text-slate-600">{item.yearBuilt}</td>
                    <td className="px-4 py-3 text-slate-600">{item.totalFloors}</td>
                    <td className="px-4 py-3 text-slate-600">{item.totalRooms}</td>
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
              <div className="text-center py-8 text-slate-500">Không tìm thấy tòa nhà</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
