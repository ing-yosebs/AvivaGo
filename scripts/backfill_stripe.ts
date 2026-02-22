import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import * as dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: '.env.local' })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-12-15.clover' as any,
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log('🔄 Empezando sincronización con Stripe...')

    // 1. Obtener todos los pending_payments sin payment_method
    const { data: pendingPayments, error: ppError } = await supabase
        .from('pending_payments')
        .select('*')
        .is('payment_method', null)
        .order('created_at', { ascending: false })

    if (ppError) {
        console.error('Error obteniendo pending_payments', ppError)
        return
    }

    console.log(`Encontrados ${pendingPayments?.length} registros en pending_payments sin método de pago.`)

    let updatedCount = 0

    for (const payment of pendingPayments) {
        if (!payment.stripe_session_id) continue

        try {
            // Obtener la sesión de Stripe
            const session = await stripe.checkout.sessions.retrieve(payment.stripe_session_id, {
                expand: ['payment_intent']
            })

            let method = 'Desconocido'
            let status = payment.status
            let reason = payment.failure_reason

            // Intentar leer el payment_intent primero
            if (session.payment_intent) {
                const intent = session.payment_intent as Stripe.PaymentIntent
                const paymentMethod = intent.payment_method;

                if (paymentMethod && typeof paymentMethod !== 'string') {
                    method = (paymentMethod as any).type || 'Desconocido'
                } else {
                    method = session.payment_method_types?.[0] || 'Desconocido'
                }

                if (intent.status === 'succeeded' && status !== 'completed') {
                    status = 'completed'
                } else if (intent.last_payment_error) {
                    status = 'failed'
                    reason = intent.last_payment_error.message || 'Error de pago'
                }
            } else {
                method = session.payment_method_types?.[0] || 'Desconocido'

                if (session.status === 'expired') {
                    status = 'expired'
                    reason = 'Sesión expirada o abandonada'
                }
            }

            // Actualizar Supabase
            const { error: updateError } = await supabase
                .from('pending_payments')
                .update({
                    payment_method: method,
                    status: status,
                    failure_reason: reason,
                    last_attempt_at: new Date(session.created * 1000).toISOString()
                })
                .eq('id', payment.id)

            if (updateError) {
                console.error(`❌ Error actualizando PP ${payment.id}:`, updateError)
            } else {
                updatedCount++
                console.log(`✅ PP ${payment.id} actualizado a método: ${method}`)
            }

        } catch (error: any) {
            console.error(`⚠️ Stripe Error con sesión ${payment.stripe_session_id}:`, error.message)

            // Si no existe la sesión, la marcamos como perdida
            if (error.message.includes('No such checkout.session')) {
                await supabase
                    .from('pending_payments')
                    .update({
                        status: 'expired',
                        failure_reason: 'Sesión eliminada de Stripe o no encontrada',
                        payment_method: 'N/A'
                    })
                    .eq('id', payment.id)
            }
        }
    }

    console.log(`\n🎉 Finalizado. ${updatedCount} registros de pending_payments actualizados!`)
}

main().catch(console.error)
