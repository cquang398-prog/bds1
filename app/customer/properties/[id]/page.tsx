'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { properties } from '@/lib/data/mock-data';
import { MapPin, Bed, Bath, Square, Calendar, Phone, ChevronLeft, ChevronRight, Check, Map, ExternalLink } from 'lucide-react';

const statusLabels: Record<string, string> = {
  available: 'Còn trống',
  rented: 'Đã cho thuê',
  sold: 'Đã bán',
  pending: 'Đang chờ',
};

export default function PropertyDetailPage() {
  const params = useParams();
  const property = properties.find((p) => p.id === params.id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', date: '', time: '' });
  const [isMapOpen, setIsMapOpen] = useState(false);

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Không tìm thấy bất động sản</h1>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Image Gallery */}
      <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-8">
        <Image
          src={property.images[currentImageIndex]}
          alt={property.title}
          fill
          className="object-cover"
        />
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {property.images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant={property.status === 'available' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
            {statusLabels[property.status]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{property.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-slate-600">
              <MapPin className="h-5 w-5" />
              {property.address}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 py-4 border-y">
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-slate-500" />
              <div>
                <div className="font-semibold">{property.bedrooms}</div>
                <div className="text-sm text-slate-500">Phòng ngủ</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-slate-500" />
              <div>
                <div className="font-semibold">{property.bathrooms}</div>
                <div className="text-sm text-slate-500">Phòng tắm</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Square className="h-5 w-5 text-slate-500" />
              <div>
                <div className="font-semibold">{property.size}m²</div>
                <div className="text-sm text-slate-500">Diện tích</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-500" />
              <div>
                <div className="font-semibold">{property.yearBuilt}</div>
                <div className="text-sm text-slate-500">Năm xây dựng</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-slate-500" />
              <div>
                <div className="font-semibold">{property.floor}</div>
                <div className="text-sm text-slate-500">Tầng</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Mô tả</h2>
            <p className="text-slate-600 leading-relaxed">{property.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-3">Tiện ích</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {property.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 text-slate-600">
                  <Check className="h-4 w-4 text-green-600" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin tòa nhà</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Tòa nhà</span>
                <span className="font-medium">{property.buildingName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Khu vực</span>
                <span className="font-medium">{property.area}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Loại phòng</span>
                <span className="font-medium">{property.roomType}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-slate-800 mb-4">
                {property.price.toLocaleString('vi-VN')}đ/tháng
              </div>
              <div className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Calendar className="h-4 w-4 mr-2" />
                      Đặt Lịch Hẹn
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Đặt Lịch Hẹn Xem</DialogTitle>
                    </DialogHeader>
                    <div className="pt-2 pb-1">
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 mb-4">
                        <p className="text-xs text-slate-500 mb-1">Bất động sản đang xem:</p>
                        <p className="font-semibold text-sm text-slate-900">{property.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{property.address}</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="book-name">Họ và tên</Label>
                          <Input
                            id="book-name"
                            value={bookingForm.name}
                            onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                            placeholder="Họ tên của bạn"
                          />
                        </div>
                        <div>
                          <Label htmlFor="book-phone">Số điện thoại</Label>
                          <Input
                            id="book-phone"
                            value={bookingForm.phone}
                            onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                            placeholder="Số điện thoại của bạn"
                          />
                        </div>
                        <div>
                          <Label htmlFor="book-date">Ngày đi xem</Label>
                          <Input
                            id="book-date"
                            type="date"
                            value={bookingForm.date}
                            onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="book-time">Giờ đi xem</Label>
                          <Input
                            id="book-time"
                            type="time"
                            value={bookingForm.time}
                            onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                          />
                        </div>
                        <Button className="w-full">Gửi yêu cầu</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" size="lg">
                      <Phone className="h-4 w-4 mr-2" />
                      Liên Hệ Môi Giới
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Liên Hệ Môi Giới</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Phone className="h-5 w-5 text-slate-600" />
                        <span className="text-lg font-medium">(028) 1234-5678</span>
                      </div>
                      <Button className="w-full" size="lg" asChild>
                        <a href="tel:02812345678">
                          <Phone className="h-4 w-4 mr-2" />
                          Gọi ngay
                        </a>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Map Preview */}
                <div
                  className="mt-1 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group relative"
                  onClick={() => setIsMapOpen(true)}
                >
                  <div className="relative h-40">
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed&z=16`}
                      className="w-full h-full pointer-events-none"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Vị trí trên bản đồ"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                        <Map className="h-4 w-4" />
                        Xem bản đồ
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-2 bg-white flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{property.address}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fullscreen Map Modal */}
          <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
              <DialogHeader className="px-6 pt-5 pb-3">
                <DialogTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Vị trí bất động sản
                </DialogTitle>
                <p className="text-sm text-slate-500 mt-0.5">{property.address}</p>
              </DialogHeader>
              <div className="h-[420px] relative">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed&z=16`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bản đồ vị trí"
                />
              </div>
              <div className="px-6 py-4 flex justify-between items-center border-t bg-slate-50">
                <span className="text-sm text-slate-600">{property.address}</span>
                <Button size="sm" asChild>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Mở Google Maps
                  </a>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
