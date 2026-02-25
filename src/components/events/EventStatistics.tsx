"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import CountUp from "react-countup";

/* ─── CONFIGURATION ─── */
const MAX_HEIGHT = 280;
const LID_HEIGHT = 16;
// BAR_WIDTH is now handled via Tailwind classes (w-12 md:w-20)
const PRIMARY_COLOR = "249, 115, 22"; // Orange-500

const statistics = [
  { label: "Total Events", value: 26 },
  { label: "Tech Events", value: 18 },
  { label: "Workshops", value: 32 },
  { label: "Guest Speakers", value: 45 },
];

/* ─── HELPER: SVG PATH BUILDER ─── */
const generateSmoothPath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) * 0.5;
    const cp2x = p1.x - (p1.x - p0.x) * 0.5;
    d += ` C ${cp1x} ${p0.y}, ${cp2x} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
};

/* ─── COMPONENT: SINGLE 3D BAR ─── */
const Glass3DBar = ({
  stat,
  index,
  height,
  chartIn,
}: {
  stat: { label: string; value: number };
  index: number;
  height: number;
  chartIn: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const numberPosition = height + LID_HEIGHT + 50;

  return (
    <div
      className="relative flex flex-col items-center justify-end group w-14 md:w-20"
      style={{ zIndex: 10 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── BIG NUMBER ── */}
      <motion.div
        initial={{ y: 0, opacity: 0, scale: 0.5 }}
        animate={chartIn ? { y: -numberPosition, opacity: 1, scale: 1 } : {}}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: index * 0.1 + 0.6 }}
        className="absolute bottom-0 z-50 pointer-events-none flex flex-col items-center justify-center w-full"
      >
        <span
          className="relative text-3xl md:text-5xl font-black text-white tracking-tighter"
          style={{ textShadow: `0 4px 12px rgba(0,0,0,0.8), 0 0 30px rgba(${PRIMARY_COLOR}, 0.6)` }}
        >
          <CountUp end={stat.value} duration={3} delay={0.5} />
        </span>
        <motion.div
          initial={{ height: 0 }}
          animate={chartIn ? { height: 30 } : {}}
          transition={{ delay: 1.0 + (index * 0.1), duration: 0.4 }}
          className="w-px bg-gradient-to-b from-orange-500/0 via-orange-500 to-orange-500/0 mt-2"
        />
      </motion.div>

      {/* ── THE 3D GLASS PILLAR ── */}
      <motion.div
        initial={{ height: 0 }}
        animate={chartIn ? { height: height } : {}}
        transition={{ duration: 1.2, delay: index * 0.1, ease: "circOut" }}
        className="relative w-full"
        style={{ marginBottom: LID_HEIGHT }}
      >
        {/* Top Lid */}
        <div
          className="absolute top-0 left-0 w-full z-20"
          style={{
            height: LID_HEIGHT * 2,
            marginTop: -LID_HEIGHT,
            borderRadius: "50%",
            background: `linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(${PRIMARY_COLOR}, 0.1) 100%)`,
            border: "1px solid rgba(255,255,255,0.4)",
            boxShadow: `inset 0 4px 6px rgba(255,255,255,0.4), 0 0 15px rgba(${PRIMARY_COLOR}, ${hovered ? 0.8 : 0.2})`,
            transition: "all 0.3s",
          }}
        />
        {/* Body */}
        <div
          className="w-full h-full relative z-10 flex items-center justify-center"
          style={{
            background: `linear-gradient(90deg, rgba(${PRIMARY_COLOR}, 0.1) 0%, rgba(255,255,255, 0.1) 20%, rgba(${PRIMARY_COLOR}, 0.05) 50%, rgba(${PRIMARY_COLOR}, 0.1) 80%, rgba(${PRIMARY_COLOR}, 0.3) 100%)`,
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            borderRight: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div className="absolute left-[20%] top-0 bottom-0 w-[15%] bg-white/5 blur-sm" />

          {/* ── MOBILE: Label Inside Bar (Vertical) ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={chartIn ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.4 + (index * 0.1) }}
            className="md:hidden absolute inset-x-0 flex items-center justify-center z-30 rotate-180"
            style={{
              bottom: "20px",
              top: "20px",
              writingMode: "vertical-lr",
              textOrientation: "mixed",
            }}
          >
            <span
              className="font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-white via-orange-100 to-orange-300"
              style={{
                fontSize: height < 150 ? "10px" : height < 200 ? "12px" : "14px",
                textShadow: "0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(249,115,22,0.4)",
                filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
              }}
            >
              {stat.label}
            </span>
          </motion.div>
        </div>
        {/* Bottom Lid */}
        <div
          className="absolute bottom-0 left-0 w-full z-0"
          style={{
            height: LID_HEIGHT * 2,
            marginBottom: -LID_HEIGHT,
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center, rgba(${PRIMARY_COLOR}, 0.4), rgba(${PRIMARY_COLOR}, 0.8))`,
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: `0 10px 20px rgba(0,0,0,0.5)`,
          }}
        />
      </motion.div>

      {/* ── DESKTOP: Label Below Bar ── */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={chartIn ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 1.2 + (index * 0.1) }}
        className="hidden md:block absolute -bottom-14 text-xs font-bold uppercase tracking-widest text-neutral-300 text-center w-auto whitespace-nowrap"
      >
        {stat.label}
      </motion.p>
    </div>
  );
};

/* ─── AXIS COMPONENT ─── */
const AxisSystem = ({ width, height }: { width: number, height: number }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 0.2, scaleX: 1 }}
          transition={{ delay: 0.5 + (i * 0.1), duration: 0.8 }}
          className="absolute w-full border-t border-dashed border-neutral-500 origin-left"
          style={{ bottom: (i / 4) * height + 60 }}
        >
          <span className="absolute -left-6 md:-left-10 -top-3 text-[10px] md:text-xs text-neutral-600 font-mono">
            {Math.round((50 / 4) * i)}
          </span>
        </motion.div>
      ))}
      <div className="absolute bottom-4 w-full h-px bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-50" />
    </div>
  )
}

/* ─── MAIN EXPORT ─── */
export default function EventStatistics() {
  const maxValue = Math.max(...statistics.map((s) => s.value));
  const chartRef = useRef(null);
  const chartIn = useInView(chartRef, { once: true, margin: "-100px" });

  const SVG_WIDTH = 900;
  const SVG_HEIGHT = MAX_HEIGHT + 120;

  const paddingX = 72;
  const availableWidth = SVG_WIDTH - (paddingX * 2);
  const spacing = availableWidth / (statistics.length - 1);

  const standardPoints = statistics.map((stat, index) => {
    const x = paddingX + (index * spacing);
    const barH = (stat.value / maxValue) * MAX_HEIGHT;
    const y = SVG_HEIGHT - barH - LID_HEIGHT - 50;
    return { x, y };
  });

  const startPoint = { x: 0, y: standardPoints[0].y + 20 };
  const endPoint = { x: SVG_WIDTH, y: standardPoints[statistics.length - 1].y - 20 };

  const allPoints = [startPoint, ...standardPoints, endPoint];
  const pathData = generateSmoothPath(allPoints);

  return (
    <section className="relative w-full overflow-hidden flex flex-col items-center justify-center py-8 md:py-16 min-h-[400px] md:min-h-[800px]">

      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      <div className="relative z-10 w-full max-w-6xl px-4 flex flex-col items-center">

        {/* ── HEADING SECTION ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={chartIn ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="text-center mb-6 md:mb-24 flex flex-col items-center"
        >
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase relative z-10">
            OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">MOMENTUM</span>
          </h2>
          {/* Subheading Container */}
          <div className="mt-6 flex flex-col items-center opacity-90">

            {/* Text: Wide Spacing, Uppercase, Premium Font Look */}
            <p className="text-sm md:text-base font-medium tracking-[0.3em] text-neutral-400 uppercase">
              ACCELERATING IMPACT
            </p>

            {/* Decorative Gradient Line (Laser Effect) */}
            <div className="mt-4 h-px w-24 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60" />

          </div>
        </motion.div>

        {/* Chart Row */}
        <div
          ref={chartRef}
          className="relative w-full max-w-4xl mx-auto"
          style={{ height: MAX_HEIGHT + 150 }}
        >
          <AxisSystem width={1000} height={MAX_HEIGHT} />

          {/* ── SVG LINE LAYER ── */}
          <div className="absolute inset-0 top-0 bottom-0 z-0 pointer-events-none">
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="w-full h-full"
              preserveAspectRatio="none"
              style={{ overflow: "visible" }}
            >
              <defs>
                <linearGradient id="solidLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(249, 115, 22, 0)" />
                  <stop offset="15%" stopColor="rgba(249, 115, 22, 1)" />
                  <stop offset="85%" stopColor="rgba(249, 115, 22, 1)" />
                  <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
                </linearGradient>
                <filter id="strongGlow">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <motion.path
                d={pathData}
                fill="none"
                stroke="url(#solidLineGrad)"
                strokeWidth="4"
                filter="url(#strongGlow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={chartIn ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>
          </div>

          {/* ── BARS LAYER ── */}
          <div className="relative z-10 flex h-full w-full items-end justify-between px-4 md:px-8 pb-4">
            {statistics.map((stat, index) => {
              const height = (stat.value / maxValue) * MAX_HEIGHT;
              return (
                <Glass3DBar
                  key={stat.label}
                  stat={stat}
                  index={index}
                  height={height}
                  chartIn={chartIn}
                />
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}