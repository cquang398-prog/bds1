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
import { Pencil, Trash2, Plus, Search, Building2, Loader2, AlertCircle } from 'lucide-react';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { useRouter } from 'next/navigation';
import { useBuildings, useLandlords, useEmployees } from '@/lib/hooks/useEntities';
import { useAuth } from '@/lib/auth/AuthContext';
import type { DBBuilding } from '@/lib/supabase/types';

import { ImageUpload } from '@/components/ui/ImageUpload';

export default function BuildingsPage() {
  const { company } = useAuth();
  const { items: buildingList, loading, error, add, update, remove } = useBuildings(company?.id);
  const { items: landlordList } = useLandlords(company?.id);
  const { items: employeeList } = useEmployees(company?.id);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [editItem, setEditItem] = useState<DBBuilding | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const areas = Array.from(new Set(buildingList.map((b) => b.area).filter(Boolean)));

  const filtered = buildingList.filter((b) => {
    const matchesSearch = b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = !filterArea || b.area === filterArea;
    return matchesSearch && matchesArea;
  });

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      company_id: company?.id ?? '',
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      area: formData.get('area') as string,
      address: formData.get('address') as string,
      year_built: Number(formData.get('year_built')) || null,
      total_floors: Number(formData.get('total_floors')) || 0,
      total_rooms: Number(formData.get('total_rooms')) || 0,
      description: formData.get('description') as string || null,
      image_url: imageUrl,
      landlord_id: formData.get('landlord_id') as string || null,
      manager_ids: selectedManagers,
    };

    if (editItem) {
      await update(editItem.id, payload);
    } else {
      await add(payload);
    }
    setSaving(false);
    setIsDialogOpen(false);
    setEditItem(null);
    setImageUrl(null);
  };

  const openAdd = () => {
    setEditItem(null);
    setSelectedManagers([]);
    setImageUrl(null);
    setIsDialogOpen(true);
  };
  const openEdit = (item: DBBuilding) => {
    setEditItem(item);
    setSelectedManagers(item.manager_ids || []);
    setImageUrl(item.image_url || null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Tòa nhà</h1>
          <p className="text-slate-500">Quản lý tòa nhà và thông tin chi tiết</p>
        </div>
        <PermissionGate roles={['company_admin']}>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Thêm tòa nhà</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editItem ? 'Cập nhật tòa nhà' : 'Thêm tòa nhà mới'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mã tòa nhà</Label>
                  <Input name="code" defaultValue={editItem?.code} required />
                </div>
                <div className="space-y-2">
                  <Label>Tên tòa nhà</Label>
                  <Input name="name" defaultValue={editItem?.name} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Khu vực</Label>
                  <Input name="area" defaultValue={editItem?.area ?? ''} placeholder="Ví dụ: Quận 1" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landlord_id">Chủ nhà phụ trách</Label>
                  <select
                    id="landlord_id"
                    name="landlord_id"
                    defaultValue={editItem?.landlord_id ?? ''}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="" disabled>-- Chọn chủ nhà --</option>
                    {landlordList.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.code ? `${l.code} - ` : ''}{l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Input name="address" defaultValue={editItem?.address ?? ''} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Năm XD</Label>
                  <Input name="year_built" type="number" defaultValue={editItem?.year_built ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label>Số tầng</Label>
                  <Input name="total_floors" type="number" defaultValue={editItem?.total_floors ?? 0} required />
                </div>
                <div className="space-y-2">
                  <Label>Số phòng</Label>
                  <Input name="total_rooms" type="number" defaultValue={editItem?.total_rooms ?? 0} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Input name="description" defaultValue={editItem?.description ?? ''} />
              </div>

              <div className="space-y-2">
                <Label>Hình ảnh tòa nhà</Label>
                <ImageUpload value={imageUrl} onChange={setImageUrl} />
              </div>

              <div className="space-y-2">
                <Label>Quản lý tòa nhà</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] bg-white">
                  {employeeList.map((emp) => (
                    <Badge
                      key={emp.id}
                      variant={selectedManagers.includes(emp.id) ? 'default' : 'outline'}
                      className="cursor-pointer select-none"
                      onClick={() => setSelectedManagers(prev => 
                        prev.includes(emp.id) ? prev.filter(id => id !== emp.id) : [...prev, emp.id]
                      )}
                    >
                      {emp.name}
                    </Badge>
                  ))}
                  {employeeList.length === 0 && (
                    <div className="text-slate-400 text-xs py-1 text-center w-full">Chưa có nhân viên nào</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu thông tin
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </PermissionGate>
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
              <Input placeholder="Tìm theo mã hoặc tên..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer">
              <option value="">Tất cả khu vực</option>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
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
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded-md border flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded-md border flex items-center justify-center text-slate-400 flex-shrink-0">
                              <Building2 className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-slate-800 hover:text-blue-600 block">{item.name}</span>
                            <span className="text-xs text-slate-400 block max-w-[200px] truncate">{item.address || 'Không có địa chỉ'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant="outline">{item.area}</Badge></td>
                      <td className="px-4 py-3 text-slate-600">{item.year_built ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{item.total_floors}</td>
                      <td className="px-4 py-3 text-slate-600">{item.total_rooms}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <PermissionGate roles={['company_admin', 'manager']}>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(item); }}><Pencil className="h-4 w-4" /></Button>
                          </PermissionGate>
                          <PermissionGate roles={['company_admin']}>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); remove(item.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Chưa có tòa nhà nào</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
