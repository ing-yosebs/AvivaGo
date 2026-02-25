'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import {
    User,
    Car,
    CreditCard,
    Lock,
    Clock,
    Shield,
    Briefcase,
    LayoutDashboard,
    FileText,
    Eye,
    Tag
} from 'lucide-react'

// Sub-components
import PersonalDataSection from './components/PersonalDataSection'
import VehiclesSection from './components/VehiclesSection'
import ServicesSection from './components/ServicesSection'
import PaymentsSection from './components/PaymentsSection'

import SecuritySection from './components/SecuritySection'
import MembershipRequiredView from './components/MembershipRequiredView'
import BecomeDriverButton from './components/BecomeDriverButton'
import QuoteRequestsSection from './components/QuoteRequestsSection'
import MarketingSection from './components/MarketingSection'
import DriverDashboardSection from './components/DriverDashboardSection'

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-100 rounded-2xl w-1/4" />
                <div className="h-[400px] bg-gray-100 rounded-3xl" />
            </div>
        }>
            <ProfileContent />
        </Suspense>
    )
}

function ProfileContent() {
    const searchParams = useSearchParams()
    const urlTab = searchParams.get('tab')
    const [activeTab, setActiveTab] = useState(urlTab || 'personal')
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [isDriver, setIsDriver] = useState(false)
    const [vehicles, setVehicles] = useState<any[]>([])
    const [driverServices, setDriverServices] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [hasMembership, setHasMembership] = useState(false)
    const [isPlataOrHigher, setIsPlataOrHigher] = useState(false)
    const [pendingPayment, setPendingPayment] = useState<any>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const supabase = createClient()

    const loadProfile = async (userId?: string) => {
        let currentUserId = userId
        if (!currentUserId) {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            currentUserId = user.id
            setUser(user)
        }

        const { data: userData } = await supabase
            .from('users')
            .select('*, driver_profiles(*)')
            .eq('id', currentUserId)
            .single()

        if (userData) {
            const drvData = userData.driver_profiles
            delete userData.driver_profiles

            const enriched = { ...userData, driver_profile: drvData }
            setProfile(enriched)
            setIsDriver(userData.roles?.includes('driver'))
            return enriched
        }
    }

    const loadVehicles = async (driverProfileId: string) => {
        const { data: vhls } = await supabase
            .from('vehicles')
            .select('*')
            .eq('driver_profile_id', driverProfileId)
        setVehicles(vhls || [])
    }

    const loadServices = async (driverProfileId: string) => {
        const { data: services } = await supabase
            .from('driver_services')
            .select('*')
            .eq('driver_profile_id', driverProfileId)
            .single()

        setDriverServices(services || {
            driver_profile_id: driverProfileId,
            work_schedule: {},
            preferred_zones: [],
            languages: [],
            indigenous_languages: [],
            professional_questionnaire: {}
        })
    }

    useEffect(() => {
        const init = async () => {
            const userData = await loadProfile()
            if (!userData) {
                setLoading(false)
                return
            }

            const isUserDriver = userData?.roles?.includes('driver')
            const driverProfileId = userData.driver_profile?.id

            if (isUserDriver && driverProfileId) {
                // Parallelize secondary fetches
                const promises = [
                    loadVehicles(driverProfileId),
                    loadServices(driverProfileId),
                    // Check membership
                    supabase
                        .from('driver_memberships')
                        .select('status, expires_at, created_at')
                        .eq('driver_profile_id', driverProfileId)
                        .eq('status', 'active')
                        .gt('expires_at', new Date().toISOString())
                        .maybeSingle(),
                    // Check pending payments
                    supabase
                        .from('pending_payments')
                        .select('*')
                        .eq('user_id', userData.id)
                        .eq('status', 'open')
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle()
                ]

                const results = await Promise.all(promises)
                const membershipData = (results[2] as any)?.data
                const pendingPaymentData = (results[3] as any)?.data

                if (membershipData) {
                    setHasMembership(true)
                } else if (pendingPaymentData) {
                    setPendingPayment(pendingPaymentData)
                }

                if (urlTab) setActiveTab(urlTab)
            } else {
                if (urlTab === 'vehicles' || urlTab === 'services' || urlTab === 'trusted_drivers') {
                    setActiveTab('personal')
                } else if (urlTab) {
                    setActiveTab(urlTab)
                }
            }
            setLoading(false)
        }
        init()
    }, [supabase, urlTab])

    const handleSaveProfile = async (formData: any) => {
        if (profile?.is_banned) {
            setMessage({ type: 'error', text: 'Tu cuenta está suspendida. No puedes realizar cambios.' })
            return
        }

        setSaving(true)
        setMessage(null)
        try {
            const userFormData = { ...formData }
            const countryCode = userFormData.country_code
            delete userFormData.country_code
            delete userFormData.email

            if (userFormData.birthday === '') userFormData.birthday = null
            if (userFormData.education_level === '') userFormData.education_level = null

            const updatePromises = []

            // Update users table
            updatePromises.push(
                supabase
                    .from('users')
                    .update(userFormData)
                    .eq('id', user.id)
            )

            // Update driver_profiles if country_code changed
            if (countryCode && profile?.driver_profile?.id) {
                updatePromises.push(
                    supabase
                        .from('driver_profiles')
                        .update({ country_code: countryCode })
                        .eq('id', profile.driver_profile.id)
                )
            }

            const results = await Promise.all(updatePromises)
            for (const res of results) {
                if (res.error) throw res.error
            }

            await loadProfile(user.id)
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setSaving(false)
        }
    }

    const handleSaveServices = async (formData: any) => {
        // Security Check: Ban Status
        if (profile?.is_banned) {
            setMessage({ type: 'error', text: 'Tu cuenta está suspendida. No puedes realizar cambios.' })
            return
        }

        setSaving(true)
        setMessage(null)
        try {
            const { error } = await supabase
                .from('driver_services')
                .upsert({
                    driver_profile_id: driverServices.driver_profile_id,
                    ...formData,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'driver_profile_id' })

            if (error) throw error
            setMessage({ type: 'success', text: 'Servicios actualizados correctamente' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-100 rounded-2xl w-1/4" />
            <div className="h-[400px] bg-gray-100 rounded-3xl" />
        </div>
    )

    const tabs = [
        { id: 'personal', label: 'Datos Personales', icon: User },
        // If it's pure driver vs passenger toggle?
        // Ideally we should show trusted drivers if I am explicitly there OR if I am not a driver.
        // For now, let's make it available if activeTab matches, to ensure the Title renders correctly.
        ...(isDriver ? [
            { id: 'driver_dashboard', label: 'Panel Conductor', icon: LayoutDashboard },
            { id: 'services', label: 'Mis Servicios', icon: Clock },
            { id: 'vehicles', label: 'Mis Vehículos', icon: Car },

            { id: 'solicitudes', label: 'Mis Solicitudes', icon: Briefcase },
            { id: 'marketing', label: 'Marketing', icon: Tag }
        ] : []),
        { id: 'payments', label: isDriver ? 'Pagos y Membresía' : 'Mis Pagos', icon: CreditCard },
        { id: 'security', label: 'Seguridad', icon: Lock },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {activeTab !== 'marketing' && (
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#0F2137]">
                        {tabs.find(t => t.id === activeTab)?.label || 'Configuración'}
                    </h1>
                    <p className="text-gray-500">
                        {activeTab === 'payments'
                            ? 'Gestiona tu suscripción y consulta tu historial de pagos.'
                            : activeTab === 'services'
                                ? 'Administra tus servicios de transporte y configuraciones.'
                                : activeTab === 'driver_dashboard'
                                    ? 'Resumen de tu actividad y métricas como conductor.'
                                    : activeTab === 'solicitudes'
                                        ? 'Administra las cotizaciones recibidas de pasajeros interesados.'
                                        : 'Gestiona tu información personal y preferencias de la cuenta.'}
                    </p>

                    {!isDriver && !loading && (
                        <div className="mt-6">
                            <BecomeDriverButton />
                        </div>
                    )}
                </div>
            )}


            {/* Error/Success Messages */}
            {message && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${message.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    <div className={`p-1 rounded-full ${message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {message.type === 'success' ? <Check className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </div>
                    <p className="font-medium text-sm">{message.text}</p>
                    <button onClick={() => setMessage(null)} className="ml-auto opacity-50 hover:opacity-100">✕</button>
                </div>
            )}



            {/* Tab Panels */}
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-soft relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 transition-all duration-300">
                    {activeTab === 'personal' && (
                        <PersonalDataSection
                            key={profile?.id}
                            profile={profile}
                            onSave={handleSaveProfile}
                            saving={saving}
                            hasMembership={hasMembership}
                            isDriver={isDriver}
                        />
                    )}

                    {isDriver && activeTab === 'services' && (
                        <ServicesSection
                            key={profile?.id}
                            services={driverServices}
                            onSave={handleSaveServices}
                            saving={saving}
                            hasMembership={hasMembership}
                            driverProfileId={profile?.driver_profile?.id}
                            initialIsVisible={profile?.driver_profile?.is_visible}
                        />
                    )}

                    {isDriver && activeTab === 'vehicles' && (
                        <VehiclesSection
                            key={profile?.id}
                            vehicles={vehicles}
                            onAdd={() => loadVehicles(user.id)}
                            hasMembership={hasMembership}
                        />
                    )}




                    {activeTab === 'payments' && (
                        <PaymentsSection
                            key={profile?.id}
                            isDriver={isDriver}
                            hasMembership={hasMembership}
                            pendingPayment={pendingPayment}
                            driverStatus={profile?.driver_profile?.status}
                            driverProfileId={profile?.driver_profile?.id}
                            onPurchaseSuccess={() => setHasMembership(true)}
                            profile={profile}
                            vehicles={vehicles}
                            services={driverServices}
                        />
                    )}

                    {activeTab === 'security' && (
                        <SecuritySection key={profile?.id} profile={profile} />
                    )}

                    {isDriver && activeTab === 'solicitudes' && (
                        <QuoteRequestsSection driverProfileId={profile?.driver_profile?.id} />
                    )}

                    {isDriver && activeTab === 'driver_dashboard' && (
                        <DriverDashboardSection userId={profile?.id} />
                    )}

                    {isDriver && activeTab === 'marketing' && (
                        <MarketingSection
                            profile={profile}
                            hasMembership={hasMembership}
                            isPlataOrHigher={isPlataOrHigher}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

function Check({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
}
