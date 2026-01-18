import { MOCK_DRIVERS } from '../../lib/mockData';
import ProfileView from '../../components/ProfileView';

export function generateStaticParams() {
    return MOCK_DRIVERS.map((driver) => ({
        id: driver.id.toString(),
    }));
}

export default function DriverPage({ params }: { params: { id: string } }) {
    const driver = MOCK_DRIVERS.find(d => d.id === parseInt(params.id));

    if (!driver) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-400">Conductor no encontrado</h1>
            </div>
        );
    }

    return <ProfileView driver={driver} />;
}
