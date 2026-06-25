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
import { useRouter } from 'next/navigation';
import { useBuildings } from '@/lib/hooks/useEntities';
import { useAuth } from '@/lib/auth/AuthContext';
import type { DBBuilding } from '@/lib/supabase/types';

export default function BuildingsPage() {
  const { company } = useAuth();
  const { items: buildingList, loading, error, add, update, remove } = useBuildings(company?.id);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [editItem, setEditItem] = useState<DBBuilding | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

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
      image_url: null,
      landlord_id: null,
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

  const openAdd = () => { setEditItem(null); setIsDialogOpen(true); };
  const openEdit = (item: DBBuilding) => { setEditItem(item); setIsDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Tòa nhà</h1>
          <p className="text-slate-500">Quản lý tòa nhà và thông tin chi tiết</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Thêm tòa nhà</Button>
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
                <div><Label htmlFor="area">Khu vực</Label><Input id="area" name="area" defaultValue={editItem?.area} required /></div>
                <div><Label htmlFor="year_built">Năm xây dựng</Label><Input id="year_built" name="year_built" type="number" defaultValue={editItem?.year_built ?? ''} /></div>
              </div>
              <div><Label htmlFor="address">Địa chỉ</Label><Input id="address" name="address" defaultValue={editItem?.address ?? ''} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="total_floors">Số tầng</Label><Input id="total_floors" name="total_floors" type="number" defaultValue={editItem?.total_floors} required /></div>
                <div><Label htmlFor="total_rooms">Số phòng</Label><Input id="total_rooms" name="total_rooms" type="number" defaultValue={editItem?.total_rooms} required /></div>
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
                      <td className="px-4 py-3 font-medium text-slate-800 hover:text-blue-600">{item.name}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{item.area}</Badge></td>
                      <td className="px-4 py-3 text-slate-600">{item.year_built ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{item.total_floors}</td>
                      <td className="px-4 py-3 text-slate-600">{item.total_rooms}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(item); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); remove(item.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
