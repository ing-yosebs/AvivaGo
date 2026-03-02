'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export type OnboardingStepStatus = 'pending' | 'completed';

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  status: OnboardingStepStatus;
  isActionable?: boolean;
}

export interface OnboardingProgressResult {
  steps: OnboardingStep[];
  completedCount: number;
  totalSteps: number;
  allCompleted: boolean;
}

/**
 * Calculates current onboarding progress dynamically for a given driver
 */
export async function getDriverOnboardingProgress(driverId: string): Promise<OnboardingProgressResult> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch (error) { }
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch (error) { }
        },
      },
    }
  );

  // Run all independent queries to Supabase concurrently
  const [
    profileRes,
    servicesRes,
    vehiclesRes,
    clientsRes,
    membershipsRes
  ] = await Promise.all([
    supabase.from('driver_profiles').select('*, users!inner(full_name, avatar_url, phone_number, address_state, address_suburb, address_text)').eq('id', driverId).single(),
    supabase.from('driver_services').select('personal_bio, professional_questionnaire').eq('driver_profile_id', driverId).maybeSingle(),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('driver_profile_id', driverId),
    supabase.from('unlocks').select('*', { count: 'exact', head: true }).eq('driver_profile_id', driverId).eq('status', 'completed'),
    supabase.from('driver_memberships').select('*').eq('driver_profile_id', driverId).eq('status', 'active').gt('expires_at', new Date().toISOString())
  ]);

  const profile = profileRes.data;
  const driverServices = servicesRes.data;
  const vehiclesCount = vehiclesRes.count;
  const clientsCount = clientsRes.count;
  const memberships = membershipsRes.data;

  if (!profile) {
    throw new Error('Driver profile not found');
  }

  // Evaluate Step 1: Profile Details Complete
  const hasFullName = profile.users?.full_name && profile.users.full_name !== 'Sin Nombre';

  // Check photo in both users (avatar_url) and driver_profiles (profile_photo_url)
  const userPhoto = profile.users?.avatar_url || profile.profile_photo_url;
  const hasPhoto = userPhoto &&
    !userPhoto.includes('placeholder.com') &&
    !userPhoto.includes('placehold.co') &&
    !userPhoto.includes('ui-avatars.com');

  // Check city info in both tables (city in driver_profiles OR address fields in users)
  const hasCityInfo = (profile.city && profile.city !== 'Por Definir' && profile.city !== 'Sin Ciudad') ||
    (profile.users?.address_state && profile.users.address_state !== '' && profile.users.address_state !== 'Por Definir') ||
    (profile.users?.address_text && profile.users.address_text !== '');

  // Check phone in both tables
  const userPhone = profile.whatsapp_number || profile.users?.phone_number;
  const hasPhone = userPhone && userPhone !== '0000000000' && userPhone.length > 5;

  const isProfileComplete = Boolean(hasFullName && hasPhoto && hasCityInfo && hasPhone);

  // Evaluate Step 2: Professional & Personal Bio
  const personalBio = driverServices?.personal_bio || '';
  const isPersonalBioValid = personalBio.trim().length > 15;

  let professionalBio = '';
  if (driverServices?.professional_questionnaire && typeof driverServices.professional_questionnaire === 'object') {
    professionalBio = (driverServices.professional_questionnaire as any).bio || '';
  }
  const isProfessionalBioValid = professionalBio.trim().length > 15;

  const isServicesComplete = Boolean(isPersonalBioValid && isProfessionalBioValid);

  // Evaluate Step 3: Vehicles
  const isVehicleComplete = (vehiclesCount || 0) > 0;

  // Evaluate steps from flags (JSONB)
  const flags = profile.onboarding_flags || {};
  const isSharedLink = Boolean(flags.has_shared_link);
  const isDownloadedQr = Boolean(flags.has_downloaded_qr);
  const isViewedTips = Boolean(flags.has_viewed_tips);

  // Evaluate Step 7: Clients
  const hasClients = (clientsCount || 0) > 0;

  // Evaluate Step 8: Premium Membership
  const hasPremium = memberships && memberships.some(m => m.origin !== 'trial');

  // Define steps
  let completedCount = 0;

  const createStep = (
    id: number, title: string, description: string, ctaText: string, ctaLink: string, isComplete: boolean, isActionable: boolean = false
  ): OnboardingStep => {
    if (isComplete) completedCount++;
    return {
      id,
      title,
      description,
      ctaText,
      ctaLink,
      status: isComplete ? 'completed' : 'pending',
      isActionable
    };
  };

  const steps: OnboardingStep[] = [
    createStep(
      1,
      'Completa tu Perfil',
      'Un perfil completo transmite profesionalismo. Sube tu mejor foto y confirma tus datos para que los pasajeros sepan exactamente con quién viajan y te elijan siempre.',
      'Ir a Configuración de Perfil',
      '/perfil?tab=personal',
      isProfileComplete
    ),
    createStep(
      2,
      'Define tus Servicios',
      'Destaca sobre los demás. Escribe una buena reseña profesional y personal sobre ti para que los pasajeros conecten contigo y prefieran viajar exclusivamente contigo.',
      'Ir a Mis Servicios',
      '/perfil?tab=services',
      isServicesComplete
    ),
    createStep(
      3,
      'Registra tu Vehículo',
      '¡Presume tu auto! Sube fotos e información para dar confianza. Un auto increíble y limpio atrae a más pasajeros que querrán viajar contigo sin dudarlo.',
      'Ir a Vehículos',
      '/perfil?tab=vehicles',
      isVehicleComplete
    ),
    createStep(
      4,
      'Tu Enlace Personal',
      '¡Tu tarjeta de presentación digital! Obtén el enlace único de tu perfil y compártelo por WhatsApp o redes sociales. Haz que todos conozcan tu excelente servicio.',
      'Ver Mi Perfil',
      `/driver/${driverId}`,
      isSharedLink,
      true // We will track click manually from UI
    ),
    createStep(
      5,
      'Tu Código QR Mágico',
      '¡Tu mejor vendedor trabaja 24/7! Imprime tu QR desde Marketing, colócalo en tu auto e invita a tus pasajeros a registrarse en AvivaGo escaneándolo. Al inscribirse, se vincularán contigo de por vida para sus futuros viajes.',
      'Ir a Marketing',
      '/perfil?tab=marketing',
      isDownloadedQr,
      true
    ),
    createStep(
      6,
      '¡Conquista a tus Pasajeros!',
      'El secreto de los mejores: Explícales los beneficios de AvivaGo e invítalos a registrarse escaneando tu QR. Al crear su cuenta, te tendrán como su conductor de confianza para siempre.',
      'Ver Guía Exprés',
      '#modal-tips',
      isViewedTips,
      true
    ),
    createStep(
      7,
      'Haz Crecer tu Cartera',
      'Mira cómo crece tu lista personal de clientes que te buscarán primero. Mantente en contacto directo con ellos y asegúrate de tener viajes constantes sin depender del azar.',
      'Ir a Mis Clientes',
      '/cartera',
      hasClients || Boolean(flags.has_visited_clients), // Also complete if visited once
      true
    ),
    createStep(
      8,
      'Desbloquea Todo tu Potencial',
      '¡Felicidades, ya eres un experto! Lleva tu negocio al siguiente nivel: adquiere Premium para desbloquear herramientas exclusivas y multiplicar tus ganancias.',
      'Ver Membresías',
      '/perfil?tab=payments',
      hasPremium || Boolean(flags.has_visited_payments),
      true
    ),
  ];

  return {
    steps,
    completedCount,
    totalSteps: 8,
    allCompleted: completedCount === 8
  };
}

/**
 * Updates an onboarding flag manually (for steps 4, 5, 6, etc)
 */
export async function updateOnboardingFlag(driverId: string, flagKey: string, value: boolean = true) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { try { cookieStore.set({ name, value, ...options }); } catch (error) { } },
        remove(name: string, options: CookieOptions) { try { cookieStore.set({ name, value: '', ...options }); } catch (error) { } },
      },
    }
  );

  // Fetch current flags
  const { data } = await supabase.from('driver_profiles').select('onboarding_flags').eq('id', driverId).single();
  const currentFlags = data?.onboarding_flags || {};

  // Merge new flag
  const newFlags = { ...currentFlags, [flagKey]: value };

  // Update
  const { error } = await supabase.from('driver_profiles').update({ onboarding_flags: newFlags }).eq('id', driverId);
  if (error) {
    console.error('Error updating onboarding flag', error);
    return false;
  }
  return true;
}
