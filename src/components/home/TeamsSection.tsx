"use client";

import React from "react";
import { motion } from "framer-motion";

function FireGlassCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative group w-72 h-44 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_4px_30px_rgba(255,80,0,0.25)] flex items-center justify-center">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff3c00">
              <animate
                attributeName="offset"
                values="0;1;0"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="25%" stopColor="#ff9a00">
              <animate
                attributeName="offset"
                values="0.25;0.75;0.25"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="75%" stopColor="#ffff00">
              <animate
                attributeName="offset"
                values="0.75;1;0.75"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#ff3c00" />
          </linearGradient>

          <filter id="fireGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect
          x="4"
          y="4"
          width="calc(100% - 8px)"
          height="calc(100% - 8px)"
          rx="16"
          ry="16"
          fill="none"
          stroke="url(#fireGradient)"
          strokeWidth="4"
          strokeDasharray="1200"
          strokeDashoffset="1200"
          className="animate-[fireFlow_4s_linear_infinite]"
          style={{ filter: "url(#fireGlow)" }}
        />
      </svg>

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <h3 className="text-xl font-heading tracking-wide text-foreground">
          {title}
        </h3>
        <p className="text-sm text-foreground/70 mt-2">{description}</p>
      </div>

      <style jsx>{`
        @keyframes fireFlow {
          0% {
            stroke-dashoffset: 1200;
            filter: drop-shadow(0 0 6px orange);
          }
          50% {
            stroke-dashoffset: 600;
            filter: drop-shadow(0 0 20px yellow);
          }
          100% {
            stroke-dashoffset: 0;
            filter: drop-shadow(0 0 10px red);
          }
        }
        @keyframes flicker {
          0%,
          19%,
          21%,
          23%,
          25%,
          54%,
          56%,
          100% {
            opacity: 1;
          }
          20%,
          24%,
          55% {
            opacity: 0.5;
          }
          22% {
            opacity: 0.3;
          }
        }
        .group:hover svg rect {
          animation:
            fireFlow 2.5s linear infinite,
            flicker 0.5s infinite;
        }
      `}</style>
    </div>
  );
}

export default function TeamsPage() {
  const teams = [
    {
      name: "Technical Team",
      desc: "Developers, infrastructure, and innovation.",
    },
    { name: "Design Team", desc: "UI/UX, creativity, and visual design." },
    { name: "Content Team", desc: "Writing and storytelling experts." },
    { name: "Marketing Team", desc: "Outreach, branding, and campaigns." },
    { name: "Operations Team", desc: "Execution and strategic planning." },
    { name: "Event Team", desc: "Organizing and managing experiences." },
  ];

  return (
    <main
      className={`relative min-h-screen flex flex-col items-center justify-center text-foreground p-10 space-y-16`}
    >
      <motion.h1
        // Updated font size to be responsive, matching Hero.tsx
        className="text-4xl font-heading font-semibold text-foreground md:text-6xl text-center"
        initial={{ opacity: 0, y: -80, scale: 0.8 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
        viewport={{ once: true }}
      >
        Meet Our Teams
      </motion.h1>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {teams.map((team, i) => (
          <FireGlassCard key={i} title={team.name} description={team.desc} />
        ))}
      </motion.div>
    </main>
  );
}
