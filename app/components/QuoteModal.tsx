'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Calendar, Clock, Phone, FileText, Send, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { submitQuoteRequest } from '@/app/driver/actions';

// --- Modern Calendar Picker Sub-component ---
interface ModernCalendarPickerProps {
    value: string; // YYYY-MM-DD
    onChange: (val: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

const ModernCalendarPicker = ({ value, onChange, isOpen, onClose }: ModernCalendarPickerProps) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [viewDate, setViewDate] = useState(new Date(value + 'T12:00:00'));
    const [selectedDate, setSelectedDate] = useState(new Date(value + 'T12:00:00'));

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const daysShort = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Preceding empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-9 h-9 sm:w-10 sm:h-10" />);
        }

        // Days of the month
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const isToday = dateObj.toDateString() === today.toDateString();
            const isSelected = dateObj.toDateString() === selectedDate.toDateString();
            const isPast = dateObj < today;

            days.push(
                <button
                    key={d}
                    type="button"
                    disabled={isPast}
                    onClick={() => {
                        setSelectedDate(dateObj);
                        onChange(dateObj.toISOString().split('T')[0]);
                        onClose();
                    }}
                    className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all relative
                        ${isSelected ? 'bg-aviva-primary text-white shadow-lg' : isPast ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-blue-50 text-gray-600'}
                    `}
                >
                    {d}
                    {isToday && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-aviva-primary rounded-full" />}
                </button>
            );
        }
        return days;
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(newDate);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute z-[110] top-full left-0 right-0 mx-auto sm:mx-0 sm:left-0 sm:right-auto mt-2 bg-white rounded-[2rem] shadow-2xl border border-blue-50 p-4 sm:p-5 w-[280px] sm:w-[320px]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-4 px-2">
                <button type="button" onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <div className="text-sm font-bold text-aviva-navy">
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </div>
                <button type="button" onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {daysShort.map(d => (
                    <div key={d} className="text-[10px] font-bold text-gray-300 uppercase text-center py-2">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {renderDays()}
            </div>
        </motion.div>
    );
};
const CircularTimePicker = ({ value, onChange, isOpen, onClose }: CircularTimePickerProps) => {
    const [mode, setMode] = useState<'hours' | 'minutes'>('hours');
    const [hour, setHour] = useState(parseInt(value.split(':')[0]) % 12 || 12);
    const [minute, setMinute] = useState(parseInt(value.split(':')[1]));
    const [ampm, setAmpm] = useState(parseInt(value.split(':')[0]) >= 12 ? 'PM' : 'AM');

    useEffect(() => {
        const h = ampm === 'PM' ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
        const formatted = `${h.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        onChange(formatted);
    }, [hour, minute, ampm]);

    const handleNumberClick = (num: number) => {
        if (mode === 'hours') {
            setHour(num);
            setMode('minutes');
        } else {
            setMinute(num * 5 === 60 ? 0 : num * 5);
        }
    };

    const renderNumbers = () => {
        const nums = mode === 'hours' ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
        return nums.map((n, i) => {
            const angle = (i * 30) * (Math.PI / 180);
            const radius = typeof window !== 'undefined' && window.innerWidth < 640 ? 80 : 95;
            const x = Math.sin(angle) * radius;
            const y = -Math.cos(angle) * radius;
            const isSelected = mode === 'hours' ? hour === n : minute === n;

            return (
                <button
                    key={n}
                    type="button"
                    onClick={() => handleNumberClick(mode === 'hours' ? n : i)}
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                    className={`absolute w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition-all ${isSelected ? 'bg-aviva-primary text-white scale-110 shadow-lg' : 'hover:bg-blue-50 text-gray-600'}`}
                >
                    {n === 0 && mode === 'minutes' ? '00' : n}
                </button>
            );
        });
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute z-[110] top-full left-0 right-0 mx-auto sm:mx-0 sm:left-auto sm:right-0 mt-2 bg-white rounded-[2rem] shadow-2xl border border-blue-50 p-4 sm:p-6 w-[260px] sm:w-[280px]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setMode('hours')}
                        className={`text-2xl font-bold px-2 py-1 rounded-lg ${mode === 'hours' ? 'text-aviva-primary bg-blue-50' : 'text-gray-300'}`}
                    >
                        {hour.toString().padStart(2, '0')}
                    </button>
                    <span className="text-2xl font-bold text-gray-300">:</span>
                    <button
                        type="button"
                        onClick={() => setMode('minutes')}
                        className={`text-2xl font-bold px-2 py-1 rounded-lg ${mode === 'minutes' ? 'text-aviva-primary bg-blue-50' : 'text-gray-300'}`}
                    >
                        {minute.toString().padStart(2, '0')}
                    </button>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setAmpm('AM')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${ampm === 'AM' ? 'bg-white text-aviva-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        AM
                    </button>
                    <button
                        type="button"
                        onClick={() => setAmpm('PM')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${ampm === 'PM' ? 'bg-white text-aviva-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        PM
                    </button>
                </div>
            </div>

            <div className="relative w-full aspect-square flex items-center justify-center bg-gray-50 rounded-full border border-gray-100">
                {/* Hand */}
                <div
                    className="absolute w-1 bg-aviva-primary origin-bottom"
                    style={{
                        height: typeof window !== 'undefined' && window.innerWidth < 640 ? '65px' : '80px',
                        bottom: '50%',
                        transform: `rotate(${mode === 'hours' ? (hour % 12) * 30 : minute * 6}deg)`,
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <div className="absolute -top-1 left-1/2 -translateX-1/2 w-3 h-3 bg-white border-2 border-aviva-primary rounded-full" />
                </div>
                <div className="w-2 h-2 bg-aviva-primary rounded-full z-10" />

                {renderNumbers()}
            </div>

            <button
                type="button"
                onClick={onClose}
                className="w-full mt-6 py-3 bg-aviva-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all"
            >
                Confirmar Hora
            </button>
        </motion.div>
    );
};

interface QuoteModalProps {
    driverId: string;
    driverName: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function QuoteModal({ driverId, driverName, isOpen, onClose }: QuoteModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [phoneCode, setPhoneCode] = useState('52');
    const [phoneNumber, setPhoneNumber] = useState('');

    // Date & Time picker state
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    const timePickerRef = useRef<HTMLDivElement>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const displayDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
                setShowTimePicker(false);
            }
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        formData.append('driverId', driverId);

        // Combine date and time
        const date = formData.get('date');
        const time = formData.get('time');
        const fullDate = `${date}T${time}`;
        formData.set('scheduledDate', fullDate);

        // Combine phone code and number
        const fullPhone = `+${phoneCode}${phoneNumber}`;
        formData.set('contactPhone', fullPhone);

        const result = await submitQuoteRequest(formData);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false); // Reset for next time
            }, 3000);
        } else {
            alert(result.error || 'Error al enviar la solicitud');
        }
        setIsSubmitting(false);
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[30px] w-full max-w-[95vw] sm:max-w-xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="bg-aviva-primary p-6 text-white relative rounded-t-[30px]">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold font-display mb-1 text-white">Solicitar Cotización</h2>
                    <p className="text-blue-100 text-sm">Describe tu viaje para recibir una propuesta de {driverName}</p>
                </div>

                {success ? (
                    <div className="p-10 text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-aviva-navy">¡Solicitud Enviada!</h3>
                        <p className="text-gray-500">
                            Tu solicitud ha sido enviada con éxito. El conductor revisará los detalles y te contactará pronto.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-aviva-primary" />
                                    Día del Viaje
                                </label>
                                <div className="relative" ref={datePickerRef}>
                                    <div
                                        onClick={() => setShowDatePicker(!showDatePicker)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl group hover:bg-white hover:border-aviva-primary transition-all font-medium text-gray-700 flex items-center justify-between cursor-pointer"
                                    >
                                        <span>{displayDate}</span>
                                        <ChevronRight className={`w-4 h-4 text-gray-400 group-hover:text-aviva-primary transition-all ${showDatePicker ? 'rotate-90' : ''}`} />
                                    </div>
                                    <input type="hidden" name="date" value={selectedDate} />

                                    <AnimatePresence>
                                        {showDatePicker && (
                                            <ModernCalendarPicker
                                                value={selectedDate}
                                                onChange={setSelectedDate}
                                                isOpen={showDatePicker}
                                                onClose={() => setShowDatePicker(false)}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div className="space-y-2 relative" ref={timePickerRef}>
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-aviva-primary" />
                                    Hora Estimada
                                </label>
                                <div
                                    onClick={() => setShowTimePicker(!showTimePicker)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-aviva-primary focus-within:border-aviva-primary outline-none transition-all font-medium text-gray-700 flex items-center justify-between cursor-pointer hover:bg-white"
                                >
                                    <span>{selectedTime}</span>
                                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showTimePicker ? 'rotate-90' : ''}`} />
                                </div>
                                <input type="hidden" name="time" value={selectedTime} />

                                <AnimatePresence>
                                    {showTimePicker && (
                                        <CircularTimePicker
                                            value={selectedTime}
                                            onChange={setSelectedTime}
                                            isOpen={showTimePicker}
                                            onClose={() => setShowTimePicker(false)}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-aviva-primary" />
                                Tu Teléfono de Contacto (WhatsApp) *
                            </label>

                            <div className="flex gap-1">
                                <div className="phone-input-container !w-fit group relative h-[46px]">
                                    {/* MÁSCARA VISUAL DEL CÓDIGO */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 pl-10 pr-1 text-base md:text-sm text-gray-500 font-mono">
                                        +{phoneCode}
                                    </div>

                                    <PhoneInput
                                        country={'mx'}
                                        preferredCountries={['mx']}
                                        value={phoneCode}
                                        onChange={(val, country: any) => setPhoneCode(country.dialCode)}
                                        containerClass="!w-[90px] !h-full"
                                        inputClass="!hidden"
                                        buttonClass="!bg-gray-50 !border-gray-200 !rounded-xl !h-full !w-full !static !flex !items-center !justify-start !px-3 hover:!bg-gray-100 opacity-100 transition-colors"
                                        dropdownClass="!bg-white !text-[#0F2137] !border-gray-200 !rounded-xl"
                                        enableSearch
                                        disableSearchIcon
                                        specialLabel=""
                                    />
                                </div>

                                <input
                                    name="contactPhone"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setPhoneNumber(val);
                                    }}
                                    placeholder="Tu número local"
                                    required
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl h-[46px] px-4 outline-none focus:border-aviva-primary text-[#0F2137] font-mono text-base md:text-sm placeholder:text-gray-400 transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 pl-1">Número de WhatsApp donde el conductor podrá contactarte.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-aviva-primary" />
                                Detalles del Viaje
                            </label>
                            <textarea
                                name="details"
                                rows={4}
                                placeholder="Ej: Necesito transporte para 3 personas desde el Aeropuerto a Centro Histórico. Llevamos 2 maletas grandes..."
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-aviva-primary focus:border-aviva-primary outline-none transition-all resize-none"
                            ></textarea>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-aviva-primary text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Enviando...
                                    </>
                                ) : 'Enviar Solicitud'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
