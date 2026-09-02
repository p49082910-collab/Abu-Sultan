'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { loginAsCustomer, loginAsAdmin } = useAppStore();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth logic
    if (identifier === 'admin') {
      loginAsAdmin();
      router.push('/admin');
    } else {
      loginAsCustomer();
      router.push('/store');
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md bg-[#16161D] backdrop-blur-md border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#F5D061]"></div>
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 flex items-center justify-center mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <img src="/logo.png" alt="أبو سلطان" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h1>
            <p className="text-gray-400 mt-2 text-sm text-center">
              {isLogin ? 'أهلاً بك مجدداً في متجر أبو سلطان' : 'انضم إلينا واستمتع بأفضل العروض'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                {isLogin ? 'اسم المستخدم، البريد، أو رقم الهاتف' : 'اسم المستخدم'}
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-[#0B0B0E] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder={isLogin ? 'أدخل بياناتك' : 'username'}
                dir="ltr"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">البريد الإلكتروني</label>
                  <input type="email" required className="w-full bg-[#0B0B0E] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">رقم الهاتف</label>
                  <input type="tel" required className="w-full bg-[#0B0B0E] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" dir="ltr" />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">كلمة المرور</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0B0B0E] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                dir="ltr"
              />
            </div>

            <button type="submit" className="w-full mt-6 bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#0B0B0E] font-bold py-3 rounded-xl hover:opacity-90 transition-opacity">
              {isLogin ? 'دخول' : 'تسجيل'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
            >
              {isLogin ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
