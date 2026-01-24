
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    console.error('Missing environment variables. Check .env.local');
    process.exit(1);
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
});

async function run() {
    console.log('🚀 Starting Referral Commission Test...');

    // 1. Find a referrer (testdriver4567@gmail.com with TES-A831)
    const referralCode = 'TES-A831';
    console.log(`1. Using referrer with code: ${referralCode}`);

    // 2. Create referred user
    const email = `referred_driver_${Date.now()}@test.com`;
    console.log(`2. Creating referred driver: ${email}`);

    const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: 'password123',
        email_confirm: true,
        user_metadata: {
            full_name: 'Referred Driver Test',
            referral_code: referralCode // Our trigger handle_new_user should catch this
        }
    });

    if (userError || !user.user) {
        console.error('Error creating user:', userError);
        return;
    }

    console.log(`   User created: ${user.user.id}`);

    // 3. Ensure Driver Profile exists (The trigger should have created it, but we might need to wait or verify)
    // Actually, usually app creates it on onboarding. Let's create it manually for the test.
    const { data: profile, error: profileError } = await supabase
        .from('driver_profiles')
        .insert({
            user_id: user.user.id,
            status: 'active',
            whatsapp_number: '5566778899',
            city: 'Test City',
            profile_photo_url: 'https://via.placeholder.com/150',
            is_visible: true
        })
        .select('id')
        .single();

    if (profileError) {
        console.log('Driver profile creation skipped (might exist):', profileError.message);
    }
    const driverProfileId = profile?.id || (await supabase.from('driver_profiles').select('id').eq('user_id', user.user.id).single()).data?.id;

    console.log(`3. Driver Profile ID: ${driverProfileId}`);

    // 4. Simulate Membership via SQL (since Webhook isn't routed to local)
    // We update/insert into driver_memberships with origin='paid' and status='active'
    // This SHOULD trigger process_b2b_commission() in Postgres.
    console.log('4. Simulating Payment in Database...');
    const { error: membershipError } = await supabase
        .from('driver_memberships')
        .upsert({
            driver_profile_id: driverProfileId,
            origin: 'paid',
            status: 'active',
            stripe_subscription_id: 'sim_sub_' + Date.now(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        }, { onConflict: 'driver_profile_id' });

    if (membershipError) {
        console.error('Error simulating membership:', membershipError);
        return;
    }

    console.log('✅ Simulation finished! Checking results...');

    // 5. Verification
    // A. Check if the referrer's wallet was updated
    const { data: referrerWallet } = await supabase
        .from('wallets')
        .select('balance_pending')
        .eq('user_id', 'acb8028b-fc4b-4393-acef-f92d7dd7ac72') // ID for testdriver4567@gmail.com
        .single();

    console.log(`💰 Referrer Pending Balance: ${referrerWallet?.balance_pending}`);

    // B. Check if a transaction was recorded
    const { data: tx } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('source_reference_id', driverProfileId)
        .single();

    if (tx) {
        console.log('📊 Transaction Found:');
        console.log(`   Type: ${tx.transaction_type}`);
        console.log(`   Amount: ${tx.amount}`);
        console.log(`   Status: ${tx.status}`);
    } else {
        console.log('❌ No transaction found for this referral.');
    }
}

run().catch(console.error);
