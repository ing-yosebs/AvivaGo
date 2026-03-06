import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Try loading multiple env files
const envLocal = path.resolve(process.cwd(), '.env.local');
const env = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal });
if (fs.existsSync(env)) dotenv.config({ path: env });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in ENV');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function main() {
    const users = [
        { email: 'velezuela@avivago.com', password: 'demo1234', phone: '+580000000000', name: 'Conductor Venezuela', country: 'VE' },
        { email: 'colombia@avivago.com', password: 'demo1234', phone: '+570000000000', name: 'Conductor Colombia', country: 'CO' }
    ];

    for (const u of users) {
        console.log(`Creating ${u.email}...`);

        // 1. Delete if exists (Cleanup for idempotency)
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
        const found = existingUser.users.find(x => x.email === u.email);
        if (found) {
            console.log(`User ${u.email} already exists. Deleting first...`);
            await supabaseAdmin.auth.admin.deleteUser(found.id);
        }

        // 2. Create in Auth
        const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            phone: u.phone,
            phone_confirm: true,
            user_metadata: { full_name: u.name, role: 'driver' }
        });

        if (authError) {
            console.error(`Error creating auth user ${u.email}:`, authError.message);
            continue;
        }

        const userId = newUser.user.id;

        // 3. Upsert Public Users
        const { error: publicError } = await supabaseAdmin.from('users').upsert({
            id: userId,
            full_name: u.name,
            phone_number: u.phone,
            email: u.email,
            roles: ['driver']
        });

        if (publicError) console.error('Error public.users:', publicError.message);

        // 4. Upsert Driver Profiles (Injecting Country Code)
        const { error: profileError } = await supabaseAdmin.from('driver_profiles').upsert({
            user_id: userId,
            status: 'incomplete', // The constraint might be failing on 'active' without photo
            // wait, their default inserts often just leave everything null except user_id and status 'incomplete'
            // let's pass a dummy photo in case it violates
            profile_photo_url: 'https://placehold.co/400',
            country_code: u.country
        });

        if (profileError) console.error('Error driver_profiles:', profileError.message);

        console.log(`✅ Success for ${u.email} (${u.country})!`);
    }
}

main().catch(console.error);
