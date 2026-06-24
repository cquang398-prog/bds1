'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

const contactInfo = [
  { icon: Phone, label: 'Hotline', value: '(028) 1234-5678', href: 'tel:02812345678' },
  { icon: Mail, label: 'Email', value: 'contact@realhome.vn', href: 'mailto:contact@realhome.vn' },
  { icon: MapPin, label: 'Địa chỉ', value: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM', href: null },
  { icon: Clock, label: 'Giờ làm việc', value: 'Thứ 2 – Thứ 7: 8:00 – 18:00', href: null },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">Liên Hệ Với Chúng Tôi</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Đội ngũ chuyên viên của chúng tôi luôn sẵn sàng hỗ trợ bạn tìm kiếm bất động sản phù hợp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            {contactInfo.map(({ icon: Icon, label, value, href }) => (
              <Card key={label}>
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="text-slate-800 font-medium hover:text-slate-600 transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="text-slate-800 font-medium">{value}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Gửi thành công!</h3>
                    <p className="text-slate-500">Chúng tôi sẽ phản hồi bạn trong vòng 24 giờ làm việc.</p>
                    <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
                      Gửi tin nhắn khác
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Gửi Tin Nhắn</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Họ và tên *</Label>
                        <Input id="fullName" name="fullName" placeholder="Nguyễn Văn A" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Số điện thoại *</Label>
                        <Input id="phone" name="phone" placeholder="0912 345 678" required className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="email@example.com" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="subject">Chủ đề</Label>
                      <Input id="subject" name="subject" placeholder="Tôi muốn hỏi về..." className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="message">Nội dung *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Mô tả chi tiết nhu cầu của bạn..."
                        required
                        rows={5}
                        className="mt-1 resize-none"
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Đang gửi...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Gửi tin nhắn
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
