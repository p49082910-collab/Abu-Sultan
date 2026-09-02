'use client'
import { create } from 'zustand'
import { supabase } from './supabase'
import type { Profile, Product, DigitalInventory, TopupRequest, Order, SiteSettings } from './types'

interface AppState {
  user: Profile | null; products: Product[]; inventory: DigitalInventory[]; topupRequests: TopupRequest[]; orders: Order[]; settings: SiteSettings | null; isMock: boolean
  setUser: (user: Profile | null) => void; fetchInitialData: () => Promise<void>; logout: () => Promise<void>
  buyProduct: (productId: string) => Promise<{success:boolean; message:string; code?:DigitalInventory}>
  submitTopup: (amount:number, receiptUrl:string) => Promise<void>; updateTopupRequestStatus: (id:string,status:'approved'|'rejected') => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  user:null, products:[], inventory:[], topupRequests:[], orders:[], settings:null, isMock:false,
  setUser:user=>set({user}),
  fetchInitialData: async () => {
    const { data:{ user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { set({user:null}); return }
    const [{data: profile}, {data:products}, {data:inventory}, {data:topups}, {data:orders}, {data:settings}] = await Promise.all([
      supabase.from('profiles').select('id,email,role,balance,created_at').eq('id',authUser.id).single(),
      supabase.from('products').select('id,name,description,image_url,price,is_active,is_deal,created_at').order('created_at',{ascending:false}),
      supabase.from('digital_inventory').select('id,product_id,code,is_sold,sold_to,sold_at'),
      supabase.from('topup_requests').select('id,user_id,amount,receipt_url,status,reviewed_at,reviewed_by,created_at').order('created_at',{ascending:false}),
      supabase.from('orders').select('id,user_id,product_id,inventory_id,amount,created_at').order('created_at',{ascending:false}),
      supabase.from('site_settings').select('key,value'),
    ])
    set({user:profile as Profile|null,products:(products??[]).map(p=>({...p,image_url:p.image_url??''})) as Product[],inventory:(inventory??[]) as DigitalInventory[],topupRequests:(topups??[]).map(r=>({...r,receipt_image:r.receipt_url??undefined})) as TopupRequest[],orders:(orders??[]).map(o=>({...o,inventory_code_id:o.inventory_id,amount_paid:o.amount})) as Order[],settings:({key:'bank',...(settings??[]).reduce((acc,row)=>({...acc,[row.key]:row.value}),{})} as SiteSettings)})
  },
  logout: async()=>{ await supabase.auth.signOut(); set({user:null}) },
  buyProduct: async productId => {
    const {user,products,inventory}=get(); if(!user||user.role!=='customer') return {success:false,message:'يجب تسجيل الدخول كعميل'}
    const product=products.find(p=>p.id===productId); const code=inventory.find(i=>i.product_id===productId&&!i.is_sold)
    const price=product?.sale_price ?? product?.price
    if(!product) return {success:false,message:'المنتج غير موجود'}; if(!code) return {success:false,message:'نفد المخزون لهذا المنتج'}; if((user.balance??0)<(price??0)) return {success:false,message:'رصيد المحفظة غير كافٍ'}
    const {error:invError}=await supabase.from('digital_inventory').update({is_sold:true,sold_to:user.id,sold_at:new Date().toISOString()}).eq('id',code.id).eq('is_sold',false)
    if(invError) return {success:false,message:'تعذر إتمام الشراء'}
    const {error:balanceError}=await supabase.from('profiles').update({balance:user.balance-price!}).eq('id',user.id).eq('balance',user.balance)
    if(balanceError) { await supabase.from('digital_inventory').update({is_sold:false,sold_to:null,sold_at:null}).eq('id',code.id); return {success:false,message:'تعذر تحديث الرصيد'} }
    const {error:orderError}=await supabase.from('orders').insert({user_id:user.id,product_id:productId,inventory_id:code.id,amount:price})
    if(orderError) return {success:false,message:'تعذر حفظ الطلب'}
    await get().fetchInitialData(); return {success:true,message:'تم الشراء بنجاح',code:{...code,is_sold:true,sold_to:user.id}}
  },
  submitTopup: async(amount,receiptUrl)=>{const {user}=get(); if(!user) return; const {error}=await supabase.from('topup_requests').insert({user_id:user.id,amount,receipt_url:receiptUrl}); if(error) throw error; await get().fetchInitialData()},
  updateTopupRequestStatus: async(id,status)=>{const {error}=await supabase.rpc('approve_topup',{request_id:id,decision:status}); if(error) throw error; await get().fetchInitialData()},
}))
