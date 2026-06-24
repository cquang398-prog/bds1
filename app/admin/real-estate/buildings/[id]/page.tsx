'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { buildings as initialBuildings, rooms as initialRooms, areas, roomTypes } from '@/lib/data/mock-data';
import { Pencil, Trash2, Plus, Eye, ArrowLeft, Copy, DoorOpen, Building2, MapPin, Calendar, Layers } from 'lucide-react';

const statusLabels: Record<string, string> = {
  available: 'Còn trống',
  rented: 'Đã cho thuê',
  sold: 'Đã bán',
  pending: 'Đang chờ',
};

export default function BuildingDetailPage() {
  const params = useParams();
  const buildingId = params.id as string;

  const building = initialBuildings.find((b) => b.id === buildingId);
  const [roomList, setRoomList] = useState(initialRooms);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const buildingRooms = roomList.filter((r) => r.buildingId === buildingId);

  const roomsByFloor = useMemo(() => {
    const grouped: Record<number, typeof buildingRooms> = {};
    buildingRooms.forEach((room) => {
      const floor = room.floor;
      if (!grouped[floor]) grouped[floor] = [];
      grouped[floor].push(room);
    });
    return Object.entries(grouped)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([floor, rooms]) => ({ floor: Number(floor), rooms }));
  }, [buildingRooms]);

  const handleDelete = (id: string) => {
    setRoomList((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDuplicate = (item: any) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      code: item.code + '-B',
    };
    setRoomList((prev) => [...prev, newItem]);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
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
      case 'available': return 'bg-green-100 text-green-700 border-green-200';
      case 'rented': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'sold': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!building) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-slate-800">Không tìm thấy tòa nhà</h1>
        <Button asChild className="mt-4">
          <Link href="/admin/real-estate/buildings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/real-estate/buildings">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{building.name}</h1>
            <p className="text-slate-500 text-sm">{building.code} — {building.address}</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm phòng
          </Button>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm'} phòng</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="code">Mã phòng</Label><Input id="code" name="code" defaultValue={editItem?.code} required /></div>
                <div><Label htmlFor="floor">Tầng</Label><Input id="floor" name="floor" type="number" defaultValue={editItem?.floor} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="area">Khu vực</Label>
                  <select id="area" name="area" defaultValue={editItem?.area || building.area} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    {areas.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="roomType">Loại phòng</Label>
                  <select id="roomType" name="roomType" defaultValue={editItem?.roomType || ''} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="">Chọn loại</option>
                    {roomTypes.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
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

      {/* Building Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg"><Building2 className="h-5 w-5 text-slate-600" /></div>
              <div>
                <div className="text-sm text-slate-500">Mã tòa nhà</div>
                <div className="font-medium">{building.code}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg"><MapPin className="h-5 w-5 text-slate-600" /></div>
              <div>
                <div className="text-sm text-slate-500">Khu vực</div>
                <div className="font-medium">{building.area}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg"><Calendar className="h-5 w-5 text-slate-600" /></div>
              <div>
                <div className="text-sm text-slate-500">Năm XD</div>
                <div className="font-medium">{building.yearBuilt}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg"><Layers className="h-5 w-5 text-slate-600" /></div>
              <div>
                <div className="text-sm text-slate-500">Số phòng</div>
                <div className="font-medium">{buildingRooms.length}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms by Floor */}
      {roomsByFloor.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DoorOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600">Chưa có phòng nào</h3>
            <p className="text-slate-500 mt-2">Nhấn "Thêm phòng" để tạo phòng mới cho tòa nhà này</p>
            <Button onClick={openAdd} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Thêm phòng
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {roomsByFloor.map(({ floor, rooms: floorRooms }) => (
            <Card key={floor}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5 text-slate-500" />
                  Tầng {floor}
                  <Badge variant="outline" className="ml-2">{floorRooms.length} phòng</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {floorRooms.map((room: any) => (
                    <div key={room.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${statusColor(room.status)} bg-opacity-30`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <DoorOpen className="h-4 w-4" />
                          <span className="font-mono font-medium">{room.code}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {statusLabels[room.status]}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Loại:</span>
                          <span>{room.roomType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Diện tích:</span>
                          <span>{room.size}m²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Giá:</span>
                          <span className="font-medium">{room.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Phòng ngủ:</span>
                          <span>{room.bedrooms}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 pt-3 border-t">
                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => openView(room)}>
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Xem
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => openEdit(room)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Sửa
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleDuplicate(room)}>
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          Nhân bản
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 text-red-500 hover:text-red-600" onClick={() => handleDelete(room.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Dialog */}
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
                <div><span className="text-slate-500">Trạng thái:</span> <Badge variant="outline">{statusLabels[viewItem.status]}</Badge></div>
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
