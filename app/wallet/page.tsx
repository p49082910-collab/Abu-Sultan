'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { Wallet as WalletIcon, UploadCloud, Copy, CheckCircle, Clock, XCircle } from 'lucide-react';
import Image from 'next/image';

export default function WalletPage() {
  const { user, settings, topupRequests, submitTopup, fetchInitialData } = useAppStore();
  const router = useRouter();
  
  const [amount, setAmount] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'customer') router.push('/');
    if (!settings) fetchInitialData();
  }, [user, router, settings, fetchInitialData]);

  if (!user || !settings) return null;

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !receiptUrl) return alert('الرجاء إدخال المبلغ ورابط صورة الإيصال');
    
    setIsSubmitting(true);
    await submitTopup(Number(amount), receiptUrl);
    setAmount('');
    setReceiptUrl('');
    setIsSubmitting(false);
    alert('تم إرسال طلب الشحن بنجاح، سيتم مراجعته قريباً.');
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم النسخ');
  };

  const userRequests = topupRequests.filter(r => r.user_id === user.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#16161D] border border-[#D4AF37]/20 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_4px_20px_rgba(212,175,55,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -z-10"></div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <WalletIcon className="text-[#D4AF37]" size={32} />
                محفظتك الإلكترونية
              </h1>
              <p className="text-gray-400">اشحن رصيدك الآن لتتمكن من شراء الحسابات فوراً</p>
            </div>
            <div className="text-center md:text-left bg-[#16161D] p-6 rounded-2xl border border-white/5 min-w-[200px]">
              <p className="text-sm text-gray-500 mb-1">الرصيد المتاح</p>
              <p className="text-4xl font-extrabold text-[#F5D061]">{user.balance} <span className="text-xl text-[#F5D061]">SAR</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Bank Details */}
            <div className="bg-[#16161D] border border-white/5 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">معلومات الحساب البنكي</h2>
              <div className="space-y-4 text-left" dir="ltr">
                
                <div>
                  <p className="text-xs text-gray-500 mb-1 text-right">البنك</p>
                  <div className="bg-[#0B0B0E] p-4 rounded-xl border border-white/5 text-white font-medium text-right">
                    {settings.bank_name}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1 text-right">صاحب الحساب</p>
                  <div className="bg-[#0B0B0E] p-4 rounded-xl border border-white/5 text-white font-medium text-right">
                    {settings.account_holder}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1 text-right">رقم الحساب</p>
                  <div className="flex items-center justify-between bg-[#0B0B0E] p-4 rounded-xl border border-white/5">
                    <span className="font-mono text-lg text-white">{settings.account_number}</span>
                    <button onClick={() => copyText(settings.account_number)} className="text-[#D4AF37] hover:text-[#F5D061] transition-colors"><Copy size={20} /></button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1 text-right">الآيبان (IBAN)</p>
                  <div className="flex items-center justify-between bg-[#0B0B0E] p-4 rounded-xl border border-white/5">
                    <span className="font-mono text-lg text-[#F5D061]">{settings.iban}</span>
                    <button onClick={() => copyText(settings.iban)} className="text-gray-400 hover:text-white transition-colors"><Copy size={20} /></button>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-sm text-gray-400 bg-[#0B0B0E] p-4 rounded-lg border border-white/5">{settings.transfer_notes}</p>
            </div>

            {/* Topup Form */}
            <div className="bg-[#16161D] border border-white/5 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">رفع إثبات التحويل</h2>
              <form onSubmit={handleTopup} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">المبلغ المحول (ريال)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0B0B0E] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                    placeholder="مثال: 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">رابط صورة الإيصال</label>
                  <input
                    type="url"
                    required
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    className="w-full bg-[#0B0B0E] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] text-left"
                    placeholder="https://..."
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-2">مؤقتاً، يرجى رفع الصورة على مركز تحميل ولصق الرابط هنا.</p>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B0B0E] font-bold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
                >
                  <UploadCloud size={20} />
                  <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب للمراجعة'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* History */}
          <div className="bg-[#16161D] border border-white/5 rounded-3xl p-8 overflow-x-auto">
            <h2 className="text-xl font-bold text-white mb-6">سجل عمليات الشحن</h2>
            
            {userRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                لا توجد طلبات شحن سابقة
              </div>
            ) : (
              <table className="w-full text-left border-collapse" dir="rtl">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-sm">
                    <th className="pb-4 font-medium">رقم الطلب</th>
                    <th className="pb-4 font-medium">التاريخ</th>
                    <th className="pb-4 font-medium">المبلغ</th>
                    <th className="pb-4 font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {userRequests.map((req) => (
                    <tr key={req.id} className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/20">
                      <td className="py-4 font-mono text-gray-500">{req.id.slice(0, 8)}</td>
                      <td className="py-4 text-gray-300">{new Date(req.created_at).toLocaleDateString('ar-SA')}</td>
                      <td className="py-4 font-bold text-white">{req.amount} ﷼</td>
                      <td className="py-4">
                        {req.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"><Clock size={14} /> معلق</span>}
                        {req.status === 'approved' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20"><CheckCircle size={14} /> مقبول</span>}
                        {req.status === 'rejected' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20"><XCircle size={14} /> مرفوض</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </main>
    </>
  );
}
