'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { DigitalInventory } from '@/lib/types';

export default function StorePage() {
  const { user, products, inventory, buyProduct, fetchInitialData } = useAppStore();
  const router = useRouter();
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [purchasedCode, setPurchasedCode] = useState<DigitalInventory | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) router.push('/');
    if (products.length === 0) fetchInitialData();
  }, [user, router, products.length, fetchInitialData]);

  if (!user) return null;

  const handleBuy = async (productId: string) => {
    setBuyingId(productId);
    setErrorMsg(null);
    setPurchasedCode(null);
    
    const result = await buyProduct(productId);
    
    if (result.success && result.code) {
      setPurchasedCode(result.code);
    } else {
      setErrorMsg(result.message);
    }
    setBuyingId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم النسخ بنجاح');
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 border-b border-gray-800 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">المتجر</h1>
            <p className="text-gray-400">تصفح الباقات واشترِ الحسابات فوراً</p>
          </div>
          <div className="text-left bg-gray-900 px-6 py-3 rounded-2xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">رصيدك الحالي</p>
            <p className="text-2xl font-bold text-[#D4AF37]">{user.balance} ﷼</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-950/50 border border-red-900 rounded-xl flex items-center gap-3 text-red-200">
            <AlertCircle className="text-red-500" />
            <p>{errorMsg}</p>
            {errorMsg.includes('رصيد') && (
              <button onClick={() => router.push('/wallet')} className="mr-auto px-4 py-1.5 bg-red-900/50 hover:bg-red-900 rounded-lg text-sm transition-colors">
                شحن المحفظة
              </button>
            )}
          </div>
        )}

        {purchasedCode && (
          <div className="mb-12 p-8 bg-green-950/30 border border-green-900/50 rounded-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400"></div>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">تم الشراء بنجاح!</h2>
            <p className="text-gray-400 mb-6">إليك بيانات الحساب الخاص بك، نرجو حفظها في مكان آمن.</p>
            
            <div className="max-w-md mx-auto bg-gray-950 border border-gray-800 rounded-xl p-6 text-left" dir="ltr">
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">اسم المستخدم / Username</p>
                <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-800">
                  <span className="font-mono text-lg text-[#D4AF37]">{purchasedCode.account_username}</span>
                  <button onClick={() => copyToClipboard(purchasedCode.account_username!)} className="text-gray-400 hover:text-white transition-colors">
                    <Copy size={18} />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">كلمة المرور / Password</p>
                <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-800">
                  <span className="font-mono text-lg text-white">{purchasedCode.account_password}</span>
                  <button onClick={() => copyToClipboard(purchasedCode.account_password!)} className="text-gray-400 hover:text-white transition-colors">
                    <Copy size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            <button onClick={() => setPurchasedCode(null)} className="mt-8 text-sm text-gray-400 hover:text-white underline underline-offset-4">
              إغلاق ومتابعة التسوق
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.filter(p => p.is_active).map(product => {
            const availableCount = inventory.filter(i => i.product_id === product.id && !i.is_sold).length;
            const isAvailable = availableCount > 0;
            const currentPrice = product.sale_price || product.price;

            return (
              <div key={product.id} className="bg-[#16161D] rounded-3xl p-6 border border-white/5 hover:border-[#D4AF37]/40 transition-all group flex flex-col">
                <div className="w-full aspect-[4/3] bg-[#0B0B0E] rounded-2xl mb-5 flex items-center justify-center overflow-hidden relative">
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${isAvailable ? 'bg-[#D4AF37] text-[#0B0B0E]' : 'bg-gray-600 text-white'}`}>
                      {isAvailable ? 'متوفر' : 'نفد'}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <h4 className="text-lg font-bold mb-1">{product.name}</h4>
                  <p className="text-xs text-gray-500 mb-4 flex-1">{product.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                      {product.sale_price ? (
                        <>
                          <span className="text-[10px] text-gray-500 line-through">{product.price} SAR</span>
                          <span className="text-xl font-bold text-[#F5D061]">{product.sale_price} <small className="text-[10px]">SAR</small></span>
                        </>
                      ) : (
                        <>
                           <span className="text-[10px] opacity-0">0</span>
                           <span className="text-xl font-bold text-[#F5D061]">{product.price} <small className="text-[10px]">SAR</small></span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <button
                    disabled={!isAvailable || buyingId === product.id}
                    onClick={() => handleBuy(product.id)}
                    className={`w-full mt-auto py-2 rounded-lg text-sm font-bold shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all ${
                      !isAvailable 
                        ? 'bg-white/5 text-gray-600 cursor-not-allowed shadow-none'
                        : buyingId === product.id
                          ? 'bg-[#D4AF37]/50 text-white cursor-wait shadow-none'
                          : 'bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B0B0E]'
                    }`}
                  >
                    <span>{buyingId === product.id ? 'جاري التنفيذ...' : 'شراء الآن'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
