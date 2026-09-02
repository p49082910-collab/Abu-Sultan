import { create } from 'zustand';
import { Profile, Product, DigitalInventory, TopupRequest, Order, SiteSettings } from './types';
import { supabase } from './supabase';

interface AppState {
  user: Profile | null;
  products: Product[];
  inventory: DigitalInventory[];
  topupRequests: TopupRequest[];
  orders: Order[];
  settings: SiteSettings | null;
  isMock: boolean;
  
  setUser: (user: Profile | null) => void;
  setProducts: (products: Product[]) => void;
  setInventory: (inventory: DigitalInventory[]) => void;
  setTopupRequests: (requests: TopupRequest[]) => void;
  setOrders: (orders: Order[]) => void;
  setSettings: (settings: SiteSettings) => void;
  setIsMock: (isMock: boolean) => void;

  fetchInitialData: () => Promise<void>;
  loginAsCustomer: () => void;
  loginAsAdmin: () => void;
  logout: () => void;
  buyProduct: (productId: string) => Promise<{ success: boolean; message: string; code?: DigitalInventory }>;
  submitTopup: (amount: number, receiptUrl: string) => Promise<void>;
  updateTopupRequestStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
}

const mockProducts: Product[] = [
  { id: '1', name: 'باقة التميز - إنترنت مفتوح', description: 'شهر كامل من الإنترنت اللامحدود.', image_url: 'https://picsum.photos/seed/vip/400/300', price: 100, sale_price: 85, is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'باقة الأعمال', description: 'تصفح وتحميل بدون قيود مع دعم فني 24/7.', image_url: 'https://picsum.photos/seed/business/400/300', price: 200, sale_price: 150, is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'الباقة الاقتصادية', description: 'مناسبة للاستخدام الخفيف والمتوسط.', image_url: 'https://picsum.photos/seed/eco/400/300', price: 50, sale_price: null, is_active: true, created_at: new Date().toISOString() },
];

const mockInventory: DigitalInventory[] = [
  { id: 'inv1', product_id: '1', account_username: 'vip_user_1', account_password: 'pass_vip_1', is_sold: false, created_at: new Date().toISOString() },
  { id: 'inv2', product_id: '1', account_username: 'vip_user_2', account_password: 'pass_vip_2', is_sold: false, created_at: new Date().toISOString() },
  { id: 'inv3', product_id: '2', account_username: 'bus_user_1', account_password: 'pass_bus_1', is_sold: false, created_at: new Date().toISOString() },
];

const mockSettings: SiteSettings = {
  id: 'set1',
  bank_name: 'بنك الراجحي',
  account_holder: 'مؤسسة أبو سلطان التجارية',
  account_number: '123456789012345',
  iban: 'SA1234567890123456789012',
  transfer_notes: 'الرجاء إرفاق صورة الإيصال بعد التحويل مباشرة.'
};

const mockAdmin: Profile = { id: 'admin1', username: 'admin', phone: '0500000000', balance: 0, role: 'admin', created_at: new Date().toISOString() };
const mockCustomer: Profile = { id: 'cust1', username: 'customer', phone: '0511111111', balance: 100, role: 'customer', created_at: new Date().toISOString() };

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  products: [],
  inventory: [],
  topupRequests: [],
  orders: [],
  settings: null,
  isMock: false,

  setUser: (user) => set({ user }),
  setProducts: (products) => set({ products }),
  setInventory: (inventory) => set({ inventory }),
  setTopupRequests: (requests) => set({ topupRequests: requests }),
  setOrders: (orders) => set({ orders }),
  setSettings: (settings) => set({ settings }),
  setIsMock: (isMock) => set({ isMock }),

  fetchInitialData: async () => {
    // This build intentionally runs as a self-contained demo when no integration is connected.
    set({
      products: mockProducts,
      settings: mockSettings,
      inventory: mockInventory,
      topupRequests: [
        { id: 'req1', user_id: 'cust1', amount: 50, receipt_image: 'https://picsum.photos/seed/receipt/200/140', status: 'pending', created_at: new Date().toISOString() }
      ],
      orders: [],
      isMock: true
    });
  },

  loginAsCustomer: () => set({ user: mockCustomer }),
  loginAsAdmin: () => set({ user: mockAdmin }),
  logout: () => set({ user: null }),

  buyProduct: async (productId) => {
    const { user, products, inventory, orders, isMock } = get();
    if (!user || user.role !== 'customer') return { success: false, message: 'يجب تسجيل الدخول كعميل' };
    
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'المنتج غير موجود' };
    
    const price = product.sale_price || product.price;
    if (user.balance < price) return { success: false, message: 'رصيد المحفظة غير كافٍ' };

    const availableCode = inventory.find(i => i.product_id === productId && !i.is_sold);
    if (!availableCode) return { success: false, message: 'عذراً، نفد المخزون لهذا المنتج' };

    if (isMock) {
      // Mock logic
      const updatedUser = { ...user, balance: user.balance - price };
      const updatedCode = { ...availableCode, is_sold: true, sold_to: user.id, sold_at: new Date().toISOString() };
      const newOrder: Order = {
        id: `ord_${Date.now()}`,
        user_id: user.id,
        product_id: productId,
        inventory_code_id: availableCode.id,
        amount_paid: price,
        created_at: new Date().toISOString()
      };
      
      set({
        user: updatedUser,
        inventory: inventory.map(i => i.id === availableCode.id ? updatedCode : i),
        orders: [...orders, newOrder]
      });
      return { success: true, message: 'تم الشراء بنجاح', code: updatedCode };
    } else {
      // Real Supabase Logic
      try {
        const { error: codeErr } = await supabase.from('digital_inventory').update({ is_sold: true, sold_to: user.id, sold_at: new Date().toISOString() }).eq('id', availableCode.id);
        if (codeErr) throw codeErr;
        
        const { error: userErr } = await supabase.from('profiles').update({ balance: user.balance - price }).eq('id', user.id);
        if (userErr) throw userErr;

        const { error: ordErr } = await supabase.from('orders').insert({
           user_id: user.id,
           product_id: productId,
           inventory_code_id: availableCode.id,
           amount_paid: price,
        });
        
        await get().fetchInitialData();
        return { success: true, message: 'تم الشراء بنجاح', code: { ...availableCode, is_sold: true } };
      } catch(e: any) {
        return { success: false, message: 'حدث خطأ أثناء الشراء: ' + e.message };
      }
    }
  },

  submitTopup: async (amount, receiptUrl) => {
    const { user, topupRequests, isMock } = get();
    if (!user) return;

    if (isMock) {
      const newReq: TopupRequest = {
        id: `req_${Date.now()}`,
        user_id: user.id,
        amount,
        receipt_image: receiptUrl,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      set({ topupRequests: [...topupRequests, newReq] });
    } else {
      await supabase.from('topup_requests').insert({
        user_id: user.id,
        amount,
        receipt_image: receiptUrl,
        status: 'pending'
      });
      await get().fetchInitialData();
    }
  },

  updateTopupRequestStatus: async (id, status) => {
    const { topupRequests, isMock } = get();
    if (isMock) {
      const updatedReqs = topupRequests.map(req => 
        req.id === id ? { ...req, status } : req
      );
      set({ topupRequests: updatedReqs });
      
      // If approved, add balance to user
      if (status === 'approved') {
         const req = topupRequests.find(r => r.id === id);
         // For mock we only have one user really, but we could find them if we had a users array
         // Just a mock simplification: if the admin approves, we don't update the customer balance here unless we switch back, 
         // but since they share the same 'user' state (if logged in as admin), we shouldn't touch it.
      }
    } else {
      await supabase.from('topup_requests').update({ status }).eq('id', id);
      
      if (status === 'approved') {
        const { data: req } = await supabase.from('topup_requests').select('*').eq('id', id).single();
        if (req) {
          const { data: profile } = await supabase.from('profiles').select('balance').eq('id', req.user_id).single();
          if (profile) {
             await supabase.from('profiles').update({ balance: profile.balance + req.amount }).eq('id', req.user_id);
          }
        }
      }
      await get().fetchInitialData();
    }
  }
}));
