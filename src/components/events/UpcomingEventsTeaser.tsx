"use client";

import { useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { MapPin, ArrowRight, X, Calendar, Ticket, QrCode, ChevronRight } from "lucide-react";

/* CSS-only barcode animation — no JS needed */
const barcodeStyle = `
@keyframes barPulse {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1); }
}
.barcode-group:hover .bar-line {
  animation: barPulse 0.4s ease-in-out infinite alternate;
}
.barcode-group:hover .bar-line:nth-child(odd) { animation-delay: 0.1s; }
.barcode-group:hover .bar-line:nth-child(3n) { animation-delay: 0.2s; }
`;

/* ---------------- TYPES ---------------- */
export interface UpcomingEventCardData {
  _id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  poster: string;
  category?: string;
}

/* ---------------- ANIMATION VARIANTS ---------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardEntryVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const }
  },
};

const stubTearVariants = {
  intact: { x: 0, y: 0, rotate: 0, opacity: 1, filter: "blur(0px)" },
  torn: {
    x: 60,
    y: 100,
    rotate: 25,
    opacity: 0,
    filter: "blur(4px)",
    transition: {
      duration: 0.8,
      ease: [0.6, 0.05, 0.01, 0.9] as [number, number, number, number]
    }
  }
};

const bodyRecoilVariants = {
  intact: { x: 0 },
  torn: {
    x: -5,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
  }
};

/* ---------------- SUB-COMPONENT: BARCODE ---------------- */
const Barcode = () => (
  <>
    <style dangerouslySetInnerHTML={{ __html: barcodeStyle }} />
    <div className="barcode-group flex h-8 items-end gap-[2px] opacity-50 group-hover:opacity-100 transition-opacity">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className={`bar-line w-[2px] bg-white origin-bottom ${i % 3 === 0 ? "h-full" : "h-1/2"}`}
        />
      ))}
    </div>
  </>
);

/* ---------------- SUB-COMPONENT: TICKET CARD ---------------- */
const TicketCard = ({
  event,
  index,
  onTear,
}: {
  event: UpcomingEventCardData;
  index: number;
  onTear: (e: UpcomingEventCardData) => void;
}) => {
  const [isTorn, setIsTorn] = useState(false);
  const controls = useAnimation();

  const handleInteract = () => {
    if (isTorn) return;
    setIsTorn(true);

    controls.start("torn");

    setTimeout(() => {
      onTear(event);
      setTimeout(() => {
        setIsTorn(false);
        controls.start("intact");
      }, 500);
    }, 750);
  };

  const dateObj = new Date(event.date);
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const time = "20:00";

  return (
    <motion.div
      variants={cardEntryVariants}
      className="group relative w-full cursor-pointer select-none perspective-1000"
      onClick={handleInteract}
    >
      <div className="relative flex flex-col md:flex-row h-full drop-shadow-2xl">

        {/* LEFT: MAIN CONTENT */}
        <motion.div
          variants={bodyRecoilVariants}
          initial="intact"
          animate={controls}
          className="relative flex flex-col md:flex-row flex-1 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/5 border-b-0 md:border-b md:border-r-0 hover:border-orange-500/30 transition-colors duration-300 z-10 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
        >
          <div className="relative w-full md:w-48 h-48 md:h-auto shrink-0 overflow-hidden bg-black border-b md:border-b-0 md:border-r border-white/5 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
            <img
              src={event.poster}
              alt={event.name}
              className="w-full h-full object-cover opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-orange-500 flex items-center justify-center z-10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out">
              <span className="text-[9px] font-black text-black -rotate-90 tracking-widest whitespace-nowrap">
                ADMIT ONE
              </span>
            </div>
          </div>

          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative">
            <div className="flex justify-between items-start mb-4">
              <div className="hidden md:flex items-center gap-2 text-[10px] text-neutral-600 font-mono opacity-70">
                <QrCode className="w-3 h-3" />
                <span>VERIFIED_TICKET // 00{index + 1}</span>
              </div>
              <div className="flex text-orange-500/50 group-hover:text-orange-500 transition-colors animate-pulse">
                <ChevronRight className="w-4 h-4 -ml-2" />
                <ChevronRight className="w-4 h-4 -ml-2" />
                <ChevronRight className="w-4 h-4 -ml-2" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-3 leading-[0.9] group-hover:text-orange-500 transition-colors">
                {event.name}
              </h3>
              <p className="text-xs text-neutral-400 line-clamp-2 max-w-md font-mono leading-relaxed">
                {event.description}
              </p>
            </div>

            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs font-bold text-white/80">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                {event.location}
              </div>
            </div>
          </div>
        </motion.div>

        {/* PERFORATION LINE */}
        <div className="relative w-full h-[1px] md:w-[1px] md:h-auto flex md:flex-col justify-between z-20">
          <div className="absolute inset-0 border-t md:border-t-0 md:border-l border-dashed border-white/20" />
        </div>

        {/* RIGHT: TEAR-OFF STUB */}
        <motion.div
          variants={stubTearVariants}
          initial="intact"
          animate={controls}
          className="relative w-full md:w-40 border border-t-0 md:border-t md:border-l-0 border-white/5 bg-gradient-to-br from-[#161616] to-[#0a0a0a] flex flex-row md:flex-col items-center justify-between p-5 group-hover:bg-orange-500/5 transition-colors z-0 origin-top-left md:origin-top-left rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none"
        >
          <div className="absolute -top-1.5 md:-left-1.5 left-0 right-0 md:right-auto md:top-0 md:bottom-0 flex flex-row md:flex-col justify-between px-2 md:py-2 z-30">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#050505] shadow-[inset_0_0_2px_rgba(255,255,255,0.05)]" />
            ))}
          </div>

          <div className="text-center md:text-right w-auto md:w-full">
            <span className="block text-xs font-mono text-neutral-500 mb-1">{month}</span>
            <span className="block text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">{day}</span>
            <span className="block text-xs font-mono text-neutral-500 mt-1">{time}</span>
          </div>

          <div className="hidden md:block w-full opacity-80">
            <Barcode />
          </div>

          <div className="md:hidden p-2 bg-white/5 rounded-full">
            <Ticket className="w-5 h-5 text-orange-500" />
          </div>

          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 md:translate-x-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="text-[9px] font-mono text-orange-500 uppercase tracking-widest rotate-0 md:-rotate-90 block whitespace-nowrap">
              TEAR_HERE
            </span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */
export const UpcomingEventsTeaser = ({ events }: { events: UpcomingEventCardData[] }) => {
  const [selectedEvent, setSelectedEvent] = useState<UpcomingEventCardData | null>(null);

  if (!events || events.length === 0) return null;

  return (
    <section className="relative w-full py-8 md:py-16 px-4 md:px-6 overflow-hidden">

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* ── HEADER ── */}
        <div className="mb-8 md:mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, ease: "easeOut" }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">
              UPCOMING <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6d00] to-amber-500">EVENTS</span>
            </h2>

            <div className="mt-6 flex flex-col items-center opacity-90">
              <p className="text-sm md:text-base font-medium tracking-[0.3em] text-neutral-400 uppercase">
                WHAT'S NEXT
              </p>

              {/* Decorative Laser Line */}
              <div className="mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#ff6d00] to-transparent opacity-80 shadow-[0_0_10px_#ff6d00]" />
            </div>
          </motion.div>
        </div>

        {/* ── EVENTS LIST ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col gap-6"
        >
          {events.map((event, index) => (
            <TicketCard
              key={event._id}
              event={event}
              index={index}
              onTear={setSelectedEvent}
            />
          ))}
        </motion.div>
      </div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            // CHANGED: z-[9999] -> z-[999] to allow custom cursor (usually z~5000) to appear on top
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl bg-[#111] border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[85vh] rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white/70 hover:text-orange-500 border border-white/10 transition-colors rounded-full backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full md:w-1/2 h-56 md:h-auto relative bg-black border-b md:border-b-0 md:border-r border-white/10">
                <img
                  src={selectedEvent.poster}
                  alt={selectedEvent.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col bg-[#111]">
                <div className="mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-orange-500 font-mono text-[10px] tracking-widest uppercase">
                    Event Confirmed
                  </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
                  {selectedEvent.name}
                </h2>

                <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-4">
                  <p className="text-neutral-400 text-sm leading-relaxed font-mono">
                    {selectedEvent.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-dashed border-white/10">
                    <div>
                      <span className="block text-[9px] text-neutral-600 uppercase tracking-widest mb-1">Date</span>
                      <div className="text-lg text-white font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        {new Date(selectedEvent.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="block text-[9px] text-neutral-600 uppercase tracking-widest mb-1">Venue</span>
                      <div className="text-lg text-white font-bold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        {selectedEvent.location}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button className="w-full py-4 bg-white hover:bg-orange-500 hover:text-white text-black font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group/btn shadow-lg rounded-lg">
                    Complete Registration <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};