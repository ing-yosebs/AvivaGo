import IdVerificationFlow from '@/app/components/IdVerificationFlow';

export default function VerifyIdPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-xl mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Verificación de Identidad
                </h1>
                <p className="text-zinc-400">
                    Sigue los pasos para validar tu cuenta de forma segura.
                </p>
            </div>

            <IdVerificationFlow />
        </div>
    );
}
