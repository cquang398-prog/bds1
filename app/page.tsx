import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center space-y-8 px-4">
        <div className="flex items-center justify-center gap-3">
          <Building2 className="h-12 w-12 text-slate-800" />
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800">EstatePro</h1>
        </div>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Hệ thống Quản lý Bất Động Sản Toàn diện. Chọn cổng thông tin bên dưới để bắt đầu.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="px-8">
            <Link href="/customer">
              <Building2 className="mr-2 h-5 w-5" />
              Cổng Khách Hàng
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="px-8">
            <Link href="/admin">
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Bảng Điều Khiển Quản Trị
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
