const APP_CONFIG = {
  supabaseUrl: "https://ylevptwxitbunizvkvzi.supabase.co",
  supabaseAnonKey: "sb_publishable_M5D49UWZF9Z-h58Tz-P5Tg_GWwcHloQ",
  razorpayKeyId: "YOUR_RAZORPAY_KEY_ID",
  currency: "INR",
};

function isSupabaseConfigured() {
  return (
    APP_CONFIG.supabaseUrl &&
    APP_CONFIG.supabaseAnonKey &&
    !APP_CONFIG.supabaseUrl.includes("YOUR_") &&
    !APP_CONFIG.supabaseAnonKey.includes("YOUR_")
  );
}

function isRazorpayConfigured() {
  return APP_CONFIG.razorpayKeyId && !APP_CONFIG.razorpayKeyId.includes("YOUR_");
}
