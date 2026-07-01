'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Pencil, Trash2, Plus, Search, FileText, Loader2, AlertCircle, 
  Printer, CreditCard, Calendar, User, ShieldCheck, HelpCircle 
} from 'lucide-react';
import { useContractTemplates, useDepositContracts, useRentalContracts } from '@/lib/hooks/useEntities';
import { useAuth } from '@/lib/auth/AuthContext';
import type { DBContractTemplate } from '@/lib/supabase/types';
import Link from 'next/link';

export default function ContractsPage() {
  const { company } = useAuth();
  const [activeTab, setActiveTab] = useState<'deposits' | 'rentals' | 'templates'>('deposits');
  
  // Tab 1: Hợp đồng đặt cọc
  const { 
    items: depositContracts, 
    loading: depositsLoading, 
    error: depositsError, 
    remove: removeDeposit 
  } = useDepositContracts(company?.id);
  const [depositSearch, setDepositSearch] = useState('');

  // Tab 2: Hợp đồng thuê chính thức
  const {
    items: rentalContracts,
    loading: rentalsLoading,
    error: rentalsError,
    remove: removeRental,
  } = useRentalContracts(company?.id);
  const [rentalSearch, setRentalSearch] = useState('');

  // Tab 3: Mẫu hợp đồng
  const { 
    items: contractList, 
    loading: templatesLoading, 
    error: templatesError, 
    add: addTemplate, 
    update: updateTemplate, 
    remove: removeTemplate 
  } = useContractTemplates(company?.id);
  const [templateSearch, setTemplateSearch] = useState('');
  const [editItem, setEditItem] = useState<DBContractTemplate | null>(null);
  const [viewItem, setViewItem] = useState<DBContractTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters
  const filteredTemplates = contractList.filter((c) =>
    c.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    c.type.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const filteredDeposits = depositContracts.filter((d) =>
    d.party_b_name.toLowerCase().includes(depositSearch.toLowerCase()) ||
    d.party_b_phone.includes(depositSearch) ||
    d.contract_code.toLowerCase().includes(depositSearch.toLowerCase()) ||
    (d.rooms?.code && d.rooms.code.toLowerCase().includes(depositSearch.toLowerCase()))
  );

  const filteredRentals = rentalContracts.filter((r) =>
    r.party_b_name.toLowerCase().includes(rentalSearch.toLowerCase()) ||
    r.party_b_phone.includes(rentalSearch) ||
    r.contract_code.toLowerCase().includes(rentalSearch.toLowerCase()) ||
    (r.rooms?.code && r.rooms.code.toLowerCase().includes(rentalSearch.toLowerCase()))
  );

  // Status mapping
  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'Bản nháp', color: 'bg-slate-100 text-slate-700' },
    active: { label: 'Hiệu lực', color: 'bg-green-100 text-green-700' },
    signed: { label: 'Đã ký', color: 'bg-blue-100 text-blue-700' },
    converted: { label: 'Đã thuê', color: 'bg-indigo-100 text-indigo-700' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
    forfeited: { label: 'Mất cọc', color: 'bg-amber-100 text-amber-700' },
    refunded: { label: 'Trả cọc', color: 'bg-teal-100 text-teal-700' },
  };

  const handleSaveTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      company_id: company?.id ?? '',
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      content: formData.get('content') as string || null,
    };
    if (editItem) {
      await updateTemplate(editItem.id, payload);
    } else {
      await addTemplate(payload);
    }
    setSaving(false);
    setIsDialogOpen(false);
    setEditItem(null);
  };

  const openAddTemplate = () => { setEditItem(null); setIsDialogOpen(true); };
  const openEditTemplate = (item: DBContractTemplate) => { setEditItem(item); setIsDialogOpen(true); };
  const openViewTemplate = (item: DBContractTemplate) => { setViewItem(item); setIsViewOpen(true); };

  const error = activeTab === 'deposits' 
    ? depositsError 
    : activeTab === 'rentals' 
      ? rentalsError 
      : templatesError;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý hợp đồng</h1>
          <p className="text-slate-500">Quản lý hợp đồng đặt cọc giữ chỗ và hợp đồng thuê chính thức</p>
        </div>

        {activeTab === 'deposits' ? (
          <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
            <Link href="/admin/contracts/create">
              <Plus className="h-4 w-4 mr-2" /> Soạn hợp đồng cọc
            </Link>
          </Button>
        ) : activeTab === 'rentals' ? (
          <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
            <Link href="/admin/contracts/create-rental">
              <Plus className="h-4 w-4 mr-2" /> Soạn hợp đồng thuê
            </Link>
          </Button>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddTemplate} className="bg-slate-900 text-white hover:bg-slate-800">
                <Plus className="h-4 w-4 mr-2" /> Thêm mẫu hợp đồng
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editItem ? 'Chỉnh sửa' : 'Thêm'} mẫu hợp đồng</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveTemplate} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Tên mẫu</Label>
                    <Input id="name" name="name" defaultValue={editItem?.name} required />
                  </div>
                  <div>
                    <Label htmlFor="type">Loại hợp đồng</Label>
                    <Input id="type" name="type" defaultValue={editItem?.type} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="content">Nội dung mẫu</Label>
                  <Textarea id="content" name="content" defaultValue={editItem?.content ?? ''} rows={10} />
                </div>
                <Button type="submit" className="w-full bg-slate-900 text-white" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Lưu
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs chuyển đổi */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-all ${
            activeTab === 'deposits'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Hợp đồng đặt cọc
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-all ${
            activeTab === 'rentals'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Hợp đồng thuê chính thức
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-all ${
            activeTab === 'templates'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Mẫu hợp đồng
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      {activeTab === 'deposits' ? (
        // TABLE HỢP ĐỒNG ĐẶT CỌC
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Tìm hợp đồng cọc theo tên khách, SĐT, mã hợp đồng hoặc mã phòng..." 
                value={depositSearch} 
                onChange={(e) => setDepositSearch(e.target.value)} 
                className="pl-9" 
              />
            </div>
          </CardHeader>
          <CardContent>
            {depositsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã hợp đồng</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Phòng / Tòa nhà</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Khách thuê (Bên B)</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Tiền đặt cọc</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Hạn ký HĐ thuê</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredDeposits.map((item) => {
                      const statusInfo = statusLabels[item.status] || { label: item.status, color: 'bg-slate-100 text-slate-700' };
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">{item.contract_code}</td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-indigo-600">Phòng {item.rooms?.code || '---'}</span>
                            <p className="text-xs text-slate-400 truncate max-w-[180px]">
                              {item.rooms?.buildings?.name || 'Vị trí khác'}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-800">{item.party_b_name}</span>
                            <p className="text-xs text-slate-500">{item.party_b_phone}</p>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {Number(item.deposit_amount).toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {new Date(item.deadline_sign_contract).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {['signed', 'active', 'draft'].includes(item.status) && (
                                <Button variant="ghost" size="sm" asChild title="Chuyển thành Hợp đồng thuê">
                                  <Link href={`/admin/contracts/create-rental?deposit_id=${item.id}`}>
                                    <FileText className="h-4 w-4 text-emerald-600" />
                                  </Link>
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" asChild title="In hợp đồng">
                                <Link href={`/admin/contracts/${item.id}/print`}>
                                  <Printer className="h-4 w-4 text-indigo-600" />
                                </Link>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  if (confirm('Bạn có chắc muốn xóa hợp đồng cọc này?')) {
                                    removeDeposit(item.id);
                                  }
                                }} 
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredDeposits.length === 0 && (
                  <div className="text-center py-12 text-slate-400 bg-white">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-35 text-slate-600" />
                    <p className="text-sm font-medium">Chưa có hợp đồng đặt cọc nào</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút "Soạn hợp đồng cọc" để bắt đầu</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : activeTab === 'rentals' ? (
        // TABLE HỢP ĐỒNG THUÊ CHÍNH THỨC
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Tìm hợp đồng thuê theo tên khách, SĐT, mã hợp đồng hoặc mã phòng..." 
                value={rentalSearch} 
                onChange={(e) => setRentalSearch(e.target.value)} 
                className="pl-9" 
              />
            </div>
          </CardHeader>
          <CardContent>
            {rentalsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Mã hợp đồng</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Phòng / Tòa nhà</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Khách thuê (Bên B)</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Tiền thuê</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Thời hạn</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Trạng thái</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRentals.map((item) => {
                      const rentalStatusLabels: Record<string, { label: string; color: string }> = {
                        draft: { label: 'Bản nháp', color: 'bg-slate-100 text-slate-700' },
                        active: { label: 'Hiệu lực', color: 'bg-green-100 text-green-700' },
                        ended: { label: 'Đã hết hạn', color: 'bg-slate-300 text-slate-650' },
                        terminated: { label: 'Kết thúc sớm', color: 'bg-amber-100 text-amber-700' },
                        cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
                      };
                      const statusInfo = rentalStatusLabels[item.status] || { label: item.status, color: 'bg-slate-100 text-slate-700' };
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-900">{item.contract_code}</td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-indigo-600">Phòng {item.rooms?.code || '---'}</span>
                            <p className="text-xs text-slate-400 truncate max-w-[180px]">
                              {item.rooms?.buildings?.name || 'Vị trí khác'}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-800">{item.party_b_name}</span>
                            <p className="text-xs text-slate-500">{item.party_b_phone}</p>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {Number(item.rent_price).toLocaleString('vi-VN')} đ/tháng
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">
                            {new Date(item.start_date).toLocaleDateString('vi-VN')} - {new Date(item.end_date).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  if (confirm('Bạn có chắc muốn xóa hợp đồng thuê này?')) {
                                    removeRental(item.id);
                                  }
                                }} 
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredRentals.length === 0 && (
                  <div className="text-center py-12 text-slate-400 bg-white">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-35 text-slate-600" />
                    <p className="text-sm font-medium">Chưa có hợp đồng thuê chính thức nào</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút "Soạn hợp đồng thuê" hoặc chuyển đổi từ Hợp đồng cọc để bắt đầu</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // TABLE MẪU HỢP ĐỒNG
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Tìm theo tên mẫu hoặc loại..." 
                value={templateSearch} 
                onChange={(e) => setTemplateSearch(e.target.value)} 
                className="pl-9" 
              />
            </div>
          </CardHeader>
          <CardContent>
            {templatesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Tên</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Loại</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Ngày tạo</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Cập nhật</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTemplates.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/50 cursor-pointer"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button')) return;
                          openViewTemplate(item);
                        }}
                      >
                        <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
                        <td className="px-4 py-3 text-slate-600">{item.type}</td>
                        <td className="px-4 py-3 text-slate-500">{item.created_at.split('T')[0]}</td>
                        <td className="px-4 py-3 text-slate-500">{item.updated_at.split('T')[0]}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditTemplate(item); }}><Pencil className="h-4 w-4 text-slate-600" /></Button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); if (confirm('Bạn có chắc muốn xóa mẫu này?')) removeTemplate(item.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTemplates.length === 0 && (
                  <div className="text-center py-12 text-slate-400 bg-white">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-35 text-slate-600" />
                    <p className="text-sm font-medium">Chưa có mẫu hợp đồng nào</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog chi tiết mẫu hợp đồng */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <FileText className="h-5 w-5 text-indigo-600" />Chi tiết mẫu hợp đồng
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-lg border">
                <div><span className="text-slate-500">Tên:</span> <span className="font-semibold text-slate-800">{viewItem.name}</span></div>
                <div><span className="text-slate-500">Loại:</span> <span className="font-semibold text-slate-800">{viewItem.type}</span></div>
                <div><span className="text-slate-500">Ngày tạo:</span> {viewItem.created_at.split('T')[0]}</div>
                <div><span className="text-slate-500">Cập nhật:</span> {viewItem.updated_at.split('T')[0]}</div>
              </div>
              <div className="border rounded-lg p-4 bg-white max-h-[350px] overflow-auto">
                <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">Nội dung mẫu</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{viewItem.content}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
