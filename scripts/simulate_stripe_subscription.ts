
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
    apiVersion: '2025-12-15.clover', // Use latest or matching version
});

async function run() {
    console.log('🚀 Starting Stripe Simulation...');

    // 1. Create Dummy User & Profile
    const email = `driver_sim_${Date.now()}@test.com`;
    console.log(`1. Creating simulated user: ${email}`);

    const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: 'password123',
        email_confirm: true,
        user_metadata: { full_name: 'Stripe Sim Driver' }
    });

    if (userError || !user.user) {
        console.error('Error creating user:', userError);
        return;
    }

    // Create Driver Profile manually (if trigger didn't catch it or just to be sure)
    // We'll rely on trigger or just insert if missing.
    // Let's create it explicitly to ensure we have the ID.
    let driverProfileId;

    // Check if profile exists (Trigger might have created it)
    const { data: profile } = await supabase.from('driver_profiles').select('id').eq('user_id', user.user.id).single();

    if (profile) {
        driverProfileId = profile.id;
    } else {
        const { data: newProfile, error: profileError } = await supabase
            .from('driver_profiles')
            .insert({
                user_id: user.user.id,
                status: 'active',
                is_visible: true,
                profile_photo_url: 'https://via.placeholder.com/150',
                whatsapp_number: '5500000000',
                city: 'CDMX',
                bio: 'Simulated Driver for Stripe Test'
            })
            .select('id')
            .single();

        if (profileError) {
            // Fallback: maybe trigger created it in parallel?
            console.log('Profile creation error (might be trigger race):', profileError.message);
            // Try fetching again
            const { data: retryProfile } = await supabase.from('driver_profiles').select('id').eq('user_id', user.user.id).single();
            if (retryProfile) driverProfileId = retryProfile.id;
            else return;
        } else {
            driverProfileId = newProfile.id;
        }
    }

    console.log(`2. Driver Profile ID: ${driverProfileId}`);

    // 2. Create Stripe Customer
    console.log('3. Creating Stripe Customer...');
    const customer = await stripe.customers.create({
        email: email,
        metadata: {
            user_id: user.user.id,
            driver_profile_id: driverProfileId
        }
    });

    // 3. Create Subscription
    console.log('4. Creating Active Subscription...');
    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: process.env.STRIPE_PRICE_ID }],
        metadata: {
            driver_profile_id: driverProfileId,
            user_id: user.user.id,
            type: 'membership' // Tag it properly so webhook catches it
        },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
    });

    // Verify payment intent to force it to succeed (Test Clock simulation or just valid card via API?)
    // Actually, creating a sub in test mode usually starts as 'incomplete' until paid.
    // To make it 'active' instantly without frontend card entry, we might need a test card token?
    // Or we can just create a session? No, user wants back-end evidence.

    // Easier path: Mark invoice as paid (Stripe Testing trick)
    const invoiceId = subscription.latest_invoice as string | Stripe.Invoice;
    if (typeof invoiceId === 'string') {
        const invoice = await stripe.invoices.retrieve(invoiceId);
        if (invoice.status !== 'paid') {
            console.log('5. Finalizing Invoice (Pay with Test Card)...');
            await stripe.invoices.pay(invoice.id, {
                paid_out_of_band: true // Force pay in sandbox
            });
        }
    }

    console.log(`✅ SUCCESS! Subscription Created.`);
    console.log(`   Stripe Sub ID: ${subscription.id}`);
    console.log(`   Customer Email: ${email}`);
    console.log(`   Go to Dashboard: https://dashboard.stripe.com/test/subscriptions/${subscription.id}`);
}

run().catch(console.error);
