"use server"
import Razorpay from "razorpay";
import crypto from "crypto";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { CREDIT_PACKAGES, CREDIT_COSTS } from "@/lib/credits";

// ─── Supabase helpers ───────────────────────────────────────────────────────

async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { cookieStore.set({ name, value, ...options }); },
        remove(name, options) { cookieStore.delete({ name, ...options }); },
      },
    }
  );
}

// Admin client bypasses all RLS — only used server-side for credit updates
function getSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// ─── Razorpay instance ──────────────────────────────────────────────────────

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



// ─── Get current user profile (credits balance) ─────────────────────────────

export async function getUserCredits() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Not authenticated" };

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("credits, full_name, email")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return { success: true, data: profile };
  } catch (error) {
    console.error("Failed to get user credits:", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Create Razorpay order ──────────────────────────────────────────────────

export async function createCreditsOrder(packageId) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Authentication required");

    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) throw new Error("Invalid credit package selected");

    // Razorpay amount is in paise (₹1 = 100 paise)
    const order = await razorpay.orders.create({
      amount: pkg.priceINR * 100,
      currency: "INR",
      receipt: `receipt_${user.id.substring(0, 8)}_${Date.now()}`,
      notes: {
        userId: user.id,
        packageId: pkg.id,
        credits: pkg.credits,
      },
    });

    return { success: true, order, package: pkg };
  } catch (error) {
    console.error("Order creation failed:", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Verify payment & credit the user ───────────────────────────────────────

export async function verifyCreditsPayment({ 
  razorpay_order_id, 
  razorpay_payment_id, 
  razorpay_signature, 
  packageId 
}) {
  try {
    const supabase = await getSupabaseServerClient();
    const adminClient = getSupabaseAdminClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Authentication required");

    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) throw new Error("Invalid credit package");

    // 1. Verify Razorpay HMAC signature — prevents payment fraud
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Payment signature verification failed. Possible fraud.");
    }

    // 2. Fetch current credit balance using admin client
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    const newCredits = (profile?.credits || 0) + pkg.credits;

    // 3. Update user credits using admin client (bypasses RLS)
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ credits: newCredits, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // 4. Record the transaction
    await adminClient.from("credit_transactions").insert({
      user_id: user.id,
      type: "purchase",
      amount: pkg.credits,
      description: `Purchased ${pkg.label} — ${pkg.credits} credits for ₹${pkg.priceINR}`,
      razorpay_order_id,
      razorpay_payment_id,
    });

    return { success: true, newCredits, creditsAdded: pkg.credits };
  } catch (error) {
    console.error("Payment verification failed:", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Deduct credits for a generation task ───────────────────────────────────

export async function deductCredits(taskType) {
  try {
    const supabase = await getSupabaseServerClient();
    const adminClient = getSupabaseAdminClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Authentication required");

    const cost = CREDIT_COSTS[taskType];
    if (!cost) throw new Error(`Unknown task type: ${taskType}`);

    // 1. Check current balance
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    const currentCredits = profile?.credits || 0;

    // 2. Block if insufficient
    if (currentCredits < cost) {
      return { 
        success: false, 
        insufficientCredits: true,
        error: `You need ${cost} credits for this action, but you only have ${currentCredits}.` 
      };
    }

    const newCredits = currentCredits - cost;

    // 3. Deduct credits
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ credits: newCredits, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // 4. Log the deduction
    await adminClient.from("credit_transactions").insert({
      user_id: user.id,
      type: `generation_${taskType}`,
      amount: -cost,
      description: `Used ${cost} credits for ${taskType.replace(/_/g, " ")} generation`,
    });

    return { success: true, newCredits, cost };
  } catch (error) {
    console.error("Credit deduction failed:", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Get user transaction logs from Supabase ───────────────────────────────

export async function getUserTransactions() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Not authenticated" };

    const { data: transactions, error } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback to adminClient in case of RLS constraints
      const adminClient = getSupabaseAdminClient();
      const { data: adminTransactions, error: adminError } = await adminClient
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (adminError) throw adminError;
      return { success: true, data: adminTransactions };
    }

    return { success: true, data: transactions };
  } catch (error) {
    console.error("Failed to get user transactions:", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Redeem a promo code / voucher ──────────────────────────────────────────
export async function redeemVoucher(code) {
  try {
    const codeClean = code.trim().toUpperCase();
    let reward = 0;
    if (codeClean === "WELCOME20") {
      reward = 20;
    } else if (codeClean === "POWER30") {
      reward = 30;
    } else {
      return { success: false, error: "Invalid or expired promo code" };
    }

    const supabase = await getSupabaseServerClient();
    const adminClient = getSupabaseAdminClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Authentication required");

    // 1. Check if user already redeemed this specific code in credit_transactions
    const { data: existingTx, error: txError } = await adminClient
      .from("credit_transactions")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "bonus")
      .like("description", `%Redeemed Promo Code: ${codeClean}%`);

    if (txError) throw txError;
    if (existingTx && existingTx.length > 0) {
      return { success: false, error: `Promo code ${codeClean} has already been redeemed.` };
    }

    // 2. Fetch current credit balance
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    const newCredits = (profile?.credits || 0) + reward;

    // 3. Update profile credits balance
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ credits: newCredits, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // 4. Record transaction log
    const { data: transaction, error: insertError } = await adminClient
      .from("credit_transactions")
      .insert({
        user_id: user.id,
        type: "bonus",
        amount: reward,
        description: `Redeemed Promo Code: ${codeClean} (+${reward} credits)`,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return { 
      success: true, 
      newCredits, 
      reward, 
      transaction 
    };
  } catch (error) {
    console.error("Voucher redemption failed:", error.message);
    return { success: false, error: error.message };
  }
}

