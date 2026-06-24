import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { properties } from '@/lib/data/mock-data';
import { ArrowRight, MapPin, Bed, Bath, Square, Phone, Building2 } from 'lucide-react';

export default function CustomerHomePage() {
  const featuredProperties = properties.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Bất động sản"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Tìm Bất Động Sản Mơ Ước
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Khám phá ngôi nhà, căn hộ hoặc không gian thương mại hoàn hảo. Chúng tôi cung cấp đa dạng bất động sản phù hợp mọi phong cách sống và ngân sách.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-slate-900 hover:bg-white/90">
              <Link href="/customer/properties">
                Xem Bất Động Sản
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Bất Động Sản Nổi Bật</h2>
              <p className="text-slate-600 mt-2">Những bất động sản được chọn lọc dành cho bạn</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/customer/properties">
                Xem Tất Cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
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
                      <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
                        {property.status === 'available' ? 'Còn trống' : property.status === 'rented' ? 'Đã cho thuê' : property.status === 'sold' ? 'Đã bán' : 'Đang chờ'}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold text-slate-800">{property.title}</h3>
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
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-slate-800">500+</div>
              <div className="text-slate-600 mt-2">Bất động sản</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-800">1.200+</div>
              <div className="text-slate-600 mt-2">Khách hàng hài lòng</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-800">50+</div>
              <div className="text-slate-600 mt-2">Chuyên viên</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-800">15+</div>
              <div className="text-slate-600 mt-2">Năm kinh nghiệm</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            Tại Sao Chọn EstatePro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-slate-800" />
                </div>
                <h3 className="text-lg font-semibold">Đa Dạng Lựa Chọn</h3>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Tiếp cận hàng nghìn bất động sản trên khắp các khu vực. Từ căn hộ studio đến penthouse cao cấp.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-slate-800" />
                </div>
                <h3 className="text-lg font-semibold">Vị Trí Đắc Địa</h3>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Bất động sản tại những khu vực được săn đón nhất với kết nối giao thông và tiện ích hoàn hảo.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-slate-800" />
                </div>
                <h3 className="text-lg font-semibold">Hỗ Trợ Chuyên Nghiệp</h3>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Đội ngũ giàu kinh nghiệm luôn sẵn sàng hướng dẫn bạn trong mọi bước của hành trình tìm kiếm bất động sản.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
