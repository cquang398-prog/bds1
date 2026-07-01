'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Search, Eye, DoorOpen, Loader2, AlertCircle } from 'lucide-react';
import { useRooms, useBuildings } from '@/lib/hooks/useEntities';
import { useAuth } from '@/lib/auth/AuthContext';
import type { RoomWithBuilding } from '@/lib/supabase/repositories/rooms';
import type { DBRoom } from '@/lib/supabase/types';

const statusLabels: Record<string, string> = {
  available: 'Còn trống',
  rented: 'Đã cho thuê',
  maintenance: 'Bảo trì',
  reserved: 'Đang giữ',
};

const statusColor = (status: string) => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-700';
    case 'rented': return 'bg-blue-100 text-blue-700';
    case 'maintenance': return 'bg-yellow-100 text-yellow-700';
    case 'reserved': return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function RoomsPage() {
  const { company } = useAuth();
  const { items: roomList, loading, error, add, update, remove } = useRooms(company?.id);
  const { items: buildings } = useBuildings(company?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editItem, setEditItem] = useState<RoomWithBuilding | null>(null);
  const [viewItem, setViewItem] = useState<RoomWithBuilding | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayPrice, setDisplayPrice] = useState('');

  const filtered = roomList.filter((r) => {
    const buildingName = r.buildings?.name ?? '';
    const matchesSearch = r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buildingName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const payload: Omit<DBRoom, 'id' | 'created_at' | 'updated_at'> = {
      company_id: company?.id ?? '',
      building_id: formData.get('building_id') as string || null,
      code: formData.get('code') as string,
      floor: Number(formData.get('floor')),
      room_type: formData.get('room_type') as string || null,
      size: Number(formData.get('size')) || null,
      price: Number(formData.get('price')),
      status: formData.get('status') as DBRoom['status'],
      bedrooms: Number(formData.get('bedrooms')),
      bathrooms: Number(formData.get('bathrooms')),
      description: formData.get('description') as string || null,
    };

    if (editItem) {
      await update(editItem.id, payload);
    } else {
      await add(payload);
    }
    setSaving(false);
    setIsDialogOpen(false);
    setEditItem(null);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) { setDisplayPrice(''); return; }
    setDisplayPrice(Number(rawValue).toLocaleString('vi-VN'));
  };

  const openAdd = () => { setEditItem(null); setDisplayPrice(''); setIsDialogOpen(true); };
  const openEdit = (item: RoomWithBuilding) => { setEditItem(item); setDisplayPrice(item.price ? item.price.toLocaleString('vi-VN') : ''); setIsDialogOpen(true); };
  const openView = (item: RoomWithBuilding) => { setViewItem(item); setIsViewOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Căn hộ/Phòng</h1>
          <p className="text-slate-500">Quản lý căn hộ và phòng riêng lẻ</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Thêm phòng</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm'} phòng</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="code">Mã phòng</Label><Input id="code" name="code" defaultValue={editItem?.code} required /></div>
                <div>
                  <Label htmlFor="building_id">Tòa nhà</Label>
                  <select id="building_id" name="building_id" defaultValue={editItem?.building_id ?? ''} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Chọn tòa nhà</option>
                    {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="room_type">Loại phòng</Label><Input id="room_type" name="room_type" defaultValue={editItem?.room_type ?? ''} /></div>
                <div><Label htmlFor="floor">Tầng</Label><Input id="floor" name="floor" type="number" defaultValue={editItem?.floor} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <select id="status" name="status" defaultValue={editItem?.status ?? 'available'} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="available">Còn trống</option>
                    <option value="rented">Đã cho thuê</option>
                    <option value="maintenance">Bảo trì</option>
                    <option value="reserved">Đang giữ</option>
                  </select>
                </div>
                <div><Label htmlFor="size">Diện tích (m²)</Label><Input id="size" name="size" type="number" defaultValue={editItem?.size ?? ''} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Giá (đ)</Label>
                  <Input
                    id="price"
                    type="text"
                    inputMode="numeric"
                    value={displayPrice}
                    onChange={handlePriceChange}
                    placeholder="0"
                    required
                  />
                  <input type="hidden" name="price" value={displayPrice.replace(/\./g, '')} />
                </div>
                <div><Label htmlFor="bedrooms">Phòng ngủ</Label><Input id="bedrooms" name="bedrooms" type="number" defaultValue={editItem?.bedrooms} required /></div>
                <div><Label htmlFor="bathrooms">Phòng tắm</Label><Input id="bathrooms" name="bathrooms" type="number" defaultValue={editItem?.bathrooms} required /></div>
              </div>
              <div><Label htmlFor="description">Mô tả</Label><Input id="description" name="description" defaultValue={editItem?.description ?? ''} /></div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Lưu
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Tìm theo mã hoặc tòa nhà..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="available">Còn trống</option>
              <option value="rented">Đã cho thuê</option>
              <option value="maintenance">Bảo trì</option>
              <option value="reserved">Đang giữ</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Mã</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Tòa nhà</th>
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
                      <td className="px-4 py-3 text-slate-800">{item.buildings?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{item.room_type ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{item.size ? `${item.size}m²` : '—'}</td>
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
                          <Button variant="ghost" size="sm" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  <DoorOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Chưa có phòng nào</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5" />Chi tiết phòng
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Mã:</span> <span className="font-mono">{viewItem.code}</span></div>
                <div><span className="text-slate-500">Tòa nhà:</span> {viewItem.buildings?.name ?? '—'}</div>
                <div><span className="text-slate-500">Tầng:</span> {viewItem.floor}</div>
                <div><span className="text-slate-500">Loại:</span> {viewItem.room_type ?? '—'}</div>
                <div><span className="text-slate-500">Trạng thái:</span> <span className={`inline-block px-2 py-0.5 rounded text-xs ${statusColor(viewItem.status)}`}>{statusLabels[viewItem.status]}</span></div>
                <div><span className="text-slate-500">Diện tích:</span> {viewItem.size ? `${viewItem.size}m²` : '—'}</div>
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
