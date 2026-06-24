'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin } from 'lucide-react';

const schema = z.object({
  customerName: z.string().min(1, 'Vui lòng nhập họ tên'),
  customerPhone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^[0-9+\s\-()]{8,15}$/, 'Số điện thoại không hợp lệ'),
  viewingDate: z.string().min(1, 'Vui lòng chọn ngày xem'),
  viewingTime: z.string().min(1, 'Vui lòng chọn giờ xem'),
});

type FormValues = z.infer<typeof schema>;

interface ViewingProperty {
  id: string;
  title: string;
  address: string;
}

interface ViewingRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: ViewingProperty | null;
}

export function ViewingRequestDialog({
  open,
  onOpenChange,
  property,
}: ViewingRequestDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    if (!property) return;

    const request = {
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: property.address,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      viewingDate: data.viewingDate,
      viewingTime: data.viewingTime,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = localStorage.getItem('viewing_requests');
      const list = existing ? JSON.parse(existing) : [];
      list.push(request);
      localStorage.setItem('viewing_requests', JSON.stringify(list));
    } catch {}

    toast.success('Đặt lịch xem thành công', {
      description: 'Chúng tôi sẽ liên hệ với bạn sớm nhất.',
      duration: 4000,
    });

    reset();
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[500px] w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Đặt Lịch Hẹn Xem
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
          {/* Property info banner */}
          {property && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 space-y-1">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                Bất động sản đang xem
              </p>
              <p className="font-semibold text-slate-900 text-sm leading-snug">
                {property.title}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span>{property.address}</span>
              </div>
            </div>
          )}

          {/* Họ và tên */}
          <div className="space-y-1.5">
            <Label htmlFor="vr-name">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vr-name"
              placeholder="Họ tên của bạn"
              {...register('customerName')}
              className={errors.customerName ? 'border-red-400 focus-visible:ring-red-300' : ''}
            />
            {errors.customerName && (
              <p className="text-xs text-red-500">{errors.customerName.message}</p>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <Label htmlFor="vr-phone">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vr-phone"
              placeholder="Số điện thoại của bạn"
              inputMode="tel"
              {...register('customerPhone')}
              className={errors.customerPhone ? 'border-red-400 focus-visible:ring-red-300' : ''}
            />
            {errors.customerPhone && (
              <p className="text-xs text-red-500">{errors.customerPhone.message}</p>
            )}
          </div>

          {/* Ngày & Giờ — 2 columns */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="vr-date">
                Ngày đi xem <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vr-date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('viewingDate')}
                className={errors.viewingDate ? 'border-red-400 focus-visible:ring-red-300' : ''}
              />
              {errors.viewingDate && (
                <p className="text-xs text-red-500">{errors.viewingDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vr-time">
                Giờ đi xem <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vr-time"
                type="time"
                {...register('viewingTime')}
                className={errors.viewingTime ? 'border-red-400 focus-visible:ring-red-300' : ''}
              />
              {errors.viewingTime && (
                <p className="text-xs text-red-500">{errors.viewingTime.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            <Calendar className="h-4 w-4 mr-2" />
            Gửi yêu cầu
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
