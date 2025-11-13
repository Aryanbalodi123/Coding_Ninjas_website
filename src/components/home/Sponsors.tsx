"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { childFade } from "@/lib/motion";

// ✅ Updated with image paths (make sure these exist in /public/images/sponsors)
const sponsors = [
  {
    name: "Burger King",
    url: "https://www.burgerking.in",
    img: "/images/sponsors/bk.png",
  },
  {
    name: "JetBrains",
    url: "https://www.jetbrains.com",
    img: "/images/sponsors/jb.webp",
  },
  {
    name: "Coding Ninjas",
    url: "https://www.codingninjas.com/",
    img: "/images/sponsors/cn_sponser.png",
  },
  {
    name: "Devfolio",
    url: "https://devfolio.co",
    img: "/images/sponsors/dev.webp",
  },
  {
    name: "GitHub",
    url: "https://github.com/",
    img: "/images/sponsors/github.png",
  },
  {
    name: "Red Bull",
    url: "https://www.redbull.com/in-en",
    img: "/images/sponsors/rb.jpg",
  },
];

export const Sponsors = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % sponsors.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + sponsors.length) % sponsors.length);

  // 🌀 Auto-rotation (pause on hover)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(nextSlide, 2500);
    return () => clearInterval(interval);
  }, [isHovered, currentIndex]);

  return (
    <section className="container-grid space-y-12 py-16">
      <motion.div
        variants={childFade}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="text-center"
      >
        <SectionTitle
          eyebrow="Partnerships"
          title="OUR PAST SPONSORS"
          description="We're grateful to our partners who have supported our events and community initiatives."
          align="center"
        />
      </motion.div>

      <div
        className="relative max-w-6xl mx-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slider Container - shows 3 at a time */}
        <div className="overflow-hidden px-16">
          <motion.div
            className="flex gap-6"
            animate={{ x: `-${currentIndex * (100 / 3)}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Duplicate sponsors for infinite loop effect */}
            {[...sponsors, ...sponsors].map((sponsor, index) => (
              <div
                key={`${sponsor.name}-${index}`}
                className="min-w-[calc(33.333%-16px)] flex-shrink-0"
              >
                <motion.a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  className="relative w-full h-32 flex items-center justify-center rounded-2xl border border-border/60 bg-background/80 hover:border-primary/40 transition-all duration-300 block"
                >
                  <Image
                    src={sponsor.img}
                    alt={sponsor.name}
                    fill
                    className="object-contain p-6"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </motion.a>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-border/60 bg-background/80 p-3 hover:border-primary/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary z-10"
          aria-label="Previous sponsor"
        >
          <svg
            className="w-5 h-5 text-foreground/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-border/60 bg-background/80 p-3 hover:border-primary/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary z-10"
          aria-label="Next sponsor"
        >
          <svg
            className="w-5 h-5 text-foreground/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2">
        {sponsors.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? "w-8 bg-primary"
                : "w-2 bg-foreground/20 hover:bg-foreground/40"
            }`}
            aria-label={`Go to sponsor ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
