'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PermissionGate } from '@/components/ui/PermissionGate';
import {
  ArrowLeft, DoorOpen, Building2, Layers, Maximize2, BedDouble,
  Bath, Banknote, Pencil, Trash2, Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { useRoomsByBuilding } from '@/lib/hooks/useEntities';
import { useAuth } from '@/lib/auth/AuthContext';
import { getRoom } from '@/lib/supabase/repositories/rooms';
import { useEffect } from 'react';
import type { DBRoom } from '@/lib/supabase/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  available:   { label: 'Còn trống',    color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  rented:      { label: 'Đã cho thuê', color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',       icon: CheckCircle2 },
  maintenance: { label: 'Bảo trì',     color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200',   icon: AlertCircle },
  reserved:    { label: 'Đặt trước',   color: 'text-yellow-700',  bg: 'bg-yellow-50 border-yellow-200',   icon: CheckCircle2 },
};

const ROOM_TYPES = ['Studio', 'Phòng trọ', '1PN', '2PN', '3PN', 'Penthouse', 'Shophouse', 'Văn phòng'];

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between py-3 border-b last:border-0">
    <span className="text-slate-500 text-sm w-32 shrink-0">{label}</span>
    <span className="text-slate-800 text-sm font-medium text-right">{value ?? '—'}</span>
  </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────
export default function RoomDetailPage() {
  const params = useParams();
  const roomId = params.id as string;
  const router = useRouter();
  const { company } = useAuth();

  const [room, setRoom]       = useState<DBRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving]         = useState(false);

  // Dedicated hook for same-building rooms (for "Nhân bản" if needed later)
  const { update: updateRoom, remove: removeRoom } = useRoomsByBuilding(
    room?.building_id ?? undefined,
    company?.id,
  );

  // Load room on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getRoom(roomId)
      .then((data) => { if (mounted) { setRoom(data); setLoading(false); } })
      .catch((e) => { if (mounted) { setError(e.message); setLoading(false); } });
    return () => { mounted = false; };
  }, [roomId]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!room) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const patch = {
      code:        fd.get('code') as string,
      floor:       Number(fd.get('floor')),
      room_type:   fd.get('room_type') as string,
      size:        Number(fd.get('size')),
      price:       Number(fd.get('price')),
      status:      fd.get('status') as DBRoom['status'],
      bedrooms:    Number(fd.get('bedrooms')),
      bathrooms:   Number(fd.get('bathrooms')),
      description: fd.get('description') as string || null,
    };
    const updated = await updateRoom(room.id, patch);
    if (updated) setRoom(updated as DBRoom);
    setSaving(false);
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    if (!room || !confirm('Bạn có chắc muốn xóa phòng này?')) return;
    await removeRoom(room.id);
    router.push(`/admin/real-estate/buildings/${room.building_id}`);
  };

  const handleStatusChange = async (newStatus: DBRoom['status']) => {
    if (!room) return;
    const updated = await updateRoom(room.id, { status: newStatus });
    if (updated) setRoom(updated as DBRoom);
  };

  // ─── Loading / Error ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-700">Không tìm thấy phòng</h1>
        <p className="text-slate-500 text-sm mt-2">{error}</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/admin/real-estate/buildings">← Quay lại danh sách tòa nhà</Link>
        </Button>
      </div>
    );
  }

  const sc = statusConfig[room.status] ?? statusConfig['available'];
  const StatusIcon = sc.icon;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb + Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/real-estate/buildings/${room.building_id}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại tòa nhà
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <DoorOpen className="h-6 w-6 text-slate-600" />
              <h1 className="text-2xl font-bold text-slate-800 font-mono">{room.code}</h1>
              <Badge className={`${sc.bg} ${sc.color} border`} variant="outline">
                <StatusIcon className="h-3 w-3 mr-1" />
                {sc.label}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Tầng {room.floor} · {room.room_type ?? 'Chưa phân loại'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <PermissionGate roles={['company_admin', 'manager']}>
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </PermissionGate>
          <PermissionGate roles={['company_admin']}>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa phòng
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Maximize2,  label: 'Diện tích',  value: room.size ? `${room.size} m²` : '—' },
          { icon: Banknote,   label: 'Giá thuê',   value: `${room.price.toLocaleString('vi-VN')}đ/tháng` },
          { icon: BedDouble,  label: 'Phòng ngủ',  value: room.bedrooms },
          { icon: Bath,       label: 'Phòng tắm',  value: room.bathrooms },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Icon className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">{label}</div>
                  <div className="font-semibold text-slate-800">{value}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Room Detail Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Thông tin chi tiết</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Mã phòng"   value={<span className="font-mono">{room.code}</span>} />
            <InfoRow label="Tầng"       value={`Tầng ${room.floor}`} />
            <InfoRow label="Loại phòng" value={room.room_type} />
            <InfoRow label="Trạng thái" value={
              <Badge className={`${sc.bg} ${sc.color} border`} variant="outline">{sc.label}</Badge>
            } />
            <InfoRow label="Diện tích"  value={room.size ? `${room.size} m²` : null} />
            <InfoRow label="Giá thuê"   value={`${room.price.toLocaleString('vi-VN')}đ/tháng`} />
            <InfoRow label="Phòng ngủ"  value={room.bedrooms} />
            <InfoRow label="Phòng tắm"  value={room.bathrooms} />
            {room.description && (
              <InfoRow label="Mô tả" value={room.description} />
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          {/* Status Quick-Change */}
          <PermissionGate roles={['company_admin', 'manager']}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Đổi trạng thái nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(Object.entries(statusConfig) as [DBRoom['status'], typeof statusConfig[string]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(key)}
                    disabled={room.status === key}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm border transition-all ${
                      room.status === key
                        ? `${cfg.bg} ${cfg.color} border-current font-medium`
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cfg.label}
                    {room.status === key && <span className="float-right text-xs">✓ Hiện tại</span>}
                  </button>
                ))}
              </CardContent>
            </Card>
          </PermissionGate>

          {/* Navigate to Building */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tòa nhà</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/admin/real-estate/buildings/${room.building_id}`}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Xem tòa nhà
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Meta */}
          <Card>
            <CardHeader><CardTitle className="text-base">Metadata</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-xs text-slate-500">
              <div>ID: <span className="font-mono text-slate-700">{room.id.slice(0, 8)}…</span></div>
              <div>Tạo lúc: {new Date(room.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              {room.updated_at && (
                <div>Cập nhật: {new Date(room.updated_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phòng {room.code}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Mã phòng</Label>
                <Input id="code" name="code" defaultValue={room.code} required />
              </div>
              <div>
                <Label htmlFor="floor">Tầng</Label>
                <Input id="floor" name="floor" type="number" defaultValue={room.floor} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room_type">Loại phòng</Label>
                <select id="room_type" name="room_type" defaultValue={room.room_type ?? ''}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Chọn loại</option>
                  {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <select id="status" name="status" defaultValue={room.status}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
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
                <Input id="size" name="size" type="number" defaultValue={room.size ?? ''} />
              </div>
              <div>
                <Label htmlFor="price">Giá (đ)</Label>
                <Input id="price" name="price" type="number" defaultValue={room.price} required />
              </div>
              <div>
                <Label htmlFor="bedrooms">Phòng ngủ</Label>
                <Input id="bedrooms" name="bedrooms" type="number" defaultValue={room.bedrooms} required />
              </div>
            </div>
            <div>
              <Label htmlFor="bathrooms">Phòng tắm</Label>
              <Input id="bathrooms" name="bathrooms" type="number" defaultValue={room.bathrooms} required />
            </div>
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Input id="description" name="description" defaultValue={room.description ?? ''} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsEditOpen(false)}>Hủy</Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
