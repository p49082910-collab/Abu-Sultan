export type Role = 'customer' | 'admin';

export interface Profile {
  id: string; // Auth UUID
  username: string;
  phone: string;
  balance: number;
  role: Role;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  sale_price: number | null;
  is_active: boolean;
  created_at: string;
}

export interface DigitalInventory {
  id: string;
  product_id: string;
  account_username?: string;
  account_password?: string;
  is_sold: boolean;
  sold_to?: string; // Profile ID
  sold_at?: string;
  created_at: string;
}

export interface TopupRequest {
  id: string;
  user_id: string;
  amount: number;
  receipt_image: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  inventory_code_id: string;
  amount_paid: number;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  bank_name: string;
  account_holder: string;
  account_number: string;
  iban: string;
  transfer_notes: string;
}
