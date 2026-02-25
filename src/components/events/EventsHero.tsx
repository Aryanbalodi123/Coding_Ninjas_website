"use client";

import React, { useRef, useEffect, useMemo, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";

// -- Configuration --
const IMAGE_WIDTH = 400;
const IMAGE_HEIGHT = 250;
const GAP = 0;
const BASE_SPEED = 0.15;
const FAST_SPEED = 1.0;
const TEXT_TILT_LIMIT = 40;
const ORANGE_HEX = "#ff6d00";
const ORANGE_RGB = "255, 109, 0";

const eventImages = [
  { src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-CUP07125 (1) (Custom).JPG-98d713ea-157f-465e-adc7-8abae734b848", alt: "Coding event", title: "Code Wars", date: "Oct 12" },
  { src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-CUP07125 (Custom).JPG-bb7c0f69-9817-45ad-afa7-998b9b708923", alt: "Team collaboration", title: "Team Sync", date: "Nov 05" },
  { src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-CUP07737 (Custom).JPG-b4cd26f5-211c-45fd-9e3b-0eaad989d74c", alt: "Workshop session", title: "AI Workshop", date: "Nov 18" },
  { src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-DSC_0089 (Custom).JPG-e97fe3de-7fa2-4950-b76b-f122e68c2bb6", alt: "Tech presentation", title: "Tech Talk", date: "Dec 01" },
  { src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-DSC_0210 (Custom).JPG-b2b6794c-1fa3-4f36-a9a3-dd6edacd9320", alt: "Networking event", title: "Networking", date: "Dec 10" },
  { src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-DSC_2165 (Custom).JPG-8f5ffcef-d529-4b8a-a3b5-b55d74763bef", alt: "Coding Ninjas meetup", title: "Ninjas Meet", date: "Jan 15" },
  { src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_2550-min.JPG-15f819d4-12c5-48d6-8fa5-7707ec1d6585", alt: "Group activity", title: "Group Fun", date: "Feb 02" },
  { src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_2575-min.JPG-f99dd3dc-4144-42fe-8470-ae709b884fc9", alt: "Innovation challenge", title: "Innovate", date: "Feb 20" },
  { src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_3518-min.JPG-64d6b54b-4daf-475b-9593-940b87968668", alt: "Learning session", title: "Learn Sesh", date: "Mar 05" },
  { src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_6103 (1) (Custom).jpg-35d175f9-66b0-4ba9-ad85-217a9f3ed886", alt: "Community gathering", title: "Community", date: "Mar 12" },
  { src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_6478 (1) (Custom).jpg-8c2be97f-2489-498b-aa67-a66dd205acce", alt: "Hackathon", title: "Hackathon", date: "Apr 01" },
  { src: "/images/pastEvents/W9ersYUUwXSs37RqhEDFFj0sQq23-IMG_6479 (1) (Custom).jpg-443543a9-1156-4395-9b26-bd3d5ef0423b", alt: "Tech talk", title: "Future Tech", date: "Apr 15" },
];

const CarouselItem = React.memo(({
  item,
  index,
  angle,
  radius,
  isPressed,
  isMobile,
  setHoveredIndex,
  hoveredIndex
}: any) => {
  const handleMouseEnter = useCallback(() => {
    if (!isPressed) setHoveredIndex(index);
  }, [isPressed, index, setHoveredIndex]);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, [setHoveredIndex]);

  return (
    <div
      className="absolute flex items-center justify-center backface-visible"
      style={{
        width: isMobile ? '340px' : `${IMAGE_WIDTH}px`,
        height: isMobile ? '213px' : `${IMAGE_HEIGHT}px`,
        transformStyle: "preserve-3d",
        willChange: "transform",
        transform: `rotateY(${angle + 180}deg) translateZ(-${radius}px)`,
      }}
    >
      <div
        className={`relative w-full h-full cursor-pointer ${isPressed ? "pointer-events-none" : "pointer-events-auto"}`}
        style={{ transformStyle: "preserve-3d" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* IMAGE */}
        <div className="group relative w-full h-full overflow-hidden border border-white/10 bg-black transition-transform duration-500 hover:scale-105 hover:border-white/30">
          <img
            src={item.src}
            alt={item.alt}
            decoding="async"
            loading={index === 0 ? undefined : "lazy"}
            // @ts-ignore – fetchpriority is a valid HTML attribute
            fetchpriority={index === 0 ? "high" : "low"}
            className="h-full w-full object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none select-none"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100" />
        </div>

        {/* DESKTOP HOVER TOOLTIP */}
        <AnimatePresence>
          {hoveredIndex === index && !isMobile && !isPressed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, z: 0 }}
              animate={{ opacity: 1, scale: 1, z: 120 }}
              exit={{ opacity: 0, scale: 0.8, z: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute -top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
              style={{
                transformOrigin: "bottom center",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="flex flex-col items-center">
                <div className="relative flex items-center gap-3 px-4 py-2.5 rounded-full bg-black/40 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-[#ff6d00] shadow-[0_0_8px_#ff6d00]"
                  />
                  <div className="h-3 w-[1px] bg-white/10" />
                  <div className="flex items-baseline gap-2">
                    <span className="text-white text-[13px] font-semibold tracking-wide leading-none">
                      {item.title}
                    </span>
                    <span className="text-white/40 text-[11px] font-medium leading-none">
                      {item.date}
                    </span>
                  </div>
                </div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 32 }}
                  className="w-[1px] bg-gradient-to-b from-white/20 to-transparent"
                />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20 blur-[1px]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

CarouselItem.displayName = "CarouselItem";

// --- MAIN COMPONENT ---
export function EventsHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const rotationRef = useRef(0);
  const requestRef = useRef<number | undefined>(undefined);
  const speedRef = useRef(BASE_SPEED);
  const isPressedRef = useRef(false);

  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 15, stiffness: 100 });
  const smoothY = useSpring(mouseY, { damping: 15, stiffness: 100 });

  const radius = useMemo(() => {
    // Use responsive dimensions for mobile with slight spacing adjustment
    const imageWidth = isMobile ? 340 : IMAGE_WIDTH;
    const circumference = eventImages.length * (imageWidth + GAP);
    return circumference / (2 * Math.PI);
  }, [isMobile]);

  const textX = useTransform(smoothX, [-0.5, 0.5], ["-30px", "30px"]);
  const textY = useTransform(smoothY, [-0.5, 0.5], ["-30px", "30px"]);
  const textRotateX = useTransform(smoothY, [-0.5, 0.5], [TEXT_TILT_LIMIT, -TEXT_TILT_LIMIT]);
  const textRotateY = useTransform(smoothX, [-0.5, 0.5], [-TEXT_TILT_LIMIT, TEXT_TILT_LIMIT]);

  useEffect(() => {
    isPressedRef.current = isPressed;
  }, [isPressed]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    let rafPending = false;
    let pendingX = 0, pendingY = 0;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      const { innerWidth, innerHeight } = window;
      pendingX = e.clientX / innerWidth - 0.5;
      pendingY = e.clientY / innerHeight - 0.5;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          mouseX.set(pendingX);
          mouseY.set(pendingY);
          rafPending = false;
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const { innerWidth, innerHeight } = window;
        pendingX = touch.clientX / innerWidth - 0.5;
        pendingY = touch.clientY / innerHeight - 0.5;
        if (!rafPending) {
          rafPending = true;
          requestAnimationFrame(() => {
            mouseX.set(pendingX);
            mouseY.set(pendingY);
            rafPending = false;
          });
        }
      }
    };

    window.addEventListener("mousemove", handleWindowMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", checkMobile);
    };
  }, [mouseX, mouseY]);

  useEffect(() => {
    let lastTime = 0;
    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      const targetSpeed = isPressedRef.current ? FAST_SPEED : BASE_SPEED;
      speedRef.current += (targetSpeed - speedRef.current) * 0.05;

      rotationRef.current += speedRef.current;

      if (containerRef.current) {
        containerRef.current.style.transform = `translateZ(${radius}px) rotateY(${rotationRef.current}deg)`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [radius]);

  const handleMouseDown = useCallback(() => setIsPressed(true), []);
  const handleMouseUp = useCallback(() => setIsPressed(false), []);
  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
    setIsHovering(false);
    setHoveredIndex(null);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    setHasInteracted(true);
  }, []);

  const handleTouchEnd = useCallback(() => setIsPressed(false), []);

  return (
    <section
      className="events-cursor-area relative h-[60vh] md:h-[100vh] w-full overflow-hidden perspective-container -mt-36 sm:-mt-36 lg:-mt-32"
      style={{ cursor: isMobile ? "auto" : "none" }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >


      {/* TEXT LAYER */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none gap-6 will-change-transform"
        style={{
          x: textX,
          y: textY,
          rotateX: textRotateX,
          rotateY: textRotateY,
          perspective: "1000px",
        }}
      >
        <motion.h1
          animate={{
            scale: isPressed ? 0.5 : 1,
            opacity: 1,
            letterSpacing: isPressed ? "10px" : "-4px",
          }}
          transition={{ type: "spring", damping: 15, stiffness: 150 }}
          className="text-[18vw] md:text-[11vw] leading-none font-black select-none"
          style={{
            color: "rgba(255, 255, 255, 0.75)",
            WebkitTextStroke: "2px rgba(255, 255, 255, 0.9)",
            textShadow: "0 0 30px rgba(255, 255, 255, 0.5)",
            filter: "drop-shadow(0 0 15px rgba(255,255,255,0.3))",
          }}
        >
          EVENTS
        </motion.h1>

        <motion.p
          animate={{
            opacity: isPressed ? 0.3 : 0.6,
            y: isPressed ? 10 : 0,
          }}
          transition={{ type: "spring", damping: 15, stiffness: 150 }}
          className="text-white/60 text-base md:text-xl font-medium tracking-wider select-none"
          style={{
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          Relive Our Amazing Moments
        </motion.p>
      </motion.div>

      {/* 3D CAROUSEL */}
      <div className="flex h-full items-center justify-center">
        <motion.div
          className="relative flex h-full w-full items-center justify-center"
          style={{
            perspective: "1200px",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          <div
            ref={containerRef}
            className="preserve-3d relative flex h-[400px] md:h-[600px] w-full items-center justify-center will-change-transform"
          >
            {eventImages.map((item, index) => {
              const angle = (360 / eventImages.length) * index;
              return (
                <CarouselItem
                  key={index}
                  index={index}
                  item={item}
                  angle={angle}
                  radius={radius}
                  isPressed={isPressed}
                  isMobile={isMobile}
                  setHoveredIndex={setHoveredIndex}
                  hoveredIndex={hoveredIndex}
                />
              );
            })}
          </div>
        </motion.div>
      </div>



      <style jsx>{`
        .perspective-container { perspective: 1200px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-visible { backface-visibility: visible; }
        .will-change-transform { will-change: transform; }
      `}</style>
    </section>
  );
}