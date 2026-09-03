export type Role = 'customer' | 'admin'
export interface Profile { id:string; email:string|null; username?:string; phone?:string; role:Role; balance:number; created_at:string }
export interface Product { id:string; name:string; description:string; image_url:string; price:number; sale_price?:number|null; is_active:boolean; is_deal?:boolean; created_at:string }
export interface DigitalInventory { id:string; product_id:string; code?:string; account_username?:string; account_password?:string; is_sold:boolean; sold_to?:string|null; sold_at?:string|null; created_at?:string }
export interface TopupRequest { id:string; user_id:string; amount:number; receipt_url?:string|null; receipt_image?:string; status:'pending'|'approved'|'rejected'; reviewed_at?:string|null; reviewed_by?:string|null; created_at:string }
export interface Order { id:string; user_id:string; product_id:string; inventory_id?:string|null; inventory_code_id?:string; amount?:number; amount_paid:number; created_at:string }
export interface SiteSettings { key?:string; value?:string; id?:string; bank_name:string; account_holder:string; account_number:string; iban:string; transfer_notes:string }
