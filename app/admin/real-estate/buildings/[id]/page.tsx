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
import { PermissionGate } from '@/components/ui/PermissionGate';
import {
  Pencil, Trash2, Plus, Eye, ArrowLeft, Copy,
  DoorOpen, Building2, MapPin, Calendar, Layers, Loader2, AlertCircle,
} from 'lucide-react';
import { useBuildings, useRoomsByBuilding } from '@/lib/hooks/useEntities';
import { useAuth } from '@/lib/auth/AuthContext';
import type { DBRoom } from '@/lib/supabase/types';

// ─── Status helpers ──────────────────────────────────────────────────────────
const statusLabels: Record<string, string> = {
  available:   'Còn trống',
  rented:      'Đã cho thuê',
  maintenance: 'Bảo trì',
  reserved:    'Đặt trước',
};

const statusColor = (status: string) => {
  switch (status) {
    case 'available':   return 'bg-green-100 text-green-700 border-green-200';
    case 'rented':      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'maintenance': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'reserved':    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default:            return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const ROOM_TYPES = ['Studio', 'Phòng trọ', '1PN', '2PN', '3PN', 'Penthouse', 'Shophouse', 'Văn phòng'];

// ─── Page ────────────────────────────────────────────────────────────────────
export default function BuildingDetailPage() {
  const params     = useParams();
  const buildingId = params.id as string;
  const { company } = useAuth();

  const { items: buildingList, loading: buildingLoading } = useBuildings(company?.id);
  const {
    items: roomList,
    loading: roomLoading,
    error: roomError,
    add: addRoom,
    update: updateRoom,
    remove: removeRoom,
    refetch: refetchRooms,
  } = useRoomsByBuilding(buildingId, company?.id);

  const building = useMemo(
    () => buildingList.find((b) => b.id === buildingId),
    [buildingList, buildingId],
  );

  const [editItem, setEditItem]   = useState<DBRoom | null>(null);
  const [viewItem, setViewItem]   = useState<DBRoom | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen,   setIsViewOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayPrice, setDisplayPrice] = useState('');

  // ─── Group rooms by floor ─────────────────────────────────────────────────
  const roomsByFloor = useMemo(() => {
    const grouped: Record<number, DBRoom[]> = {};
    roomList.forEach((room) => {
      if (!grouped[room.floor]) grouped[room.floor] = [];
      grouped[room.floor].push(room);
    });
    return Object.entries(grouped)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([floor, rooms]) => ({ floor: Number(floor), rooms }));
  }, [roomList]);

  // ─── CRUD handlers ────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa phòng này?')) return;
    await removeRoom(id);
  };

  const handleDuplicate = async (item: DBRoom) => {
    const suffix = `-B`;
    await addRoom({
      ...item,
      id:         undefined as any,
      code:       item.code + suffix,
      created_at: undefined as any,
      updated_at: undefined as any,
    });
  };

  const handleDuplicateFloor = async (floorNumber: number) => {
    const targetFloor = floorNumber + 1;
    const floorRooms  = roomList.filter((r) => r.floor === floorNumber);
    if (floorRooms.length === 0) return;

    for (let i = 0; i < floorRooms.length; i++) {
      const room       = floorRooms[i];
      const oldStr     = floorNumber.toString();
      const newStr     = targetFloor.toString();
      const newCode    = room.code.includes(oldStr)
        ? room.code.replace(oldStr, newStr)
        : `${room.code}-T${targetFloor}`;

      await addRoom({
        ...room,
        id:         undefined as any,
        floor:      targetFloor,
        code:       newCode,
        created_at: undefined as any,
        updated_at: undefined as any,
      });
    }
  };

  const handleDeleteFloor = async (floorNumber: number) => {
    const floorRooms = roomList.filter((r) => r.floor === floorNumber);
    if (floorRooms.length === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa toàn bộ ${floorRooms.length} phòng của tầng ${floorNumber}? Hành động này không thể hoàn tác.`)) return;

    for (const room of floorRooms) {
      await removeRoom(room.id);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const payload = {
      code:        fd.get('code') as string,
      building_id: buildingId,
      company_id:  company?.id ?? null,
      floor:       Number(fd.get('floor')),
      room_type:   fd.get('room_type') as string,
      size:        Number(fd.get('size')),
      price:       Number(fd.get('price')),
      status:      fd.get('status') as DBRoom['status'],
      bedrooms:    Number(fd.get('bedrooms')),
      bathrooms:   Number(fd.get('bathrooms')),
      description: fd.get('description') as string || null,
    };

    if (editItem) {
      await updateRoom(editItem.id, payload);
    } else {
      await addRoom(payload);
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

  const openAdd  = () => { setEditItem(null); setDisplayPrice(''); setIsDialogOpen(true); };
  const openEdit = (item: DBRoom) => { setEditItem(item); setDisplayPrice(item.price ? item.price.toLocaleString('vi-VN') : ''); setIsDialogOpen(true); };
  const openView = (item: DBRoom) => { setViewItem(item); setIsViewOpen(true); };

  // ─── Loading / not found ──────────────────────────────────────────────────
  const isLoading = buildingLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

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

  // ─── Render ───────────────────────────────────────────────────────────────
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

        {/* Add Room – chỉ hiện với admin & manager */}
        <PermissionGate roles={['company_admin', 'manager']}>
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
                  <div>
                    <Label htmlFor="code">Mã phòng</Label>
                    <Input id="code" name="code" defaultValue={editItem?.code} required />
                  </div>
                  <div>
                    <Label htmlFor="floor">Tầng</Label>
                    <Input id="floor" name="floor" type="number" defaultValue={editItem?.floor} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="room_type">Loại phòng</Label>
                    <select
                      id="room_type" name="room_type"
                      defaultValue={editItem?.room_type ?? ''}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Chọn loại</option>
                      {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status">Trạng thái</Label>
                    <select
                      id="status" name="status"
                      defaultValue={editItem?.status || 'available'}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="available">Còn trống</option>
                      <option value="rented">Đã cho thuê</option>
                      <option value="maintenance">Bảo trì</option>
                      <option value="reserved">Đặt trước</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="size">Diện tích (m²)</Label>
                    <Input id="size" name="size" type="number" defaultValue={editItem?.size ?? ''} required />
                  </div>
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
                  <div>
                    <Label htmlFor="bedrooms">Phòng ngủ</Label>
                    <Input id="bedrooms" name="bedrooms" type="number" defaultValue={editItem?.bedrooms} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bathrooms">Phòng tắm</Label>
                  <Input id="bathrooms" name="bathrooms" type="number" defaultValue={editItem?.bathrooms} required />
                </div>
                <div>
                  <Label htmlFor="description">Mô tả</Label>
                  <Input id="description" name="description" defaultValue={editItem?.description ?? ''} />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Lưu
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </PermissionGate>
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
                <div className="font-medium">{building.year_built ?? '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg"><Layers className="h-5 w-5 text-slate-600" /></div>
              <div>
                <div className="text-sm text-slate-500">Số phòng</div>
                <div className="font-medium">
                  {roomLoading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : roomList.length}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error banner */}
      {roomError && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm">{roomError}</span>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={refetchRooms}>Thử lại</Button>
        </div>
      )}

      {/* Rooms by Floor */}
      {roomLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : roomsByFloor.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DoorOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600">Chưa có phòng nào</h3>
            <p className="text-slate-500 mt-2">Nhấn "Thêm phòng" để tạo phòng mới cho tòa nhà này</p>
            <PermissionGate roles={['company_admin', 'manager']}>
              <Button onClick={openAdd} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Thêm phòng
              </Button>
            </PermissionGate>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {roomsByFloor.map(({ floor, rooms: floorRooms }) => (
            <Card key={floor}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="h-5 w-5 text-slate-500" />
                    Tầng {floor}
                    <Badge variant="outline" className="ml-2">{floorRooms.length} phòng</Badge>
                  </CardTitle>
                   <div className="flex gap-2">
                    <PermissionGate roles={['company_admin', 'manager']}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateFloor(floor)}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Nhân bản tầng
                      </Button>
                    </PermissionGate>
                    <PermissionGate roles={['company_admin']}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDeleteFloor(floor)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Xóa tầng
                      </Button>
                    </PermissionGate>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {floorRooms.map((room) => (
                    <div
                      key={room.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${statusColor(room.status)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <DoorOpen className="h-4 w-4" />
                          <span className="font-mono font-medium">{room.code}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {statusLabels[room.status] ?? room.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Loại:</span>
                          <span>{room.room_type ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Diện tích:</span>
                          <span>{room.size ? `${room.size}m²` : '—'}</span>
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
                      <div className="flex gap-1 pt-3 border-t border-current border-opacity-20">
                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => openView(room)}>
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Xem
                        </Button>
                        <PermissionGate roles={['company_admin', 'manager']}>
                          <Button variant="ghost" size="sm" className="flex-1" onClick={() => openEdit(room)}>
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Sửa
                          </Button>
                          <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleDuplicate(room)}>
                            <Copy className="h-3.5 w-3.5 mr-1" />
                            Nhân bản
                          </Button>
                        </PermissionGate>
                        <PermissionGate roles={['company_admin']}>
                          <Button
                            variant="ghost" size="sm"
                            className="flex-1 text-red-500 hover:text-red-600"
                            onClick={() => handleDelete(room.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Xóa
                          </Button>
                        </PermissionGate>
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
                <div><span className="text-slate-500">Tòa nhà:</span> {building.name}</div>
                <div><span className="text-slate-500">Tầng:</span> {viewItem.floor}</div>
                <div>
                  <span className="text-slate-500">Trạng thái:</span>{' '}
                  <Badge variant="outline">{statusLabels[viewItem.status] ?? viewItem.status}</Badge>
                </div>
                <div><span className="text-slate-500">Loại:</span> {viewItem.room_type ?? '—'}</div>
                <div><span className="text-slate-500">Diện tích:</span> {viewItem.size ? `${viewItem.size}m²` : '—'}</div>
                <div><span className="text-slate-500">Giá:</span> {viewItem.price.toLocaleString('vi-VN')}đ</div>
                <div><span className="text-slate-500">Phòng ngủ:</span> {viewItem.bedrooms}</div>
                <div><span className="text-slate-500">Phòng tắm:</span> {viewItem.bathrooms}</div>
              </div>
              {viewItem.description && (
                <div className="text-sm">
                  <span className="text-slate-500">Mô tả:</span> {viewItem.description}
                </div>
              )}
              <div className="pt-2 flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/admin/real-estate/rooms/${viewItem.id}`}>
                    Xem trang chi tiết →
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
