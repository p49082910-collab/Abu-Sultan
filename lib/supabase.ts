// The storefront runs in standalone demo mode when no integration is selected.
// Keeping this narrow adapter preserves the store API without initializing a client.
const unavailable = () => { throw new Error('Supabase integration is not enabled in demo mode.'); };

export const supabase = { from: unavailable } as any;
export const supabaseAdmin = { from: unavailable } as any;
