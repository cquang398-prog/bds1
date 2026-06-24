'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { properties, priceRanges, amenities, roomTypes, areas } from '@/lib/data/mock-data';
import { Filter, MapPin, Bed, Bath, Square, Search, SlidersHorizontal } from 'lucide-react';

const statusLabels: Record<string, string> = {
  available: 'Còn trống',
  rented: 'Đã cho thuê',
  sold: 'Đã bán',
  pending: 'Đang chờ',
};

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([500000, 100000000]);
  const [sizeRange, setSizeRange] = useState<number[]>([0, 500]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArea = !selectedArea || property.area === selectedArea;
      const matchesRoomType = !selectedRoomType || property.roomType === selectedRoomType;
      const matchesStatus = !selectedStatus || property.status === selectedStatus;
      const matchesPrice = property.price >= priceRange[0] && property.price <= priceRange[1];
      const matchesSize = property.size >= sizeRange[0] && property.size <= sizeRange[1];
      const matchesAmenities = selectedAmenities.length === 0 ||
        selectedAmenities.every((a) => property.amenities.includes(a));

      return matchesSearch && matchesArea && matchesRoomType && matchesStatus &&
        matchesPrice && matchesSize && matchesAmenities;
    });
  }, [searchQuery, selectedArea, selectedRoomType, selectedStatus, selectedAmenities, priceRange, sizeRange]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedArea('');
    setSelectedRoomType('');
    setSelectedStatus('');
    setSelectedAmenities([]);
    setPriceRange([500000, 100000000]);
    setSizeRange([0, 500]);
  };

  const hasActiveFilters = searchQuery || selectedArea || selectedRoomType || selectedStatus ||
    selectedAmenities.length > 0 || priceRange[0] > 500000 || priceRange[1] < 100000000 ||
    sizeRange[0] > 0 || sizeRange[1] < 500;

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Tìm kiếm</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm bất động sản..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Khoảng giá</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={500000}
            max={100000000}
            step={500000}
            className="w-full [&_[role=slider]]:transition-all [&_[role=slider]]:duration-150 [&_.range]:transition-all [&_.range]:duration-150"
          />
          <div className="flex justify-between mt-2 text-sm text-slate-600">
            <span>{(priceRange[0] / 1000000).toFixed(1).replace(/\.0$/, '')} triệu đ</span>
            <span>{(priceRange[1] / 1000000).toFixed(0)} triệu đ</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Diện tích (m²)</h3>
        <div className="px-2">
          <Slider
            value={sizeRange}
            onValueChange={setSizeRange}
            max={500}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-sm text-slate-600">
            <span>{sizeRange[0]}m²</span>
            <span>{sizeRange[1]}m²</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Khu vực</h3>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="area"
              checked={selectedArea === ''}
              onChange={() => setSelectedArea('')}
              className="h-4 w-4"
            />
            Tất cả khu vực
          </Label>
          {areas.map((area) => (
            <Label key={area.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="area"
                checked={selectedArea === area.name}
                onChange={() => setSelectedArea(area.name)}
                className="h-4 w-4"
              />
              {area.name}
            </Label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Loại phòng</h3>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="roomType"
              checked={selectedRoomType === ''}
              onChange={() => setSelectedRoomType('')}
              className="h-4 w-4"
            />
            Tất cả loại
          </Label>
          {roomTypes.map((type) => (
            <Label key={type.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="roomType"
                checked={selectedRoomType === type.name}
                onChange={() => setSelectedRoomType(type.name)}
                className="h-4 w-4"
              />
              {type.name}
            </Label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Trạng thái</h3>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              checked={selectedStatus === ''}
              onChange={() => setSelectedStatus('')}
              className="h-4 w-4"
            />
            Tất cả trạng thái
          </Label>
          {['available', 'rented', 'sold', 'pending'].map((status) => (
            <Label key={status} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={selectedStatus === status}
                onChange={() => setSelectedStatus(status)}
                className="h-4 w-4"
              />
              {statusLabels[status]}
            </Label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Tiện ích</h3>
        <div className="space-y-2">
          {amenities.map((amenity) => (
            <Label key={amenity.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedAmenities.includes(amenity.name)}
                onCheckedChange={() => toggleAmenity(amenity.name)}
              />
              {amenity.name}
            </Label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Bất Động Sản</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 hidden sm:inline">
            {filteredProperties.length} bất động sản được tìm thấy
          </span>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Bộ lọc
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] overflow-y-auto">
              <FilterContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto pr-1 scrollbar-thin">
            <FilterContent />
          </div>
        </aside>

        {/* Property Grid */}
        <div className="flex-1">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600">Không tìm thấy bất động sản</h3>
              <p className="text-slate-500 mt-2">Hãy thử điều chỉnh bộ lọc</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Link key={property.id} href={`/customer/properties/${property.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <div className="relative h-48">
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant={
                            property.status === 'available'
                              ? 'default'
                              : property.status === 'rented'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {statusLabels[property.status]}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <h3 className="text-lg font-semibold text-slate-800 line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="h-4 w-4" />
                        {property.area}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {property.bedrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          {property.bathrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <Square className="h-4 w-4" />
                          {property.size}m²
                        </span>
                      </div>
                      <p className="text-xl font-bold text-slate-800">
                        {property.price.toLocaleString('vi-VN')}đ/tháng
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
