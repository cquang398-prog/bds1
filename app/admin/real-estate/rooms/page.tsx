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
import { rooms, buildings, areas, roomTypes } from '@/lib/data/mock-data';
import { Pencil, Trash2, Plus, Search, Eye, DoorOpen } from 'lucide-react';

const statusLabels: Record<string, string> = {
  available: 'Còn trống',
  rented: 'Đã cho thuê',
  sold: 'Đã bán',
  pending: 'Đang chờ',
};

export default function RoomsPage() {
  const [roomList, setRoomList] = useState(rooms);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const filtered = roomList.filter((r) => {
    const matchesSearch = r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.buildingName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = !filterArea || r.area === filterArea;
    return matchesSearch && matchesArea;
  });

  const handleDelete = (id: string) => {
    setRoomList((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const buildingId = formData.get('buildingId') as string;
    const building = buildings.find((b) => b.id === buildingId);
    const newItem: any = {
      id: editItem?.id || Date.now().toString(),
      code: formData.get('code') as string,
      buildingId,
      buildingName: building?.name || '',
      area: formData.get('area') as string,
      floor: Number(formData.get('floor')),
      roomType: formData.get('roomType') as string,
      size: Number(formData.get('size')),
      price: Number(formData.get('price')),
      status: formData.get('status') as string,
      bedrooms: Number(formData.get('bedrooms')),
      bathrooms: Number(formData.get('bathrooms')),
      description: formData.get('description') as string,
    };

    setRoomList((prev) =>
      editItem ? prev.map((i) => (i.id === editItem.id ? newItem : i)) : [...prev, newItem as any]
    );
    setIsDialogOpen(false);
    setEditItem(null);
  };

  const openAdd = () => { setEditItem(null); setIsDialogOpen(true); };
  const openEdit = (item: any) => { setEditItem(item); setIsDialogOpen(true); };
  const openView = (item: any) => { setViewItem(item); setIsViewOpen(true); };

  const statusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'rented': return 'bg-blue-100 text-blue-700';
      case 'sold': return 'bg-slate-100 text-slate-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Căn hộ/Phòng</h1>
          <p className="text-slate-500">Quản lý căn hộ và phòng riêng lẻ</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm phòng
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm'} phòng</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="code">Mã phòng</Label><Input id="code" name="code" defaultValue={editItem?.code} required /></div>
                <div>
                  <Label htmlFor="buildingId">Tòa nhà</Label>
                  <select id="buildingId" name="buildingId" defaultValue={editItem?.buildingId || ''} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="">Chọn tòa nhà</option>
                    {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="area">Khu vực</Label>
                  <select id="area" name="area" defaultValue={editItem?.area || ''} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="">Chọn khu vực</option>
                    {areas.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div><Label htmlFor="floor">Tầng</Label><Input id="floor" name="floor" type="number" defaultValue={editItem?.floor} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roomType">Loại phòng</Label>
                  <select id="roomType" name="roomType" defaultValue={editItem?.roomType || ''} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="">Chọn loại</option>
                    {roomTypes.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <select id="status" name="status" defaultValue={editItem?.status || 'available'} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="available">Còn trống</option>
                    <option value="rented">Đã cho thuê</option>
                    <option value="sold">Đã bán</option>
                    <option value="pending">Đang chờ</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label htmlFor="size">Diện tích (m²)</Label><Input id="size" name="size" type="number" defaultValue={editItem?.size} required /></div>
                <div><Label htmlFor="price">Giá (đ)</Label><Input id="price" name="price" type="number" defaultValue={editItem?.price} required /></div>
                <div><Label htmlFor="bedrooms">Phòng ngủ</Label><Input id="bedrooms" name="bedrooms" type="number" defaultValue={editItem?.bedrooms} required /></div>
              </div>
              <div><Label htmlFor="bathrooms">Phòng tắm</Label><Input id="bathrooms" name="bathrooms" type="number" defaultValue={editItem?.bathrooms} required /></div>
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
              <Input placeholder="Tìm theo mã hoặc tòa nhà..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
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
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Mã</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Tòa nhà</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Khu vực</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Loại</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Diện tích</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Giá</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-600">{item.code}</td>
                    <td className="px-4 py-3 text-slate-800">{item.buildingName}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{item.area}</Badge></td>
                    <td className="px-4 py-3 text-slate-600">{item.roomType}</td>
                    <td className="px-4 py-3 text-slate-600">{item.size}m²</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.price.toLocaleString('vi-VN')}đ</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${statusColor(item.status)}`}>
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openView(item)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-500">Không tìm thấy phòng</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5" />
              Chi tiết phòng
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Mã:</span> <span className="font-mono">{viewItem.code}</span></div>
                <div><span className="text-slate-500">Tòa nhà:</span> {viewItem.buildingName}</div>
                <div><span className="text-slate-500">Khu vực:</span> <Badge variant="outline">{viewItem.area}</Badge></div>
                <div><span className="text-slate-500">Tầng:</span> {viewItem.floor}</div>
                <div><span className="text-slate-500">Loại:</span> {viewItem.roomType}</div>
                <div><span className="text-slate-500">Trạng thái:</span> <span className={`inline-block px-2 py-0.5 rounded text-xs ${statusColor(viewItem.status)}`}>{statusLabels[viewItem.status]}</span></div>
                <div><span className="text-slate-500">Diện tích:</span> {viewItem.size}m²</div>
                <div><span className="text-slate-500">Giá:</span> {viewItem.price.toLocaleString('vi-VN')}đ</div>
                <div><span className="text-slate-500">Phòng ngủ:</span> {viewItem.bedrooms}</div>
                <div><span className="text-slate-500">Phòng tắm:</span> {viewItem.bathrooms}</div>
              </div>
              <div className="text-sm"><span className="text-slate-500">Mô tả:</span> {viewItem.description}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
