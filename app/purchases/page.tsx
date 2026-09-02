'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { Copy, Calendar, Package } from 'lucide-react';
import Image from 'next/image';

export default function PurchasesPage() {
  const { user, orders, inventory, products } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'customer') router.push('/');
  }, [user, router]);

  if (!user) return null;

  const userOrders = orders.filter(o => o.user_id === user.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم النسخ');
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 border-b border-gray-800 pb-8">
          <h1 className="text-3xl font-bold text-white mb-2">مشترياتي</h1>
          <p className="text-gray-400">أرشيف كامل لجميع الباقات والحسابات التي قمت بشرائها.</p>
        </div>

        {userOrders.length === 0 ? (
          <div className="text-center py-24 bg-[#16161D] rounded-3xl border border-white/5">
            <Package size={64} className="mx-auto text-gray-700 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">لا توجد مشتريات بعد</h2>
            <p className="text-gray-400">تصفح المتجر واشترِ باقتك الأولى الآن!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {userOrders.map(order => {
              const code = inventory.find(i => i.id === order.inventory_code_id);
              const product = products.find(p => p.id === order.product_id);
              
              if (!code || !product) return null;

              return (
                <div key={order.id} className="bg-[#16161D] border border-white/5 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                  <div className="w-full md:w-48 aspect-square relative bg-[#0B0B0E] shrink-0">
                     <Image src={product.image_url} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white">{product.name}</h3>
                        <span className="font-mono text-sm text-[#0B0B0E] font-bold bg-gradient-to-r from-[#D4AF37] to-[#F5D061] px-2 py-1 rounded-md">{order.amount_paid} SAR</span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-6">
                        <Calendar size={14} />
                        {new Date(order.created_at).toLocaleString('ar-SA')}
                      </p>
                    </div>

                    <div className="bg-[#0B0B0E] rounded-xl p-4 border border-white/5 space-y-3" dir="ltr">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[#F5D061] font-medium">{code.account_username}</span>
                        <button onClick={() => copyText(code.account_username!)} className="text-gray-500 hover:text-white transition-colors" title="نسخ اسم المستخدم">
                          <Copy size={16} />
                        </button>
                      </div>
                      <div className="h-px w-full bg-white/5"></div>
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-white font-medium">{code.account_password}</span>
                        <button onClick={() => copyText(code.account_password!)} className="text-gray-500 hover:text-white transition-colors" title="نسخ كلمة المرور">
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
