'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback, memo } from 'react';
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
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}, ${d.getFullYear()}`;
};

const imageCache = new Map<string, HTMLImageElement>();

const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
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
    img.onerror = () => resolve();
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
    <div className="flex gap-4 items-center text-xl font-medium text-white tracking-wider whitespace-nowrap opacity-70 text-xs font-semibold">
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
      height: '100%'
    }}
  >
    {Array.from({ length: yearRange.end - yearRange.start + 1 }).map((_, i) => {
      const year = yearRange.start + i;
      const config = yearConfig[year];

      return (
        <div
          key={year}
          className="absolute h-full"
          style={{
            left: `${PADDING_LEFT + yearPositions[year]}px`,
            width: `${config.width}px`,
            top: 0
          }}
        >
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

          {year !== yearRange.start && (
            <div className="absolute left-0 w-[2px] border-l-2 border-dashed border-white/30" style={{ top: YEAR_LABEL_HEIGHT, bottom: 32 }} />
          )}

          <div className="absolute left-0 right-0" style={{
            top: YEAR_LABEL_HEIGHT,
            bottom: 32,
            backgroundImage: `repeating-linear-gradient(to right, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent ${TICK_DENSITY_PX}px)`,
            backgroundSize: 'auto 100%'
          }} />
        </div>
      );
    })}

    <div className="absolute h-full" style={{ left: `${PADDING_LEFT + totalContentWidth}px`, top: 0 }}>
      <div className="absolute z-30" style={{ top: 100, left: 0, width: 1 }}>
        <span style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '3.6rem',
          fontWeight: 700,
          color: 'rgba(249,115,22,0.9)',
          textShadow: '0 0 28px rgba(249,115,22,0.45)',
          whiteSpace: 'nowrap',
        }}>
          TODAY
        </span>
      </div>
      <div style={{
        position: 'absolute',
        left: 0,
        bottom: 120,
        width: 1,
        writingMode: 'vertical-rl',
        transform: 'translateX(-50%) rotate(180deg)',
      }} className="flex items-center gap-4 text-sm">
        <span className="text-white/60 text-xl font-semibold">{new Date().toDateString()}</span>
        <span className="opacity-30">•</span>
        <LiveCounterVertical />
        <span className="opacity-30">•</span>
        <span className="font-semibold text-orange-400 text-xl">Coding Ninjas</span>
      </div>
    </div>
  </div>
));
RulerLayer.displayName = 'RulerLayer';

/* ================= OPTIMIZED CARD ================= */
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
        await Promise.all(allUrls.map(url => preloadImage(url).catch(() => {})));
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
        data-contain="true"
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
              className="text-[10px] uppercase tracking-[0.4em] font-semibold"
              style={{ color: isHovered ? 'rgba(253,186,116,0.6)' : 'rgba(255,255,255,0.45)' }}
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

          <h3 className="text-[18px] font-bold leading-[1.2] line-clamp-2" style={{ color: 'white' }}>{event.name}</h3>

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
                    <img 
                      src={img} 
                      decoding="async" 
                      loading="lazy" 
                      className="w-full h-full object-cover" 
                      alt=""
                      style={{ display: 'block' }}
                    />
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
                  <img 
                    src={event.poster} 
                    decoding="async" 
                    loading="eager" 
                    className="w-full h-full object-cover" 
                    alt=""
                    style={{ display: 'block' }}
                  />
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
            className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/10 to-orange-600/10 backdrop-blur-sm border border-orange-400/12 text-[10px] font-bold tracking-[0.15em] uppercase text-orange-300 transition-all"
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

/* ================= EXPANDED OVERLAY ================= */
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

        <div className="w-full md:w-5/12 bg-gradient-to-b from-[#111] to-black flex flex-col">
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

        <div className="w-full md:w-7/12 border-l border-white/5 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 md:p-8 overscroll-contain">
            <div className="flex flex-col gap-6">
              <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group shrink-0">
                <img src={event.poster} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
  const [visibleRange, setVisibleRange] = useState({ start: -1000, end: 10000 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastScrollRef = useRef(0);
   
  const [windowWidth, setWindowWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
   
  const [scale, setScale] = useState<number>(() => {
    if (typeof window !== 'undefined') {
       return Math.min(1, Math.max(0.55, window.innerWidth / 1600));
    }
    return 1;
  });

  useEffect(() => {
    let mounted = true;
    const fetchEvents = async () => {
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
    fetchEvents();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let timeoutId: any;
    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (typeof window !== 'undefined') {
          const w = window.innerWidth;
          setWindowWidth(w);
          setScale(Math.min(1, Math.max(0.55, w / 1600)));
        }
      }, 120);
    };
    
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const yearRange = useMemo(() => {
    if (events.length === 0) return { start: START_YEAR, end: END_YEAR };
    const years = events.map((e) => new Date(e.date).getFullYear());
    return { start: Math.min(START_YEAR, ...years), end: Math.max( ...years) };
  }, [events]);

  const eventsByYear = useMemo(() => {
    const map: Record<number, TimelineEvent[]> = {};
    for (let y = yearRange.start; y <= yearRange.end; y++) map[y] = [];
    const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sorted.forEach(e => map[new Date(e.date).getFullYear()]?.push(e));
    return map;
  }, [events, yearRange]);

  const yearConfig = useMemo(() => {
    const cfg: Record<number, { width: number; tickCount: number }> = {};
    for (let y = yearRange.start; y <= yearRange.end; y++) {
      const count = eventsByYear[y]?.length || 0;
      const requiredWidth = (count * CARD_WIDTH) + (Math.max(0, count - 1) * FIXED_SPACING) + (YEAR_SIDE_PADDING * 2);
      const finalWidth = Math.max(BASE_BLOCK_WIDTH, requiredWidth);
      cfg[y] = {
        width: finalWidth,
        tickCount: Math.max(5, Math.floor(finalWidth / TICK_DENSITY_PX))
      };
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

  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const viewportWidth = container.clientWidth;
    
    const buffer = Math.max(1200, viewportWidth * 1.5);
    const start = Math.max(0, (scrollLeft - buffer) / scale);
    const end = (scrollLeft + viewportWidth + buffer) / scale;
    
    setVisibleRange((prev) => {
      if (Math.abs(prev.start - start) > 100 || Math.abs(prev.end - end) > 100) {
        return { start, end };
      }
      return prev;
    });
  }, [scale]);

  useEffect(() => {
    const t = setTimeout(() => {
        updateVisibleRange();
    }, 100); 
    return () => clearTimeout(t);
  }, [totalContentWidth, loading, scale, updateVisibleRange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      lastScrollRef.current = container.scrollLeft;
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(() => {
          updateVisibleRange();
          if (rafRef.current != null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
        });
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
    const ids: string[] = [];
    if(visibleRange.end < 0) return ids;

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

  useEffect(() => {
    if (!visibleEventIds || visibleEventIds.length === 0) return;
    const idsToPreload = visibleEventIds.slice(0, 8); 
    const imagesToLoad: string[] = [];
    for (const id of idsToPreload) {
      const ev = events.find((x) => x._id === id);
      if (!ev) continue;
      imagesToLoad.push(ev.poster, ...(ev.galleryLinks?.slice(0, 2) || []));
    }
    let mounted = true;
    (async () => {
      for (const url of imagesToLoad) {
        if (!mounted) break;
        await preloadImage(url);
      }
    })();
    return () => { mounted = false; };
  }, [visibleEventIds, events]);

  if (loading) return <div className="h-[850px] flex items-center justify-center text-white">Loading events...</div>;
  if (error) return <div className="h-[850px] flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="relative w-full overflow-hidden">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.12); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.24); }
      `}</style>

      <div className="h-[850px] w-full relative z-0">
        <div ref={containerRef} className="relative h-full overflow-x-auto overflow-y-hidden custom-scrollbar">
          <div
            className="relative h-full"
            style={{
              width: `${totalContentWidth + PADDING_LEFT * 2}px`,
              paddingLeft: `${PADDING_LEFT + centeringOffset}px`,
              paddingRight: `${PADDING_LEFT + centeringOffset}px`,
            }}
          >
            {/* RULER LAYER */}
            <RulerLayer
              scale={scale}
              yearRange={yearRange}
              yearConfig={yearConfig}
              yearPositions={yearPositions}
              totalContentWidth={totalContentWidth}
            />

            {/* EVENTS LAYER */}
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