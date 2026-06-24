'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Building2, Phone, Search, Heart, MessageSquare } from 'lucide-react';

export function CustomerHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (pathname === '/customer/properties') {
      setSearchValue(searchParams?.get('q') || '');
    } else {
      setSearchValue('');
    }
  }, [pathname, searchParams]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value) params.set('q', value);
    else params.delete('q');
    const qs = params.toString();
    router.replace(`/customer/properties${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const navLinks = [
    { href: '/customer', label: 'Trang chủ', icon: Home },
    { href: '/customer/properties', label: 'Tìm Kiếm', icon: Building2 },
    { href: '/customer/request-consultation', label: 'Tư vấn', icon: MessageSquare },
    { href: '/customer/favorites', label: 'Yêu thích', icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-4">

        {/* Left: Logo */}
        <Link href="/customer" className="flex items-center gap-2 flex-shrink-0">
          <Building2 className="h-6 w-6 text-slate-800" />
          <span className="text-xl font-bold text-slate-800">EstatePro</span>
        </Link>

        {/* Center: Search bar */}
        <div className="hidden md:flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Tìm bất động sản, địa chỉ, khu vực..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-1 transition-colors"
            />
          </div>
        </div>

        {/* Right: Nav + Contact + Mobile toggle */}
        <div className="flex items-center gap-2 justify-end">
          <nav className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Button size="sm" className="hidden md:flex" asChild>
            <Link href="/customer/contact">
              <Phone className="h-4 w-4 mr-2" />
              Liên hệ
            </Link>
          </Button>

          {/* Mobile hamburger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col gap-5 mt-8">
                {/* Mobile search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    placeholder="Tìm bất động sản..."
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-lg font-medium text-slate-600 hover:text-slate-900"
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
                <Button className="mt-2" asChild onClick={() => setIsOpen(false)}>
                  <Link href="/customer/contact">
                    <Phone className="h-4 w-4 mr-2" />
                    Liên hệ
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
