'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    const cleanEmail = email.trim()
    const result = isLogin
      ? await supabase.auth.signInWithPassword({ email: cleanEmail, password })
      : await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
            data: { username: username || '', phone: phone || '' },
          },
        })
    setBusy(false)
    if (result.error) {
      const errorText = result.error.message.toLowerCase()
      setMessage(errorText.includes('confirm') ? 'يرجى تأكيد بريدك الإلكتروني أولاً.' : errorText.includes('password') || errorText.includes('credential') ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'تعذر إتمام الطلب. حاول مرة أخرى.')
      return
    }
    if (isLogin) router.push('/store')
    else setMessage('تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب.')
  }

  return <><Header /><main className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4"><div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl"><div className="mb-8 text-center"><img src="/logo.png" alt="أبو سلطان" className="mx-auto size-20 object-contain" /><h1 className="mt-4 text-2xl font-bold">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h1><p className="mt-2 text-sm text-muted-foreground">{isLogin ? 'أهلاً بك مجدداً في متجر أبو سلطان' : 'انضم إلينا واستمتع بأفضل العروض'}</p></div><form onSubmit={submit} className="flex flex-col gap-4">{!isLogin && <><label className="flex flex-col gap-2 text-sm">اسم المستخدم<input type="text" value={username} onChange={e => setUsername(e.target.value)} className="rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" /></label><label className="flex flex-col gap-2 text-sm">رقم الجوال<input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="rounded-xl border border-border bg-background px-4 py-3 text-left outline-none focus:border-primary" dir="ltr" /></label></>}<label className="flex flex-col gap-2 text-sm">البريد الإلكتروني<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl border border-border bg-background px-4 py-3 text-left outline-none focus:border-primary" dir="ltr" /></label><label className="flex flex-col gap-2 text-sm">كلمة المرور<input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl border border-border bg-background px-4 py-3 text-left outline-none focus:border-primary" dir="ltr" /></label>{message && <p role="status" className="text-sm text-primary">{message}</p>}<button type="submit" disabled={busy} className="rounded-xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-60">{busy ? 'جاري المعالجة...' : isLogin ? 'دخول' : 'تسجيل'}</button></form><button type="button" onClick={() => { setIsLogin(value => !value); setMessage('') }} className="mt-6 w-full text-sm text-muted-foreground hover:text-primary">{isLogin ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب بالفعل؟ تسجيل الدخول'}</button></div></main></>
}
