'use client';
import React, { useState, useRef, useMemo, useEffect, useCallback, memo, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight } from 'lucide-react';

/* ---------------- TYPES ---------------- */
type TimelineEvent = {
  _id: string;
  name: string;
  date: string;
  description: string;
  poster: string;
  galleryLinks: string[];
  location?: string;
};

/* ---------------- CONFIG ---------------- */
const START_YEAR = 2016;
const END_YEAR = 2025;
const BASE_BLOCK_WIDTH = 1000;
const TICK_DENSITY_PX = 80;
const PADDING_LEFT = 200;
const CARD_WIDTH = 280;
const YEAR_SIDE_PADDING = 100;
const FIXED_SPACING = 100;
const YEAR_LABEL_HEIGHT = 220;

/* ---------------- UTILITIES ---------------- */
const getSafeYear = (dateStr: string): number | null => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  return isNaN(year) ? null : year;
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Date TBD';
  return `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}, ${d.getFullYear()}`;
};

// Image Caching System
const imageCache = new Map<string, HTMLImageElement>();
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!src) return resolve();
    if (imageCache.has(src)) {
      resolve();
      return;
    }
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      imageCache.set(src, img);
      resolve();
    };
    img.onerror = () => {
      resolve();
    };
    img.src = src;
  });
};

/* ================= LIVE COUNTER ================= */
const LiveCounterVertical = memo(() => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <div style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', whiteSpace: 'nowrap' }}>
      <span>
        {String(time.getHours()).padStart(2, '0')}:
        {String(time.getMinutes()).padStart(2, '0')}:
        {String(time.getSeconds()).padStart(2, '0')}
      </span>
    </div>
  );
});
LiveCounterVertical.displayName = 'LiveCounterVertical';

/* ================= RULER LAYER ================= */
const RulerLayer = memo(({ scale, yearRange, yearConfig, yearPositions, totalContentWidth }: any) => (
  <div
    className="absolute inset-0 pointer-events-none origin-top-left"
    style={{
      zIndex: 10,
      transform: `scale(${scale})`,
      transformOrigin: 'left top',
      height: '100%',
      width: `${totalContentWidth + PADDING_LEFT + 100}px`
    }}
  >
    {Array.from({ length: yearRange.end - yearRange.start + 1 }).map((_, i) => {
      const year = yearRange.start + i;
      const config = yearConfig[year];

      if (!config) return null;

      return (
        <div
          key={year}
          className="absolute h-full"
          style={{
            left: `${PADDING_LEFT + (yearPositions[year] || 0)}px`,
            width: `${config.width}px`,
            top: 0
          }}
        >
          {/* Big Background Year Number */}
          <div className="absolute z-30" style={{ top: 100, left: 0, width: 1 }}>
            <span style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '4.4rem',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: 'rgba(255,255,255,0.8)',
              whiteSpace: 'nowrap',
              textShadow: '0 0 14px rgba(255,255,255,0.35), 0 0 42px rgba(255,255,255,0.25)',
              filter: 'blur(0.6px)',
              userSelect: 'none',
            }}>
              {year}
            </span>
          </div>

          {/* Start Marker */}
          {year === yearRange.start && (
            <div className="absolute z-30 flex items-center justify-center" style={{ left: 0, top: YEAR_LABEL_HEIGHT, bottom: 0, width: 1 }}>
              <span style={{
                writingMode: 'vertical-rl',
                transform: 'translateX(-50%) rotate(180deg)',
                fontSize: '2.4rem',
                whiteSpace: 'nowrap',
                color: 'rgba(255,255,255,0.75)',
                fontWeight: 600,
                textShadow: '0 0 14px rgba(255,255,255,0.25)',
              }}>
                Everything started here
              </span>
            </div>
          )}
        </div>
      );
    })}

    {/* Today Marker Line */}
    <div
      className="absolute"
      style={{
        left: `${PADDING_LEFT + totalContentWidth}px`,
        top: YEAR_LABEL_HEIGHT,
        bottom: 32,
        width: 0,
        overflow: 'visible'
      }}
    >
      {/* TODAY Header */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          left: 0,
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          fontSize: '3.2rem',
          fontWeight: 700,
          color: 'rgba(249,115,22,0.9)',
          textShadow: '0 0 28px rgba(249,115,22,0.45)',
          zIndex: 30,
        }}
      >
        TODAY
      </div>

      {/* Evenly distributed vertical text */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '-18px',
          width: '36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          zIndex: 25,
        }}
      >
        <span
          style={{
            writingMode: 'vertical-lr',
            transform: 'rotate(180deg)',
            fontSize: '0.95rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.6)',
            whiteSpace: 'nowrap',
          }}
        >
          {new Date().toDateString()}
        </span>

        <span
          style={{
            writingMode: 'vertical-lr',
            transform: 'rotate(180deg)',
            fontSize: '0.95rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.9)',
            whiteSpace: 'nowrap',
          }}
        >
          <LiveCounterVertical />
        </span>

        <span
          style={{
            writingMode: 'vertical-lr',
            transform: 'rotate(180deg)',
            fontSize: '0.95rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: 'rgba(249,115,22,0.9)',
            whiteSpace: 'nowrap',
          }}
        >
          Coding Ninjas
        </span>
      </div>
    </div>

    {/* Global Month Lines (Solid) */}
    <div
      className="absolute left-0"
      style={{
        top: YEAR_LABEL_HEIGHT,
        bottom: 32,
        left: `${PADDING_LEFT}px`,
        width: `${totalContentWidth}px`,
        backgroundImage: `repeating-linear-gradient(
      to right,
      rgba(255,255,255,0.08) 0px,
      rgba(255,255,255,0.08) 1px,
      transparent 1px,
      transparent ${TICK_DENSITY_PX}px
    )`,
        backgroundSize: `${TICK_DENSITY_PX}px 100%`,
        backgroundRepeat: 'repeat',
        zIndex: 5,
        pointerEvents: 'none'
      }}
    />

  </div>
));
RulerLayer.displayName = 'RulerLayer';

/* ================= TIMELINE CARD ================= */
const TimelineEventCard = memo(({ event, left, top, onClick }: any) => {
  const stackImages = (event.galleryLinks || []).slice(0, 2);
  const [isHovered, setIsHovered] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const checkCache = async () => {
      const allUrls = [event.poster, ...stackImages];
      const allCached = allUrls.every(url => imageCache.has(url));

      if (allCached) {
        setImagesLoaded(true);
      } else {
        await Promise.all(allUrls.map(url => preloadImage(url).catch(() => { })));
        setImagesLoaded(true);
      }
    };
    checkCache();
  }, [event.poster, stackImages]);

  return (
    <div
      className="absolute pointer-events-auto cursor-pointer timeline-card"
      style={{ left: 0, top: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(event)}
    >
      <div
        style={{
          transform: `translate3d(${left}px, ${top}px, 0)`,
          willChange: isHovered ? 'transform, opacity' : undefined,
        }}
        className="w-[320px] h-[360px] relative group transition-transform duration-300 ease-out"
      >
        <div
          className={`absolute inset-0 rounded-2xl -z-10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: isHovered ? 'linear-gradient(135deg, rgba(251,146,60,0.12), rgba(168,85,247,0.06))' : 'transparent' }}
        />
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden bg-[rgba(18,18,18,0.85)] border transition-all duration-300"
          style={{
            borderColor: isHovered ? 'rgba(251,146,60,0.18)' : 'rgba(255,255,255,0.06)',
            boxShadow: isHovered ? '0 20px 50px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.45)'
          }}
        />
        <div className="relative z-10 h-full p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span
              className="text-[11px] uppercase tracking-[0.5em] font-semibold"
              style={{ color: isHovered ? 'rgba(253,186,116,0.8)' : 'rgba(255,255,255,0.55)' }}
            >
              {formatDate(event.date)}
            </span>
            <div
              className="flex-1 h-[1px] bg-gradient-to-r"
              style={{
                backgroundImage: isHovered
                  ? 'linear-gradient(to right, rgba(251,146,60,0.12), transparent)'
                  : 'linear-gradient(to right, rgba(255,255,255,0.06), transparent)'
              }}
            />
          </div>
          <h3 className="text-[20px] font-bold leading-[1.3] line-clamp-2 tracking-wide" style={{ color: 'white' }}>{event.name}</h3>

          <div className="relative flex-1 mt-2">
            {imagesLoaded ? (
              <>
                {stackImages.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="absolute inset-0 rounded-xl overflow-hidden transition-transform duration-500 ease-out"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered
                        ? `scale(1) ${idx === 0 ? 'rotate(-6deg) translate(-40px, -16px)' : 'rotate(6deg) translate(40px, -16px)'}`
                        : 'scale(0.85)',
                    }}
                  >
                    <img src={img} loading="lazy" className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                ))}
                <div
                  className="absolute inset-0 rounded-xl overflow-hidden transition-transform duration-400"
                  style={{
                    transform: isHovered ? 'rotate(3deg) scale(1.02)' : 'rotate(0) scale(1)',
                    boxShadow: isHovered ? '0 12px 40px rgba(0,0,0,0.55)' : 'none'
                  }}
                >
                  <img src={event.poster} loading="lazy" className="w-full h-full object-cover" alt="" />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                    style={{ opacity: isHovered ? 1 : 0 }}
                  />
                </div>
              </>
            ) : (
              <div className="absolute inset-0 rounded-xl bg-white/5 animate-pulse" />
            )}
          </div>

          <div
            className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-orange-600/10 backdrop-blur-sm border border-orange-400/12 text-[11px] font-bold tracking-[0.2em] uppercase text-orange-300 transition-all"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)'
            }}
          >
            VIEW
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.event._id === nextProps.event._id &&
    prevProps.left === nextProps.left &&
    prevProps.top === nextProps.top;
});
TimelineEventCard.displayName = 'TimelineEventCard';

/* ================= OVERLAY ================= */
const ExpandedCardOverlay = memo(({ event, onClose }: { event: TimelineEvent, onClose: () => void }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6" onWheel={(e) => e.stopPropagation()}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-6xl h-[85vh] bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/10 rounded-full border border-white/10 transition-colors group">
          <X className="w-5 h-5 text-white/70 group-hover:text-white" />
        </button>
        {/* Left Column: Text Info (Fix: Added h-1/2 md:h-full for mobile scrolling) */}
        <div className="w-full md:w-5/12 bg-gradient-to-b from-[#111] to-black flex flex-col h-1/2 md:h-full">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-8 md:p-12 overscroll-contain">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <p className="text-xs tracking-[0.3em] uppercase text-orange-500 font-mono mb-6 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-orange-500/50"></span>
                {formatDate(event.date)}
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-[1.1] mb-8">
                {event.name}
              </h2>
              <p className="text-lg text-white/70 leading-relaxed font-light">{event.description}</p>
              {event.location && (
                <div className="mt-8 pt-8 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-2">Location</h4>
                  <p className="text-white">{event.location}</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
        {/* Right Column: Gallery (Fix: Added h-1/2 md:h-full for mobile scrolling) */}
        <div className="w-full md:w-7/12 border-l border-white/5 flex flex-col h-1/2 md:h-full">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 md:p-8 overscroll-contain">
            <div className="flex flex-col gap-6">
              <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group shrink-0">
                <img src={event.poster} className="w-full h-full object-cover" alt="" />
              </div>
              {event.galleryLinks?.map((link, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="w-full aspect-video rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition cursor-zoom-in shrink-0"
                >
                  <img src={link} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition duration-700 ease-in-out" alt="" />
                </motion.div>
              ))}
              <div className="h-10"></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
ExpandedCardOverlay.displayName = 'ExpandedCardOverlay';

/* ================= MAIN COMPONENT ================= */
export default function HorizontalTimeline() {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [visibleRange, setVisibleRange] = useState({ start: -Infinity, end: Infinity });

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [scale, setScale] = useState<number>(1);

  // Fetch Events — deferred to browser idle time to avoid competing with hero images
  useEffect(() => {
    let mounted = true;
    const doFetch = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events/pastevents');
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        if (!mounted) return;
        setEvents(data);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Use requestIdleCallback when available (Chrome/Firefox); fall back to setTimeout for Safari
    let idleId: number | ReturnType<typeof setTimeout>;
    if (typeof (window as any).requestIdleCallback === 'function') {
      idleId = (window as any).requestIdleCallback(doFetch, { timeout: 2000 });
    } else {
      idleId = setTimeout(doFetch, 0);
    }

    return () => {
      mounted = false;
      if (typeof (window as any).cancelIdleCallback === 'function') {
        (window as any).cancelIdleCallback(idleId as number);
      } else {
        clearTimeout(idleId as ReturnType<typeof setTimeout>);
      }
    };
  }, []);

  // Handle Resize and Scale
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const w = window.innerWidth;
      setWindowWidth(w);
      setScale(Math.min(1, Math.max(0.55, w / 1600)));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* --- Logic for Year Ranges and Positions --- */
  const yearRange = useMemo(() => {
    if (events.length === 0) return { start: START_YEAR, end: END_YEAR };
    const years = events.map((e) => getSafeYear(e.date)).filter((y): y is number => y !== null);
    if (years.length === 0) return { start: START_YEAR, end: END_YEAR };
    return { start: Math.min(START_YEAR, ...years), end: Math.max(END_YEAR, ...years) };
  }, [events]);

  const eventsByYear = useMemo(() => {
    const map: Record<number, TimelineEvent[]> = {};
    for (let y = yearRange.start; y <= yearRange.end; y++) map[y] = [];
    const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sorted.forEach(e => {
      const year = getSafeYear(e.date);
      if (year) { if (!map[year]) map[year] = []; map[year].push(e); }
    });
    return map;
  }, [events, yearRange]);

  const yearConfig = useMemo(() => {
    const cfg: Record<number, { width: number; tickCount: number }> = {};
    for (let y = yearRange.start; y <= yearRange.end; y++) {
      const count = eventsByYear[y]?.length || 0;
      const requiredWidth = (count * CARD_WIDTH) + (Math.max(0, count - 1) * FIXED_SPACING) + (YEAR_SIDE_PADDING * 2);
      const finalWidth = Math.max(BASE_BLOCK_WIDTH, requiredWidth);
      cfg[y] = { width: finalWidth, tickCount: Math.max(5, Math.floor(finalWidth / TICK_DENSITY_PX)) };
    }
    return cfg;
  }, [eventsByYear, yearRange]);

  const yearPositions = useMemo(() => {
    const pos: Record<number, number> = {};
    let acc = 0;
    for (let y = yearRange.start; y <= yearRange.end; y++) {
      pos[y] = acc;
      acc += yearConfig[y]?.width ?? BASE_BLOCK_WIDTH;
    }
    return pos;
  }, [yearConfig, yearRange]);

  const eventPositions = useMemo(() => {
    const positions: Record<string, { left: number; top: number }> = {};
    const AC_OFFSET = 80;
    const TOP_CENTER = 400;
    let globalIndex = 0;
    for (let y = yearRange.start; y <= yearRange.end; y++) {
      const yearEvents = eventsByYear[y] || [];
      const startX = PADDING_LEFT + (yearPositions[y] || 0) + YEAR_SIDE_PADDING;
      yearEvents.forEach((e, i) => {
        positions[e._id] = {
          left: startX + i * (CARD_WIDTH + FIXED_SPACING),
          top: TOP_CENTER + (globalIndex % 2 === 0 ? -AC_OFFSET : AC_OFFSET),
        };
        globalIndex++;
      });
    }
    return positions;
  }, [eventsByYear, yearPositions, yearRange]);

  const totalContentWidth = useMemo(() => {
    const lastYear = yearRange.end;
    return (yearPositions[lastYear] || 0) + (yearConfig[lastYear]?.width || BASE_BLOCK_WIDTH);
  }, [yearPositions, yearConfig, yearRange]);

  const centeringOffset = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    const scaledWidth = (totalContentWidth + PADDING_LEFT * 2) * scale;
    if (scaledWidth > windowWidth) return 0;
    return (windowWidth - scaledWidth) / 2;
  }, [totalContentWidth, scale, windowWidth]);

  // --- VIRTUALIZATION LOGIC ---
  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const viewportWidth = container.clientWidth;

    if (viewportWidth === 0) return;

    const buffer = Math.max(1200, viewportWidth * 1.5);
    const scaledStart = (scrollLeft - (PADDING_LEFT + centeringOffset)) / scale - buffer;
    const scaledEnd = (scrollLeft + viewportWidth - (PADDING_LEFT + centeringOffset)) / scale + buffer;

    setVisibleRange((prev) => {
      if (prev.start === -Infinity || Math.abs(prev.start - scaledStart) > 200 || Math.abs(prev.end - scaledEnd) > 200) {
        return { start: scaledStart, end: scaledEnd };
      }
      return prev;
    });
  }, [scale, centeringOffset]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      updateVisibleRange();
    });

    resizeObserver.observe(container);
    container.addEventListener('scroll', updateVisibleRange, { passive: true });

    const t = setTimeout(updateVisibleRange, 100);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('scroll', updateVisibleRange);
      clearTimeout(t);
    };
  }, [updateVisibleRange]);

  const handleCardClick = useCallback((event: TimelineEvent) => {
    setSelectedEvent(event);
  }, []);

  const eventsById = useMemo(() => {
    const map: Record<string, TimelineEvent> = {};
    for (const ev of events) map[ev._id] = ev;
    return map;
  }, [events]);

  const visibleEventIds = useMemo(() => {
    if (visibleRange.start === -Infinity) {
      return events.map(e => e._id);
    }

    const ids: string[] = [];
    for (const e of events) {
      const pos = eventPositions[e._id];
      if (!pos) continue;
      const cardLeft = pos.left;
      const cardRight = cardLeft + CARD_WIDTH + 100;

      if (cardRight >= visibleRange.start && cardLeft <= visibleRange.end) {
        ids.push(e._id);
      }
    }
    return ids;
  }, [events, eventPositions, visibleRange]);

  // Preloading
  useEffect(() => {
    if (!visibleEventIds || visibleEventIds.length === 0) return;
    const idsToPreload = visibleEventIds.slice(0, 8);
    const imagesToLoad: string[] = [];
    for (const id of idsToPreload) {
      const ev = eventsById[id];
      if (!ev) continue;
      if (ev.poster) imagesToLoad.push(ev.poster);
      if (ev.galleryLinks) imagesToLoad.push(...ev.galleryLinks.slice(0, 2));
    }
    let mounted = true;
    (async () => {
      for (const url of imagesToLoad) {
        if (!mounted) break;
        await preloadImage(url);
      }
    })();
    return () => { mounted = false; };
  }, [visibleEventIds, eventsById]);


  return (
    <div className="relative w-full overflow-hidden">
      <style jsx global>{`
        .custom-scrollbar { scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── ADDED HEADING SECTION ── */}
      <div className="relative pt-0 pb-0 text-center z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: "easeOut" }}
        >
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">
            OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6d00] to-amber-500">JOURNEY</span>
          </h2>

          <div className="mt-6 flex flex-col items-center opacity-90">
            {/* Text: Wide Spacing, Uppercase, Premium Font Look */}
            <p className="text-sm md:text-base font-medium tracking-[0.3em] text-neutral-400 uppercase">
              DEFINING MOMENTS
            </p>

            {/* Decorative Laser Line */}
            <div className="mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#ff6d00] to-transparent opacity-80 shadow-[0_0_10px_#ff6d00]" />
          </div>
        </motion.div>
      </div>

      {/* Fix: Increased mobile height from 500px to 700px for proper element spacing */}
      <div className="h-[700px] md:h-[850px] w-full relative z-0 -mt-[30px]">
        <div ref={containerRef} className="relative h-full overflow-x-auto overflow-y-hidden custom-scrollbar">
          <div
            className="relative h-full"
            style={{
              width: `${((totalContentWidth + PADDING_LEFT) * scale) + 50}px`,
              margin: '0 auto',
            }}
          >
            <RulerLayer
              scale={scale}
              yearRange={yearRange}
              yearConfig={yearConfig}
              yearPositions={yearPositions}
              totalContentWidth={totalContentWidth}
            />
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
              <div className="relative w-full h-full origin-top-left" style={{ transform: `scale(${scale})`, transformOrigin: 'left top' }}>
                {visibleEventIds.map((id) => {
                  const ev = eventsById[id];
                  const pos = eventPositions[id];
                  if (!ev || !pos) return null;
                  return (
                    <TimelineEventCard
                      key={ev._id}
                      event={ev}
                      left={pos.left}
                      top={pos.top}
                      onClick={handleCardClick}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selectedEvent && (
          <ExpandedCardOverlay
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}