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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { priceRanges, amenities, roomTypes, areas } from '@/lib/data/mock-data';
import { Pencil, Trash2, Plus, DollarSign, Sparkles, BedDouble, MapPin } from 'lucide-react';

interface CrudTableProps {
  data: any[];
  columns: { key: string; label: string }[];
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  icon: React.ElementType;
}

function CrudTable({ data, columns, onEdit, onDelete, icon: Icon }: CrudTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-medium text-slate-600">
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 text-right font-medium text-slate-600">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-slate-700">
                  {item[col.key]}
                </td>
              ))}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CategoriesPage() {
  const [priceRangeList, setPriceRangeList] = useState(priceRanges);
  const [amenityList, setAmenityList] = useState(amenities);
  const [roomTypeList, setRoomTypeList] = useState(roomTypes);
  const [areaList, setAreaList] = useState(areas);

  const [editItem, setEditItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('prices');

  const handleDelete = (id: string) => {
    if (activeTab === 'prices') setPriceRangeList((prev) => prev.filter((i) => i.id !== id));
    if (activeTab === 'amenities') setAmenityList((prev) => prev.filter((i) => i.id !== id));
    if (activeTab === 'roomtypes') setRoomTypeList((prev) => prev.filter((i) => i.id !== id));
    if (activeTab === 'areas') setAreaList((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: any = { id: editItem?.id || Date.now().toString(), ...Object.fromEntries(formData) };

    if (activeTab === 'prices') {
      setPriceRangeList((prev) =>
        editItem ? prev.map((i) => (i.id === editItem.id ? newItem : i)) : [...prev, newItem as any]
      );
    }
    if (activeTab === 'amenities') {
      setAmenityList((prev) =>
        editItem ? prev.map((i) => (i.id === editItem.id ? newItem : i)) : [...prev, newItem as any]
      );
    }
    if (activeTab === 'roomtypes') {
      setRoomTypeList((prev) =>
        editItem ? prev.map((i) => (i.id === editItem.id ? newItem : i)) : [...prev, newItem as any]
      );
    }
    if (activeTab === 'areas') {
      setAreaList((prev) =>
        editItem ? prev.map((i) => (i.id === editItem.id ? newItem : i)) : [...prev, newItem as any]
      );
    }
    setIsDialogOpen(false);
    setEditItem(null);
  };

  const openAdd = () => {
    setEditItem(null);
    setIsDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setIsDialogOpen(true);
  };

  const getFormFields = () => {
    switch (activeTab) {
      case 'prices':
        return [
          { name: 'label', label: 'Nhãn', type: 'text' },
          { name: 'min', label: 'Giá tối thiểu', type: 'number' },
          { name: 'max', label: 'Giá tối đa', type: 'number' },
        ];
      case 'amenities':
        return [
          { name: 'name', label: 'Tên', type: 'text' },
          { name: 'icon', label: 'Biểu tượng', type: 'text' },
        ];
      case 'roomtypes':
        return [
          { name: 'name', label: 'Tên', type: 'text' },
          { name: 'description', label: 'Mô tả', type: 'text' },
        ];
      case 'areas':
        return [
          { name: 'name', label: 'Tên', type: 'text' },
          { name: 'description', label: 'Mô tả', type: 'text' },
        ];
      default:
        return [];
    }
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case 'prices': return 'Khoảng giá';
      case 'amenities': return 'Tiện ích';
      case 'roomtypes': return 'Loại phòng';
      case 'areas': return 'Khu vực';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Danh mục</h1>
          <p className="text-slate-500">Quản lý khoảng giá, tiện ích, loại phòng và khu vực</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm'} {getTabLabel()}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              {getFormFields().map((field) => (
                <div key={field.name}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    defaultValue={editItem?.[field.name] || ''}
                    required
                  />
                </div>
              ))}
              <Button type="submit" className="w-full">Lưu</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="prices">
            <DollarSign className="h-4 w-4 mr-2 hidden sm:inline" />
            Khoảng giá
          </TabsTrigger>
          <TabsTrigger value="amenities">
            <Sparkles className="h-4 w-4 mr-2 hidden sm:inline" />
            Tiện ích
          </TabsTrigger>
          <TabsTrigger value="roomtypes">
            <BedDouble className="h-4 w-4 mr-2 hidden sm:inline" />
            Loại phòng
          </TabsTrigger>
          <TabsTrigger value="areas">
            <MapPin className="h-4 w-4 mr-2 hidden sm:inline" />
            Khu vực
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Khoảng giá
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CrudTable
                data={priceRangeList}
                columns={[
                  { key: 'label', label: 'Nhãn' },
                  { key: 'min', label: 'Tối thiểu' },
                  { key: 'max', label: 'Tối đa' },
                ]}
                onEdit={openEdit}
                onDelete={handleDelete}
                icon={DollarSign}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Tiện ích
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CrudTable
                data={amenityList}
                columns={[
                  { key: 'name', label: 'Tên' },
                  { key: 'icon', label: 'Biểu tượng' },
                ]}
                onEdit={openEdit}
                onDelete={handleDelete}
                icon={Sparkles}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roomtypes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BedDouble className="h-5 w-5" />
                Loại phòng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CrudTable
                data={roomTypeList}
                columns={[
                  { key: 'name', label: 'Tên' },
                  { key: 'description', label: 'Mô tả' },
                ]}
                onEdit={openEdit}
                onDelete={handleDelete}
                icon={BedDouble}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="areas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Khu vực
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CrudTable
                data={areaList}
                columns={[
                  { key: 'name', label: 'Tên' },
                  { key: 'description', label: 'Mô tả' },
                ]}
                onEdit={openEdit}
                onDelete={handleDelete}
                icon={MapPin}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
