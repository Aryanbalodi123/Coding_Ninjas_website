"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

type TimelineItem = {
  year: string;
  title: string;
  description: string;
  image?: string;
};

type StackedTimelineProps = {
  items: TimelineItem[];
};

const TimelineCard = ({
  item,
  index,
}: {
  item: TimelineItem;
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 65%", "end 35%"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.3, 1], [0.9, 1, 0.96]);
  const cardOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, 0.4],
  );

  const yearOpacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.35, 0.5],
    [0, 1, 1, 0],
  );
  const yearY = useTransform(scrollYProgress, [0, 0.12], [30, 0]);
  const yearScale = useTransform(
    scrollYProgress,
    [0, 0.12, 0.35, 0.5],
    [0.9, 1, 1, 0.95],
  );

  return (
    <motion.div
      ref={cardRef}
      style={{
        position: "sticky",
        top: `${80 + index * 30}px`,
      }}
      className="mb-12"
    >
      <div className="w-full max-w-5xl mx-auto flex items-center gap-16">
        {/* Year on the left */}
        <motion.div
          className="flex-shrink-0 w-40 text-right pointer-events-none"
          style={{
            opacity: yearOpacity,
            y: yearY,
            scale: yearScale,
            position: "relative",
            zIndex: 10 - index,
          }}
        >
          <p className="text-7xl font-bold text-orange-500 tracking-tight">
            {item.year}
          </p>
        </motion.div>

        {/* Card content */}
        <motion.article
          style={{
            scale,
            opacity: cardOpacity,
          }}
          className="flex-1 rounded-2xl border border-white/10 bg-[#0f0f0f] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-sm"
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-5">
            <div className="flex flex-col gap-3">
              <h3 className="text-3xl font-heading text-foreground font-bold">
                {item.title}
              </h3>
            </div>

            {/* ✅ Image / Placeholder Section */}
            <div className="overflow-hidden rounded-lg border border-white/5 bg-surface/40 relative">
              <Image
                src={item.image || "/images/sponsors/CNweb.jpg"}
                alt={item.title}
                width={800}
                height={450}
                className="h-48 w-full object-cover"
              />
              {!item.image && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/60"></p>
                </div>
              )}
            </div>

            <p className="text-sm leading-relaxed text-foreground/70">
              {item.description}
            </p>
          </div>
        </motion.article>
      </div>
    </motion.div>
  );
};

export const StackedTimeline = ({ items }: StackedTimelineProps) => {
  return (
    <div className="relative">
      {items.map((item, index) => (
        <TimelineCard
          key={`${item.year}-${item.title}`}
          item={item}
          index={index}
        />
      ))}
    </div>
  );
};
