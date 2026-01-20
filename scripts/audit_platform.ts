import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env from .env.local or .env manually
const envFiles = ['.env.local', '.env'];
let loaded = false;

for (const file of envFiles) {
    const envPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(envPath)) {
        console.log(`Loading env from ${file}`);
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values) {
                const val = values.join('=').trim().replace(/^["']|["']$/g, '');
                process.env[key.trim()] = val;
            }
        });
        loaded = true;
        break;
    }
}

if (!loaded) {
    console.warn('⚠️ No .env or .env.local file found');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
    console.log('🔍 Starting Platform Audit...\n');
    let issues = 0;

    // 1. Check for Drivers without User links
    const { data: drivers, error: driverError } = await supabase
        .from('driver_profiles')
        .select('id, user_id, profile_photo_url, users(id, full_name, avatar_url)');

    if (driverError) {
        console.error('Error fetching drivers:', driverError.message);
        return;
    }

    console.log(`Checking ${drivers?.length} driver profiles...`);
    const orphanedDrivers = drivers?.filter(d => !d.users);
    if (orphanedDrivers?.length > 0) {
        console.log(`❌ Found ${orphanedDrivers.length} orphaned drivers (no linked user)`);
        issues++;
    } else {
        console.log('✅ All drivers linked to users');
    }

    // 2. Check for Avatars
    const driversWithoutAvatar = drivers?.filter(d => {
        const userData = Array.isArray(d.users) ? d.users[0] : d.users;
        return userData && !userData.avatar_url && !d.profile_photo_url;
    });
    if (driversWithoutAvatar?.length > 0) {
        console.log(`⚠️ ${driversWithoutAvatar.length} drivers missing both User Avatar and Profile Photo`);
        // Not a critical error, but a warning
    } else {
        console.log('✅ All drivers have a photo source');
    }

    // 3. Check for Vehicles
    const { data: vehicles } = await supabase.from('vehicles').select('*');
    const driversWithVehicles = new Set(vehicles?.map(v => v.driver_profile_id));
    const driversWithoutVehicle = drivers?.filter(d => !driversWithVehicles.has(d.id));

    if (driversWithoutVehicle?.length > 0) {
        console.log(`⚠️ ${driversWithoutVehicle.length} drivers have no registered vehicles`);
    } else {
        console.log('✅ All drivers have at least one vehicle');
    }

    // 4. Check for Questionnaires/Services
    const { data: services } = await supabase.from('driver_services').select('*');
    const driversWithServices = new Set(services?.map(s => s.driver_profile_id));
    const driversWithoutServices = drivers?.filter(d => !driversWithServices.has(d.id));

    if (driversWithoutServices?.length > 0) {
        console.log(`⚠️ ${driversWithoutServices.length} drivers haven't completed their service configuration`);
    } else {
        console.log('✅ All drivers have configured their services');
    }

    console.log('\n-----------------------------------');
    if (issues === 0) {
        console.log('🎉 AUDIT COMPLETE: System Health is Good');
    } else {
        console.log(`🚨 AUDIT COMPLETE: Found critical issues`);
    }
}

runAudit();
