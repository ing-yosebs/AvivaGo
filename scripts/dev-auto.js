
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const STRIPE_EXE_PATH = 'C:\\Antigravity\\stripe.exe';
const ENV_FILE_PATH = path.join(__dirname, '..', '.env.local');
const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/stripe';

console.log('🚀 Iniciando Super-Automatización de AvivaGo...');

// 1. Iniciar el CLI de Stripe
const stripe = spawn(STRIPE_EXE_PATH, ['listen', '--forward-to', WEBHOOK_URL]);

stripe.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[Stripe] ${output.trim()}`);

    // Buscar el Webhook Secret en la salida
    const match = output.match(/whsec_[a-zA-Z0-9]+/);
    if (match) {
        const newSecret = match[0];
        console.log(`\n🔑 ¡Nuevo Webhook Secret detectado!: ${newSecret}`);

        // Leer .env.local y actualizar la variable
        if (fs.existsSync(ENV_FILE_PATH)) {
            let envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
            
            if (envContent.includes('STRIPE_WEBHOOK_SECRET=')) {
                // Reemplazar el existente
                envContent = envContent.replace(/STRIPE_WEBHOOK_SECRET=whsec_[a-zA-Z0-9]+|STRIPE_WEBHOOK_SECRET=whsec_placeholder_for_dev/, `STRIPE_WEBHOOK_SECRET=${newSecret}`);
            } else {
                // Añadirlo al final
                envContent += `\nSTRIPE_WEBHOOK_SECRET=${newSecret}`;
            }

            fs.writeFileSync(ENV_FILE_PATH, envContent);
            console.log('✅ Archivo .env.local actualizado automáticamente.\n');
        } else {
            console.error('❌ Error: No se encontró el archivo .env.local');
        }
    }
});

stripe.stderr.on('data', (data) => {
    console.error(`[Stripe Error] ${data.toString()}`);
});

// 2. Iniciar Next.js
console.log('📦 Iniciando Next.js...');
const next = spawn('npx', ['next', 'dev'], { shell: true });

next.stdout.on('data', (data) => {
    process.stdout.write(`[Next.js] ${data.toString()}`);
});

next.stderr.on('data', (data) => {
    process.stderr.write(`[Next.js Error] ${data.toString()}`);
});

// Manejo de cierre
process.on('SIGINT', () => {
    stripe.kill();
    next.kill();
    process.exit();
});
