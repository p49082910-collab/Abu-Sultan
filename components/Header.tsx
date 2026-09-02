'use client';
import { LogIn, LogOut, Wallet, ShoppingBag, Shield, Menu, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const { user, logout, loginAsCustomer, loginAsAdmin } = useAppStore();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const linkClass = (path: string) => `text-sm ${pathname === path ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`;
  return <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
      <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
        <img src="/logo.png" alt="شعار أبو سلطان" className="size-14 object-contain" />
        <div><p className="gold-text text-lg font-black leading-none">أبو سلطان</p><p className="mt-1 font-mono text-[9px] tracking-[.35em] text-muted-foreground">DIGITAL STORE</p></div>
      </Link>
      <button className="rounded-lg p-2 text-muted-foreground md:hidden" aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <nav className={`${open ? 'flex' : 'hidden'} absolute inset-x-4 top-[76px] flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-2xl md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
        {!user ? <><button onClick={loginAsCustomer} className="text-right text-sm text-muted-foreground hover:text-primary">دخول تجريبي للعميل</button><button onClick={loginAsAdmin} className="text-right text-sm text-muted-foreground hover:text-primary">دخول الإدارة</button><Link href="/auth" className="gold-shimmer rounded-xl px-5 py-2.5 text-center text-sm font-bold text-primary-foreground">ابدأ الآن</Link></> : <>
          {user.role === 'customer' && <><Link href="/store" className={linkClass('/store')}>المتجر</Link><Link href="/wallet" className={`flex items-center gap-2 ${linkClass('/wallet')}`}><Wallet size={16} />المحفظة <b className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">{user.balance} ر.س</b></Link><Link href="/purchases" className={`flex items-center gap-2 ${linkClass('/purchases')}`}><ShoppingBag size={16} />مشترياتي</Link></>}
          {user.role === 'admin' && <Link href="/admin" className={`flex items-center gap-2 ${pathname.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}><Shield size={16} />لوحة التحكم</Link>}
          <button onClick={logout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><LogOut size={16} />خروج</button>
        </>}
      </nav>
    </div>
  </header>;
}
