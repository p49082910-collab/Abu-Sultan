'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { BarChart3, PackageSearch, Users, Settings, Database, Plus, Check, X } from 'lucide-react';
import Image from 'next/image';

export default function AdminPage() {
  const { user, products, inventory, topupRequests, orders, settings, fetchInitialData } = useAppStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user || user.role !== 'admin') router.push('/');
    fetchInitialData();
  }, [user, router, fetchInitialData]);

  if (!user || user.role !== 'admin') return null;

  const totalSales = orders.reduce((sum, ord) => sum + ord.amount_paid, 0);
  const totalTopups = topupRequests.filter(r => r.status === 'approved').reduce((sum, req) => sum + req.amount, 0);
  const pendingTopups = topupRequests.filter(r => r.status === 'pending').length;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-[#16161D] border border-white/5 rounded-3xl p-4 sticky top-24 space-y-2">
            <TabButton icon={<BarChart3 />} label="نظرة عامة" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <TabButton icon={<PackageSearch />} label="المنتجات" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
            <TabButton icon={<Database />} label="المخزون الرقمي" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
            <TabButton icon={<Users />} label="طلبات الشحن" active={activeTab === 'topups'} onClick={() => setActiveTab('topups')} badge={pendingTopups} />
            <TabButton icon={<Settings />} label="إعدادات الموقع" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white mb-6">إحصائيات المنصة</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="إجمالي المبيعات" value={`${totalSales} ﷼`} />
                <StatCard title="إجمالي الشحن المعتمد" value={`${totalTopups} ﷼`} />
                <StatCard title="الطلبات المعلقة" value={pendingTopups} highlight />
                <StatCard title="إجمالي الأكواد المتوفرة" value={inventory.filter(i => !i.is_sold).length} />
              </div>
            </div>
          )}

          {activeTab === 'products' && (
             <div className="space-y-8">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-white">إدارة المنتجات</h2>
                 <button className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#F5D061] transition-colors">
                   <Plus size={16} /> إضافة منتج
                 </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {products.map(p => (
                   <div key={p.id} className="bg-[#16161D] border border-white/5 rounded-2xl p-4 flex gap-4 items-center">
                     <div className="w-20 h-20 relative rounded-lg overflow-hidden shrink-0 bg-[#0B0B0E]">
                        <Image src={p.image_url} alt={p.name} fill className="object-cover" referrerPolicy="no-referrer" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <h3 className="font-bold text-white truncate">{p.name}</h3>
                       <p className="text-[#F5D061] font-mono text-sm">{p.sale_price || p.price} <span className="text-[10px]">SAR</span></p>
                       <p className="text-xs text-gray-500 mt-1">{p.is_active ? 'مفعل' : 'معطل'}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {activeTab === 'inventory' && (
             <div className="space-y-8">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-white">المخزون الرقمي (الأكواد)</h2>
                 <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-700 border border-gray-700 transition-colors">
                   <Plus size={16} /> إضافة أكواد (Bulk)
                 </button>
               </div>
               <div className="bg-[#16161D] border border-white/5 rounded-3xl overflow-hidden">
                 <table className="w-full text-left border-collapse" dir="rtl">
                    <thead className="bg-[#0B0B0E] border-b border-white/5">
                      <tr className="text-gray-400 text-sm">
                        <th className="p-4 font-medium">المنتج</th>
                        <th className="p-4 font-medium">بيانات الحساب</th>
                        <th className="p-4 font-medium">الحالة</th>
                        <th className="p-4 font-medium">المشتري</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-white/5">
                      {inventory.map(inv => {
                        const prod = products.find(p => p.id === inv.product_id);
                        return (
                          <tr key={inv.id} className="hover:bg-white/5">
                            <td className="p-4 text-white">{prod?.name || 'مجهول'}</td>
                            <td className="p-4 font-mono text-gray-400" dir="ltr">{inv.account_username}:{inv.account_password?.slice(0,3)}***</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs ${inv.is_sold ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                {inv.is_sold ? 'مباع' : 'متوفر'}
                              </span>
                            </td>
                            <td className="p-4 text-gray-500">{inv.sold_to || '-'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                 </table>
               </div>
             </div>
          )}

          {activeTab === 'topups' && (
             <div className="space-y-8">
               <h2 className="text-2xl font-bold text-white mb-6">طلبات الشحن البنكي</h2>
               <div className="space-y-4">
                 {topupRequests.map(req => (
                   <div key={req.id} className="bg-[#16161D] border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6">
                     <div className="w-full sm:w-32 aspect-video bg-[#0B0B0E] rounded-lg relative overflow-hidden shrink-0 border border-white/5">
                        {req.receipt_image && <Image src={req.receipt_image} alt="Receipt" fill className="object-cover" referrerPolicy="no-referrer" />}
                     </div>
                     <div className="flex-1 text-center sm:text-right">
                       <p className="text-gray-400 text-xs mb-1">تاريخ الطلب: {new Date(req.created_at).toLocaleDateString('ar-SA')}</p>
                       <p className="text-xl font-bold text-[#F5D061] mb-2">{req.amount} <span className="text-[10px]">SAR</span></p>
                       <p className="text-sm">
                         الحالة: {req.status === 'pending' ? <span className="text-yellow-500">معلق</span> : req.status === 'approved' ? <span className="text-green-500">مقبول</span> : <span className="text-red-500">مرفوض</span>}
                       </p>
                     </div>
                     {req.status === 'pending' && (
                       <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                         <button onClick={() => useAppStore.getState().updateTopupRequestStatus(req.id, 'approved')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-2 rounded-xl hover:bg-green-500/20 transition-colors">
                           <Check size={18} /> قبول
                         </button>
                         <button onClick={() => useAppStore.getState().updateTopupRequestStatus(req.id, 'rejected')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500/20 transition-colors">
                           <X size={18} /> رفض
                         </button>
                       </div>
                     )}
                   </div>
                 ))}
                 {topupRequests.length === 0 && <p className="text-gray-500">لا توجد طلبات</p>}
               </div>
             </div>
          )}

          {activeTab === 'settings' && settings && (
             <div className="space-y-8 max-w-2xl">
               <h2 className="text-2xl font-bold text-white mb-6">إعدادات الدفع (الحساب البنكي)</h2>
               <div className="bg-[#16161D] border border-white/5 rounded-3xl p-8 space-y-6">
                 <div>
                   <label className="block text-sm text-gray-400 mb-2">اسم البنك</label>
                   <input type="text" defaultValue={settings.bank_name} className="w-full bg-[#0B0B0E] border border-white/5 rounded-xl p-3 text-white focus:border-[#D4AF37] outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm text-gray-400 mb-2">اسم صاحب الحساب</label>
                   <input type="text" defaultValue={settings.account_holder} className="w-full bg-[#0B0B0E] border border-white/5 rounded-xl p-3 text-white focus:border-[#D4AF37] outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm text-gray-400 mb-2">رقم الحساب</label>
                   <input type="text" defaultValue={settings.account_number} className="w-full bg-[#0B0B0E] border border-white/5 rounded-xl p-3 text-white focus:border-[#D4AF37] outline-none" dir="ltr" />
                 </div>
                 <div>
                   <label className="block text-sm text-gray-400 mb-2">الآيبان</label>
                   <input type="text" defaultValue={settings.iban} className="w-full bg-[#0B0B0E] border border-white/5 rounded-xl p-3 text-[#F5D061] font-mono focus:border-[#D4AF37] outline-none" dir="ltr" />
                 </div>
                 <button className="bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B0B0E] px-6 py-3 rounded-xl font-bold w-full shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:opacity-90 transition-colors">
                   حفظ الإعدادات
                 </button>
               </div>
             </div>
          )}
        </div>

      </main>
    </>
  );
}

function TabButton({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold border border-[#D4AF37]/20' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge ? (
        <span className="bg-[#D4AF37] text-black text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
      ) : null}
    </button>
  );
}

function StatCard({ title, value, highlight = false }: { title: string, value: string | number, highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-3xl border ${highlight ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'bg-[#16161D] border-white/5'}`}>
      <h3 className="text-sm text-gray-400 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${highlight ? 'text-[#F5D061]' : 'text-white'}`}>{value}</p>
    </div>
  );
}
