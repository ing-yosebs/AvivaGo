'use client';

import { motion } from 'framer-motion';
import { Play, PlayCircle } from 'lucide-react';
import AvivaLogo from '@/app/components/AvivaLogo';

export default function WelcomeVideo() {
    return (
        <section className="relative w-full bg-aviva-navy overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-aviva-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-aviva-secondary/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-4 pt-8 pb-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight flex flex-wrap items-center justify-center gap-4">
                                <AvivaLogo className="h-10 md:h-12 w-auto" />
                                Descubre cómo <span className="text-aviva-primary">AvivaGo</span> transformará tu carrera
                            </h2>
                        </div>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Mira este breve video para entender por qué cientos de conductores profesionales están eligiendo nuestra plataforma.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/10 bg-black"
                    >
                        <iframe
                            className="absolute inset-0 w-full h-full"
                            src="https://www.youtube.com/embed/bLk0FTjRMms"
                            title="AvivaGo Welcome Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </motion.div>
                </div>
            </div>

            {/* Transition to next section */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
        </section>
    );
}
