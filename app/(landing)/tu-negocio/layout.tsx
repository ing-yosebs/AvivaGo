
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tu Negocio, Tus Reglas | AvivaGo - Red de Certeza',
    description: 'Únete a AvivaGo y obtén tu Web Personal. 0% Comisiones. Tú eliges tus clientes. Sé un Profesional de la Movilidad.',
    openGraph: {
        title: 'Tu Negocio, Tus Reglas | AvivaGo',
        description: 'Deja de ser un número. Conviértete en un Profesional de la Movilidad con tu propia Web Personal.',
        images: ['/artifacts/hero_driver_personal_web.png'],
    },
};

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}
