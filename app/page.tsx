'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, MapPin, Calendar as CalendarIcon, Clock, Send, 
  MessageCircle, Gift, Heart, Phone, Info, ChevronUp, X, Copy, Check, Navigation, ExternalLink, User, Image as ImageIcon, Sparkles, Scroll, Hash, Users, Camera, Download, Plus, Minus, Quote, CalendarDays
} from 'lucide-react';
import FallingPetals from '@/components/FallingPetals';
import FloatingElements from '@/components/FloatingElements';

interface RSVP {
  id: number;
  name: string;
  attendance: string;
  phone?: string;
  notes: string;
  guests: number;
}

// Premium Typewriter Component
const Typewriter = ({ text, delay = 0, className = "" }: { text: string, delay?: number, className?: string }) => {
  const characters = text.split("");
  
  return (
    <motion.p className={className}>
      {characters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.1,
            delay: delay + (i * 0.05),
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.p>
  );
};

// Premium Blur Reveal Component
const BlurReveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
    whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 1.2, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const [isOpened, setIsOpened] = useState(false);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<'gift' | 'contact' | 'location' | 'calendar' | null>(null);
  const [activeBank, setActiveBank] = useState<'maybank' | 'cimb'>('maybank');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hashtagCopied, setHashtagCopied] = useState(false);
  const [wishes, setWishes] = useState<RSVP[]>([]);
  const [totalGuests, setTotalGuests] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef<number>(0);

  // RSVP Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [attendance, setAttendance] = useState('Hadir');
  const [numGuests, setNumGuests] = useState(1);
  const [familyNames, setFamilyNames] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Check Local Storage on mount
  useEffect(() => {
    const hasSubmitted = localStorage.getItem('wedding_rsvp_submitted');
    if (hasSubmitted === 'true') {
      setSubmitStatus('success');
    }
  }, []);

  // Sync familyNames array size with numGuests
  useEffect(() => {
    if (numGuests > 1) {
      const currentCount = familyNames.length;
      const targetCount = numGuests - 1;
      if (currentCount < targetCount) {
        setFamilyNames([...familyNames, ...Array(targetCount - currentCount).fill('')]);
      } else if (currentCount > targetCount) {
        setFamilyNames(familyNames.slice(0, targetCount));
      }
    } else {
      setFamilyNames([]);
    }
  }, [numGuests]);

  const handleFamilyNameChange = (index: number, val: string) => {
    const updated = [...familyNames];
    updated[index] = val;
    setFamilyNames(updated);
  };

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const weddingDate = new Date('2026-08-30T11:00:00').getTime();

  useEffect(() => {
    fetchWishes();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate - now;
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  // Enhanced Auto Scroll Logic with requestAnimationFrame
  useEffect(() => {
    const scroll = () => {
      if (isAutoScrolling) {
        window.scrollBy(0, 0.7); 
        const isAtBottom = window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 5;
        if (isAtBottom) {
          setIsAutoScrolling(false);
        } else {
          requestRef.current = requestAnimationFrame(scroll);
        }
      }
    };
    if (isAutoScrolling) {
      requestRef.current = requestAnimationFrame(scroll);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isAutoScrolling]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const stopOnUser = () => {
      if (isAutoScrolling) setIsAutoScrolling(false);
    };

    if (isAutoScrolling) {
      timeout = setTimeout(() => {
        window.addEventListener('wheel', stopOnUser);
        window.addEventListener('touchmove', stopOnUser);
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('wheel', stopOnUser);
      window.removeEventListener('touchmove', stopOnUser);
    };
  }, [isAutoScrolling]);

  const fetchWishes = async () => {
    try {
      const res = await fetch('/api/rsvp');
      if (res.ok) {
        const data = await res.json();
        setWishes(data);
        const count = data.reduce((acc: number, curr: RSVP) => {
          if (curr.attendance === 'Hadir') return acc + (curr.guests || 1);
          return acc;
        }, 0);
        setTotalGuests(count);
      }
    } catch (err) {
      console.error('Failed to fetch wishes:', err);
    }
  };

  const handleOpen = () => {
    setIsEnvelopeOpen(true);
    setTimeout(() => {
      setIsOpened(true);
      setIsAutoScrolling(true);
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        setIsPlaying(true);
      }
    }, 1200);
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitErrorMessage('');
    const fnames = familyNames.filter(n => n).join(', ');
    const combinedNotes = fnames ? `${fnames}|||${notes}` : `|||${notes}`;
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          attendance, 
          guests: attendance === 'Hadir' ? numGuests : 0, 
          phone,
          notes: combinedNotes 
        }),
      });
      if (res.ok) {
        localStorage.setItem('wedding_rsvp_submitted', 'true');
        setSubmitStatus('success');
        setName('');
        setPhone('');
        setNotes('');
        setNumGuests(1);
        setFamilyNames([]);
        fetchWishes();
      } else {
        const data = await res.json();
        setSubmitErrorMessage(data.message || 'Gagal menghantar RSVP. Sila cuba lagi.');
        setSubmitStatus('error');
        setShowToast(true);
      }
    } catch (error) {
      setSubmitErrorMessage('Ralat rangkaian. Sila semak sambungan internet anda.');
      setSubmitStatus('error');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewRSVP = () => {
    localStorage.removeItem('wedding_rsvp_submitted');
    setSubmitStatus('idle');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCalendar = (type: 'google' | 'apple') => {
    const title = "Majlis Perkahwinan Muqri & Syamimi";
    const details = "Sila RSVP di website jemputan.";
    const location = "AM EVENT HALL, PT 15618, Jalan Kampung Lombong, SEKSYEN 29, 40460 Shah Alam, Selangor";
    const startDate = "20260830T110000";
    const endDate = "20260830T160000";

    if (type === 'google') {
      const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
      window.open(googleCalendarUrl, '_blank');
    } else {
      // Apple Calendar (iCal) format
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${details}`,
        `LOCATION:${location}`,
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\n");
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'wedding_event.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setActiveDrawer(null);
  };

  const copyAccount = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyHashtag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setHashtagCopied(true);
    setTimeout(() => setHashtagCopied(false), 2000);
  };

  const navLinks = {
    google: "https://www.google.com/maps/search/?api=1&query=AM+EVENT+HALL+Shah+Alam",
    waze: "https://waze.com/ul?q=AM+EVENT+HALL+Shah+Alam"
  };

  const contacts = [
    { name: 'Ayah (Mahmud)', phone: '60123456789' },
    { name: 'Ibu (Azizah)', phone: '60198765432' },
    { name: 'Muqri', phone: '60112233445' }
  ];

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#FCFBF8] text-[#1A1A1A] font-sans selection:bg-[#D4AF37]/20">
      <audio ref={audioRef} loop src="/puteri-asli.mp3" />

      {/* Global Floral Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.25]" style={{ backgroundImage: 'url("/bg-floral.png")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}></div>

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80">
        <FallingPetals />
        <FloatingElements />
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: -100, x: '-50%', opacity: 0 }}
            animate={{ y: 20, x: '-50%', opacity: 1 }}
            exit={{ y: -100, x: '-50%', opacity: 0 }}
            className="fixed top-0 left-1/2 z-[200] w-[90%] max-w-xs"
          >
            <div className="bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-400">
              <Info size={18} />
              <p className="text-[10px] font-black uppercase tracking-widest">{submitErrorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isOpened ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FCFBF8] p-6 overflow-hidden"
          >
            <motion.div 
              className="relative w-full max-sm aspect-[4/3] bg-[#FDFCFB] rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-[#E8E2D8] flex flex-col items-center justify-center overflow-hidden"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <motion.div 
                className="absolute top-0 left-0 w-full h-1/2 bg-[#F9F7F4] border-b border-[#E8E2D8] origin-top z-20"
                animate={isEnvelopeOpen ? { rotateX: -110, y: -20, opacity: 0 } : { rotateX: 0 }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
              />
              <motion.button
                onClick={handleOpen}
                disabled={isEnvelopeOpen}
                className="relative z-30 group"
                animate={isEnvelopeOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-16 h-16 bg-[#8C7355] rounded-full shadow-2xl flex items-center justify-center border-4 border-[#D4AF37]/30 group-hover:bg-[#D4AF37] transition-all duration-500">
                  <Sparkles className="text-white" size={24} />
                </div>
              </motion.button>
              <div className="absolute bottom-10 text-center px-8 z-10">
                <h2 className="text-[#8C7355] font-italiana tracking-[0.4em] text-[8px] uppercase mb-4">The Wedding of</h2>
                <h1 className="text-3xl font-serif text-[#1A1A1A] leading-tight mb-2">Muqri & Syamimi</h1>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mt-4">30 . 08 . 2026</p>
              </div>
            </motion.div>
            <motion.p animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-12 text-[9px] font-black uppercase tracking-[0.6em] text-[#8C7355]">Klik untuk buka</motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="invitation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative w-full min-h-screen flex flex-col items-center"
          >
            <div className="fixed top-6 right-6 z-[60] flex flex-col gap-3">
              <motion.button whileTap={{ scale: 0.9 }} onClick={toggleAudio} className="w-10 h-10 glass flex items-center justify-center text-[#8C7355] rounded-full shadow-lg border border-[#D4AF37]/10">
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsAutoScrolling(!isAutoScrolling)} className={`w-10 h-10 glass flex flex-col items-center justify-center rounded-full shadow-lg border transition-all duration-500 ${isAutoScrolling ? 'bg-[#D4AF37] text-white border-[#D4AF37]' : 'text-[#8C7355] border-[#D4AF37]/10'}`}>
                <Scroll size={16} /><span className="text-[5px] font-black uppercase mt-0.5">{isAutoScrolling ? 'OFF' : 'AUTO'}</span>
              </motion.button>
            </div>

            <section className="w-full max-w-2xl px-6 pt-24 pb-16 text-center">
              <Typewriter text="Assalammualaikum W.B.T" className="font-italiana text-lg text-[#D4AF37] mb-8 tracking-[0.2em]" />
              <div className="mb-16 space-y-6">
                <div className="space-y-1">
                  <Typewriter text="Mohd Shamsuddin Omar & Mariani Binti Hussein" delay={1.5} className="font-serif text-xl md:text-2xl text-[#1A1A1A]" />
                  <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2 }} className="text-[#D4AF37] font-italiana italic text-lg">&</motion.p>
                  <Typewriter text="Mohd Fauzi Bin Ariffin & Naimah Binti Hassan" delay={2.5} className="font-serif text-xl md:text-2xl text-[#1A1A1A]" />
                </div>
              </div>
              <div className="relative mb-20 flex flex-col items-center px-4">
                <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 4.5, duration: 1 }} className="w-full h-[0.5px] bg-[#E8E2D8] absolute top-1/2 -translate-y-1/2" />
                <div className="relative z-10 px-8 bg-[#FCFBF8] text-center">
                  <Typewriter text="Dengan penuh kesyukuran, kami mempersilakan" delay={4.5} className="text-[#7A7A7A] font-serif italic text-[10px] tracking-[0.2em] mb-4" />
                  <BlurReveal delay={5}>
                    <p className="text-[#8C7355] font-italiana text-[11px] font-bold tracking-[0.3em] mb-4 leading-relaxed uppercase">
                      Dato' | Datin | Tuan | Puan | Encik | Cik
                    </p>
                  </BlurReveal>
                  <Typewriter text="seisi keluarga hadir ke majlis perkahwinan anakanda-anakanda kami" delay={5.5} className="text-[#7A7A7A] font-serif italic text-[10px] tracking-[0.15em]" />
                </div>
              </div>
              <div className="mb-20">
                <BlurReveal delay={6}><h1 className="font-serif text-6xl md:text-8xl text-gradient leading-tight">Muqri</h1></BlurReveal>
                <BlurReveal delay={6.2}><div className="my-6"><Heart className="text-[#D4AF37] mx-auto opacity-20" size={32} /></div></BlurReveal>
                <BlurReveal delay={6.4}><h1 className="font-serif text-6xl md:text-8xl text-gradient leading-tight">Syamimi</h1></BlurReveal>
              </div>
            </section>

            <section className="w-full max-w-xl px-6 py-12 text-center">
              <BlurReveal>
                <div className="flex flex-col items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-[#F5F1E9] rounded-full flex items-center justify-center text-[#8C7355] shadow-inner"><Clock size={32} /></div>
                  <h3 className="font-serif text-2xl text-[#1A1A1A] tracking-widest uppercase">Menghitung Hari</h3>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Hari', value: timeLeft.days },
                    { label: 'Jam', value: timeLeft.hours },
                    { label: 'Minit', value: timeLeft.minutes },
                    { label: 'Saat', value: timeLeft.seconds }
                  ].map((item, idx) => (
                    <div key={item.label} className="bg-white p-5 rounded-[2rem] border border-[#E8E2D8] shadow-sm">
                      <span className="text-2xl md:text-3xl font-serif text-[#8C7355] block">{item.value}</span>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#7A7A7A]">{item.label}</span>
                    </div>
                  ))}
                </div>
              </BlurReveal>
            </section>

            <section id="calendar" className="w-full max-w-md px-6 py-16">
              <BlurReveal>
                <div className="bg-white rounded-[3rem] shadow-xl p-12 text-center border border-[#E8E2D8]">
                  <h3 className="font-serif text-2xl text-[#1A1A1A] mb-8">Ogos 2026</h3>
                  <div className="grid grid-cols-7 gap-3 text-[10px] font-black text-[#8C7355] mb-6 uppercase">
                    {['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'].map(d => <span key={d}>{d}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-3">
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1;
                      const isWeddingDay = day === 30;
                      return (
                        <div key={day} className={`aspect-square flex items-center justify-center rounded-2xl text-sm transition-all ${isWeddingDay ? 'bg-[#8C7355] text-white font-bold scale-125 shadow-lg' : 'text-[#7A7A7A]'}`}>
                          {day}
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => setActiveDrawer('calendar')} className="mt-12 w-full py-5 border border-[#D4AF37] text-[#D4AF37] rounded-3xl font-bold text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                    <CalendarIcon size={16} /> Simpan Tarikh
                  </button>
                </div>
              </BlurReveal>
            </section>

            <section id="gallery" className="w-full max-w-5xl px-6 py-24">
              <BlurReveal><div className="text-center mb-16 flex flex-col items-center gap-3"><Camera className="text-[#D4AF37] opacity-40" size={32} /><h3 className="font-serif text-4xl text-[#1A1A1A]">Galeri Memori</h3></div></BlurReveal>
              <div className="grid grid-cols-12 gap-6 px-4">
                {[
                  { src: '/couple.png', span: 'col-span-12 md:col-span-8 aspect-[16/10]' },
                  { src: '/rings.png', span: 'col-span-6 md:col-span-4 aspect-square' },
                  { src: '/venue.png', span: 'col-span-6 md:col-span-4 aspect-square' }
                ].map((img, i) => (
                  <motion.div key={i} onClick={() => setSelectedImage(img.src)} whileHover={{ scale: 1.02 }} className={`${img.span} rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white cursor-zoom-in`}>
                    <img src={img.src} alt="Gallery" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
            </section>

            <section id="location-section" className="w-full max-w-4xl px-6 py-20">
              <BlurReveal>
                <div className="bg-white rounded-[4rem] overflow-hidden shadow-2xl border border-[#E8E2D8] grid grid-cols-1 md:grid-cols-2">
                  <div className="p-12 md:p-20 flex flex-col items-center text-center justify-center bg-[#F5F1E9]/30">
                    <MapPin className="text-[#D4AF37] mb-8" size={32} />
                    <h4 className="font-serif text-3xl mb-4 text-[#1A1A1A]">Lokasi Majlis</h4>
                    <p className="font-italiana text-base font-bold text-[#8C7355] mb-2 uppercase">AM EVENT HALL</p>
                    <p className="font-serif italic text-sm text-[#7A7A7A] mb-12">PT 15618, Jalan Kampung Lombong, SEKSYEN 29, 40460 Shah Alam, Selangor</p>
                    <button onClick={() => setActiveDrawer('location')} className="w-full py-5 bg-[#1A1A1A] text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-xl">
                      <Navigation size={18} /> Navigasi Sekarang
                    </button>
                  </div>
                  <div className="h-[400px] md:h-auto relative">
                    <iframe src="https://maps.google.com/maps?q=AM%20EVENT%20HALL%20Shah%20Alam&t=&z=13&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
                  </div>
                </div>
              </BlurReveal>
            </section>

            <section className="w-full max-w-2xl px-6 py-20">
              <BlurReveal>
                <div className="text-center mb-16"><h3 className="font-serif text-3xl text-[#1A1A1A]">Aturcara Majlis</h3></div>
                <div className="space-y-12 relative">
                  <div className="absolute left-1/2 w-[0.5px] h-full bg-[#E8E2D8] -translate-x-1/2 top-0"></div>
                  {[
                    { time: '11:00 AM', event: 'Majlis Bermula', icon: <Sparkles size={16} /> },
                    { time: '12:30 PM', event: 'Ketibaan Pengantin', icon: <Heart size={16} /> },
                    { time: '04:00 PM', event: 'Majlis Berakhir', icon: <Pause size={16} /> }
                  ].map((item, idx) => (
                    <motion.div key={idx} whileHover={{ x: idx % 2 === 0 ? 10 : -10 }} className="flex items-center justify-center gap-10 relative z-10 group">
                      <div className="w-1/2 text-right text-xs font-bold text-[#8C7355] tracking-widest">{item.time}</div>
                      <div className="w-10 h-10 rounded-full bg-white shadow-lg border border-[#F5F1E9] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500">{item.icon}</div>
                      <div className="w-1/2 text-left text-sm text-[#7A7A7A] font-serif italic">{item.event}</div>
                    </motion.div>
                  ))}
                </div>
              </BlurReveal>
            </section>

            {/* Smart RSVP Section with Memory */}
            <section id="rsvp" className="w-full max-w-2xl px-6 py-24">
              <BlurReveal>
                <div className="bg-[#FDFCFB] p-10 md:p-16 rounded-[4rem] shadow-[0_30px_100px_-20px_rgba(140,115,85,0.15)] relative overflow-hidden border border-[#D4AF37]/20">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><Send size={120} className="text-[#8C7355]" /></div>
                  
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-[#F5F1E9] rounded-full border border-[#E8E2D8] mb-6">
                      <Users size={16} className="text-[#D4AF37]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#8C7355]">{totalGuests} Orang Akan Hadir</span>
                    </div>
                    <h3 className="font-serif text-4xl text-[#1A1A1A] mb-2">RSVP</h3>
                    <p className="text-[#D4AF37] font-italiana uppercase tracking-[0.4em] text-[10px]">Pendaftaran Kehadiran</p>
                  </div>

                  {submitStatus === 'success' ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                      <div className="w-20 h-20 bg-[#F5F1E9] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><Check className="text-[#D4AF37]" size={40} /></div>
                      <p className="font-serif text-3xl text-[#1A1A1A] mb-4">Terima Kasih!</p>
                      <p className="text-xs text-[#7A7A7A] italic font-serif leading-relaxed px-6">Pendaftaran anda telah berjaya. Terima kasih kerana sudi hadir memeriahkan majlis kami.</p>
                      <div className="mt-12 flex flex-col gap-4">
                        <button onClick={handleNewRSVP} className="w-full py-5 border-2 border-[#D4AF37] text-[#D4AF37] rounded-3xl font-black uppercase tracking-[0.4em] text-[9px] hover:bg-[#D4AF37] hover:text-white transition-all">Hantar RSVP Baru</button>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleRSVP} className="space-y-8">
                      <div className="space-y-6">
                        <div className="group">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[#8C7355] ml-4 mb-2 block">Nama Utama</label>
                          <div className="relative">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={18} />
                            <input type="text" placeholder="Nama penuh anda" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-16 pr-8 py-5 rounded-3xl bg-white border border-[#E8E2D8] outline-none text-sm shadow-sm focus:border-[#D4AF37] transition-all" />
                          </div>
                        </div>

                        <div className="group">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[#8C7355] ml-4 mb-2 block">No. Telefon</label>
                          <div className="relative">
                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={18} />
                            <input 
                              type="tel" 
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="Contoh: 0112345678" 
                              required 
                              value={phone} 
                              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} 
                              className="w-full pl-16 pr-8 py-5 rounded-3xl bg-white border border-[#E8E2D8] outline-none text-sm shadow-sm focus:border-[#D4AF37] transition-all" 
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[#8C7355] ml-4 mb-2 block">Status Kehadiran</label>
                          <div className="flex gap-4">
                            {['Hadir', 'Tidak Hadir'].map(status => (
                              <button key={status} type="button" onClick={() => setAttendance(status)} className={`flex-1 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${attendance === status ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-lg scale-[1.02]' : 'bg-white text-[#7A7A7A] border-[#E8E2D8]'}`}>{status}</button>
                            ))}
                          </div>
                        </div>

                        {attendance === 'Hadir' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 overflow-hidden">
                            <div className="p-8 bg-[#F5F1E9]/50 rounded-[2.5rem] border border-[#E8E2D8]">
                              <label className="text-[9px] font-black uppercase tracking-widest text-[#8C7355] mb-4 block text-center">Bilangan Orang</label>
                              <div className="flex items-center justify-center gap-8">
                                <button type="button" onClick={() => setNumGuests(Math.max(1, numGuests - 1))} className="w-12 h-12 rounded-full bg-white border border-[#E8E2D8] flex items-center justify-center text-[#8C7355] shadow-sm hover:border-[#D4AF37] transition-all"><Minus size={20} /></button>
                                <span className="font-serif text-4xl text-[#1A1A1A] w-12 text-center">{numGuests}</span>
                                <button type="button" onClick={() => setNumGuests(numGuests + 1)} className="w-12 h-12 rounded-full bg-white border border-[#E8E2D8] flex items-center justify-center text-[#8C7355] shadow-sm hover:border-[#D4AF37] transition-all"><Plus size={20} /></button>
                              </div>
                            </div>

                            <AnimatePresence>
                              {familyNames.map((fname, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="group">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-[#8C7355] ml-4 mb-2 block">Nama Ahli {idx + 1}</label>
                                  <div className="relative">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#D4AF37]/50" size={16} />
                                    <input type="text" placeholder={`Nama ahli keluarga #${idx + 1}`} required value={fname} onChange={(e) => handleFamilyNameChange(idx, e.target.value)} className="w-full pl-16 pr-8 py-4 rounded-2xl bg-white border border-[#E8E2D8] outline-none text-sm shadow-sm focus:border-[#D4AF37] transition-all" />
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>

                            <div className="group pt-4">
                              <label className="text-[9px] font-black uppercase tracking-widest text-[#8C7355] ml-4 mb-2 block">Ucapan (Opsional)</label>
                              <textarea placeholder="Tuliskan ucapan anda di sini..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-8 py-6 rounded-[2rem] bg-white border border-[#E8E2D8] outline-none text-sm shadow-sm focus:border-[#D4AF37] transition-all resize-none" />
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-[#1A1A1A] text-white rounded-3xl font-black uppercase tracking-[0.6em] text-[10px] shadow-2xl hover:bg-[#D4AF37] transition-all duration-500 flex items-center justify-center gap-4">
                        {isSubmitting ? <Sparkles className="animate-spin" size={16} /> : <Send size={16} />}
                        {isSubmitting ? 'MENGHANTAR...' : 'HANTAR RSVP'}
                      </button>

                      {submitStatus === 'error' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest text-red-600">{submitErrorMessage}</p>
                        </motion.div>
                      )}
                    </form>
                  )}
                </div>
              </BlurReveal>
            </section>

            <section className="w-full max-w-xl px-6 py-12 text-center">
              <BlurReveal>
                <div className="bg-[#F5F1E9] p-10 rounded-[3rem] border border-[#E8E2D8] flex flex-col items-center gap-6">
                  <Hash className="text-[#D4AF37]" size={32} />
                  <h4 className="font-serif text-2xl">Kongsi Momen Anda</h4>
                  <p className="text-xs text-[#7A7A7A] italic font-serif leading-relaxed px-4">Gunakan hashtag peribadi kami di media sosial untuk berkongsi kegembiraan majlis ini.</p>
                  <button onClick={() => copyHashtag('#MuqriSyamimi2026')} className="group relative px-10 py-5 bg-white rounded-2xl border-2 border-[#D4AF37]/30 flex items-center gap-4 hover:bg-[#D4AF37] transition-all duration-500">
                    <span className={`font-serif text-xl ${hashtagCopied ? 'text-white' : 'text-[#8C7355]'} group-hover:text-white transition-colors`}>#MuqriSyamimi2026</span>
                    {hashtagCopied ? <Check className="text-white" size={20} /> : <Copy className="text-[#D4AF37] group-hover:text-white" size={20} />}
                  </button>
                  {hashtagCopied && <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Hashtag Berhasil Disalin!</p>}
                </div>
              </BlurReveal>
            </section>

            <section id="wishes" className="w-full max-w-4xl px-6 py-20">
              <BlurReveal><div className="text-center mb-16 flex flex-col items-center gap-4"><Quote className="text-[#D4AF37] opacity-20" size={48} /><h3 className="font-serif text-4xl text-[#1A1A1A]">Ucapan Tetamu</h3></div></BlurReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar px-2">
                {wishes.map((wish) => {
                  const parts = wish.notes.split('|||');
                  const familyList = parts.length > 1 ? parts[0]?.trim() : '';
                  const message = parts.length > 1 ? parts[1]?.trim() : parts[0]?.trim();
                  
                  return (
                    <motion.div key={wish.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white p-10 rounded-[3rem] border border-[#E8E2D8] shadow-[0_15px_45px_-15px_rgba(140,115,85,0.1)] relative group hover:border-[#D4AF37]/30 transition-all duration-500">
                      {wish.guests > 1 && (
                        <div className="absolute top-8 right-10 flex items-center gap-2">
                          <Users size={12} className="text-[#D4AF37]" />
                          <span className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest">{wish.guests} PAX</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-[#F5F1E9] flex items-center justify-center text-[#8C7355] font-serif text-xl shadow-inner group-hover:bg-[#D4AF37] group-hover:text-white transition-colors duration-500">{wish.name[0]}</div>
                        <div>
                          <p className="font-bold text-base text-[#1A1A1A] leading-none mb-1">{wish.name}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${wish.attendance === 'Hadir' ? 'text-green-600' : 'text-red-500'}`}>{wish.attendance}</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <p className="text-sm text-[#4A4A4A] italic font-serif leading-relaxed relative z-10">
                          {message ? `"${message}"` : 'Terima kasih atas jemputan ini!'}
                        </p>
                        
                        {familyList && (
                          <div className="pt-6 border-t border-[#F5F1E9] flex flex-wrap gap-2">
                            {familyList.split(',').map((f, i) => (
                              <span key={i} className="px-3 py-1 bg-[#F5F1E9] text-[#8C7355] text-[8px] font-bold uppercase tracking-widest rounded-full">{f.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            <section className="w-full max-w-2xl px-6 py-16">
              <BlurReveal>
                <div className="relative glass rounded-[3rem] p-10 md:p-16 text-center border border-white/50 overflow-hidden">
                  <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("/doa-frame.png")', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
                  <div className="relative z-10 max-w-lg mx-auto">
                    <Heart className="text-[#D4AF37] mx-auto mb-8 opacity-40" size={24} />
                    <p className="font-serif text-lg md:text-xl text-[#1A1A1A] leading-relaxed italic mb-8">&quot;Ya Allah, berkatilah majlis perkahwinan ini, limpahkan baraqah dan rahmat kepada kedua mempelai ini. Kurniakanlah mereka zuriat yang soleh and solehah. Kekalkanlah jodoh mereka di dunia dan di akhirat.&quot;</p>
                    <p className="font-italiana text-[10px] tracking-[0.8em] text-[#8C7355] uppercase font-bold opacity-60">Aamiin</p>
                  </div>
                </div>
              </BlurReveal>
            </section>

            <div className="pb-40 pt-10 text-[10px] uppercase tracking-[1.2em] text-[#8C7355] font-black opacity-30">MUQRI & SYAMIMI • 2026</div>

            <motion.nav initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md glass rounded-full shadow-2xl px-8 py-4 z-50 flex items-center justify-between border border-white/20">
              {[
                { id: 'rsvp', icon: <Send size={20} />, label: 'RSVP' },
                { id: 'contact', icon: <Phone size={20} />, label: 'HUBUNGI' },
                { id: 'location', icon: <MapPin size={20} />, label: 'LOKASI' },
                { id: 'gallery', icon: <ImageIcon size={20} />, label: 'GALERI' },
                { id: 'gift', icon: <Gift size={20} />, label: 'HADIAH' },
              ].map((item) => (
                <button key={item.id} onClick={['contact', 'location', 'gift'].includes(item.id) ? () => setActiveDrawer(item.id as any) : () => scrollToSection(item.id)} className="flex flex-col items-center gap-1 group">
                  <div className="text-[#7A7A7A] group-hover:text-[#D4AF37] transition-all duration-500">{item.icon}</div>
                  <span className="text-[6px] font-black uppercase tracking-widest text-[#7A7A7A]">{item.label}</span>
                </button>
              ))}
            </motion.nav>

            <AnimatePresence>
              {activeDrawer && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveDrawer(null)} className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[60]" />
                  <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[4rem] p-12 z-[70] shadow-2xl overflow-y-auto max-h-[90vh]">
                    <div className="w-16 h-1.5 bg-[#F5F1E9] rounded-full mx-auto mb-10" />
                    <button onClick={() => setActiveDrawer(null)} className="absolute top-10 right-10 w-10 h-10 flex items-center justify-center bg-[#F5F1E9] rounded-full text-[#8C7355]"><X size={20} /></button>
                    
                    {activeDrawer === 'calendar' && (
                      <div className="text-center max-w-md mx-auto">
                        <CalendarDays className="text-[#D4AF37] mx-auto mb-6" size={48} />
                        <h3 className="font-serif text-3xl mb-4">Simpan Tarikh</h3>
                        <p className="text-xs text-[#7A7A7A] italic font-serif mb-10 px-6 leading-relaxed">Pilih jenis kalendar kegemaran anda untuk peringatan majlis.</p>
                        <div className="flex flex-col gap-4 mt-8">
                          <button onClick={() => handleCalendar('google')} className="py-6 bg-[#1A1A1A] text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-xl group hover:bg-[#3DDC84] transition-all duration-500">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9997.9993-.9997c.5511 0 .9993.4486.9993.9997s-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9997.9993-.9997c.5511 0 .9993.4486.9993.9997s-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1523-.5674.416.416 0 00-.5674.1523l-2.0223 3.503c-1.2835-.5843-2.7303-.9145-4.253-.9145s-2.9695.3302-4.253.9145l-2.0223-3.503a.4165.4165 0 00-.5674-.1523.416.416 0 00-.1523.5674l1.9973 3.4592C4.3015 10.9606 2.54 13.9213 2.54 17.301h18.92c0-3.3797-1.7615-6.3404-4.5782-8.0051"/></svg>
                            Android Calendar
                          </button>
                          <button onClick={() => handleCalendar('apple')} className="py-6 border-2 border-[#E8E2D8] text-[#1A1A1A] rounded-2xl font-bold text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 group hover:bg-black hover:text-white transition-all duration-500">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.066 11.23a4.53 4.53 0 002.164-3.81 4.67 4.67 0 00-3.13-4.38 4.96 4.96 0 00-3.59.39 5.25 5.25 0 01-2.22.54 5.17 5.17 0 01-2.2-.54 4.8 4.8 0 00-3.64-.42 4.69 4.69 0 00-3.16 4.38 4.54 4.54 0 002.17 3.82 4.53 4.53 0 00-2.17 3.82 4.68 4.68 0 003.14 4.39c.64.21 1.32.31 2 .3h.14c.78.01 1.55-.17 2.25-.52.6-.3 1.25-.45 1.9-.45s1.3.15 1.9.45c.7.35 1.47.53 2.25.52h.14a4.67 4.67 0 003.14-4.39 4.54 4.54 0 00-2.17-3.82zM12.036 3.11c.05-.85.42-1.64 1.03-2.22a3.15 3.15 0 012.3-.89 3.07 3.07 0 01-.06.88 3.32 3.32 0 01-1.01 2.1 3.2 3.2 0 01-2.26 1.13z"/></svg>
                            Apple / iPhone
                          </button>
                        </div>
                      </div>
                    )}

                    {activeDrawer === 'location' && (
                      <div className="text-center max-w-md mx-auto">
                        <MapPin className="text-[#D4AF37] mx-auto mb-6" size={48} />
                        <h3 className="font-serif text-3xl mb-4">Navigasi Lokasi</h3>
                        <div className="flex flex-col gap-4 mt-8">
                          <a href={navLinks.google} target="_blank" className="py-5 bg-[#1A1A1A] text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3"><ExternalLink size={18} /> Google Maps</a>
                          <a href={navLinks.waze} target="_blank" className="py-5 border-2 border-[#8C7355] text-[#8C7355] rounded-2xl font-bold text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3"><Navigation size={18} /> Waze Navigation</a>
                        </div>
                      </div>
                    )}
                    {activeDrawer === 'contact' && (
                      <div className="text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-6"><MessageCircle className="text-[#25D366]" size={32} /></div>
                        <h3 className="font-serif text-3xl mb-2">WhatsApp Kami</h3>
                        <div className="flex flex-col gap-4 mt-8">
                          {contacts.map((c) => (
                            <a key={c.name} href={`https://wa.me/${c.phone}`} target="_blank" className="flex items-center justify-between p-5 bg-white border-2 border-[#F5F1E9] rounded-2xl group hover:border-[#25D366] transition-all duration-300">
                              <div className="text-left"><p className="font-serif text-lg text-[#1A1A1A]">{c.name}</p><p className="text-[9px] text-[#7A7A7A] font-black uppercase">WhatsApp</p></div>
                              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg"><MessageCircle size={20} /></div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeDrawer === 'gift' && (
                      <div className="text-center max-lg mx-auto pb-10">
                        <Gift className="text-[#D4AF37] mx-auto mb-6" size={48} />
                        <h3 className="font-serif text-3xl mb-4">Salam Restu & Hadiah</h3>
                        <p className="text-xs text-[#7A7A7A] italic font-serif mb-10 px-6 leading-relaxed">Pemberian anda adalah tanda ingatan yang sangat kami hargai. Sila imbas QR di bawah untuk pemberian digital.</p>
                        
                        <div className="flex bg-[#F5F1E9] p-2 rounded-2xl mb-10 gap-2">
                          <button onClick={() => setActiveBank('maybank')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeBank === 'maybank' ? 'bg-white text-[#D4AF37] shadow-md' : 'text-[#7A7A7A]'}`}>Maybank</button>
                          <button onClick={() => setActiveBank('cimb')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeBank === 'cimb' ? 'bg-white text-[#8C1B1B] shadow-md' : 'text-[#7A7A7A]'}`}>CIMB Bank</button>
                        </div>

                        <AnimatePresence mode="wait">
                          <motion.div 
                            key={activeBank}
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white p-6 rounded-[3rem] border border-[#E8E2D8] shadow-xl flex flex-col items-center"
                          >
                            <div className="w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden mb-6 border-4 border-[#F5F1E9]">
                              <img src={activeBank === 'maybank' ? '/maybank_qr.png' : '/cimb_qr.png'} alt="QR Code" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-[10px] font-black text-[#8C7355] uppercase tracking-widest mb-2">{activeBank === 'maybank' ? 'Maybank DuitNow QR' : 'CIMB DuitNow QR'}</p>
                            <p className="font-serif text-lg mb-8 text-[#1A1A1A]">Mariani Binti Hussein</p>
                            
                            <div className="flex w-full gap-4">
                              <button onClick={() => copyAccount(activeBank === 'maybank' ? '123456789012' : '8012345678')} className="flex-1 py-5 bg-[#F5F1E9] text-[#8C7355] rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Salin' : 'Salin No.'}
                              </button>
                              <a href={activeBank === 'maybank' ? '/maybank_qr.png' : '/cimb_qr.png'} download className="flex-1 py-5 bg-[#1A1A1A] text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                <Download size={16} /> Simpan QR
                              </a>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {selectedImage && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6 backdrop-blur-sm">
                  <button className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors"><X size={32} /></button>
                  <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} src={selectedImage} alt="Fullscreen" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
