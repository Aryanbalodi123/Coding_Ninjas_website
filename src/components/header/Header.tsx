"use client";

import type { Route } from "next";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { navigationLinks } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { CTAButton } from "../ui/CTAButton";

export const Header = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    fullname?: string;
    email?: string;
  } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const listener = () => {
      setIsScrolled(window.scrollY > 24);
    };
    listener();
    window.addEventListener("scroll", listener);
    return () => window.removeEventListener("scroll", listener);
  }, []);

  // fetch current user (if any) so header can show logged-in state
  useEffect(() => {
    let mounted = true;
    const CACHE_KEY = "auth_cache";
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    const fetchMe = async (forceRefresh = false) => {
      // Check cache first
      if (!forceRefresh) {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { user, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            if (mounted) setUser(user);
            return;
          }
        }
      }

      try {
        const res = await fetch("/api/hiring/me", { credentials: "include" });
        if (!res.ok) {
          if (mounted) setUser(null);
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ user: null, timestamp: Date.now() }),
          );
          return;
        }
        const data = await res.json();
        const userData = data.user || null;
        if (mounted) setUser(userData);
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ user: userData, timestamp: Date.now() }),
        );
      } catch {
        if (mounted) setUser(null);
      }
    };

    // Fetch user immediately on mount (with cache)
    fetchMe();

    // Refetch when page visibility changes (user returns from signin/signup page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchMe(true); // Force refresh on visibility change
      }
    };

    // Refetch when user signs in
    const handleUserSignin = () => {
      fetchMe(true); // Force refresh on signin
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("user-signin", handleUserSignin);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("user-signin", handleUserSignin);
    };
  }, []);

  const handleSignout = async () => {
    try {
      await fetch("/api/hiring/signout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Signout failed", err);
    }

    // clear any local storage we use for hiring flow
    try {
      localStorage.removeItem("selectedRole");
    } catch { }

    // clear the auth session cache so fetchMe doesn't restore stale user
    try {
      sessionStorage.removeItem("auth_cache");
    } catch { }

    // update UI
    setUser(null);
    setShowLogoutConfirm(false);
    // redirect to hiring page
    window.location.href = "/hiring";
  };

  const handleLogoutClick = () => {
    console.log("Logout clicked, showing confirmation...");
    setShowLogoutConfirm(true);
  };

  // no session UI in header: always show Join Club CTA which goes to /signin

  // no persistent avatar logic here: header always shows Join Club button (icon-only)

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex justify-center px-4 transition-all duration-300 ease-out",
        isScrolled ? "py-4" : "py-6",
      )}
    >
      <nav
        aria-label="Primary navigation"
        className={cn(
          "container-grid flex items-center justify-between gap-6 rounded-full border border-border/60 bg-background/80 px-6 py-4 backdrop-blur-xl transition-all duration-300",
          isScrolled && "shadow-soft",
        )}
      >
        {/* LOGO + TITLE */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Image
              src="/images/cn_logo.png"
              alt="Coding Ninjas Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
            Coding Ninjas
          </Link>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden items-center gap-10 lg:flex">
          {navigationLinks.map((link) => {
            const isAnchor = link.href.includes("#");
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href.replace(/#.*$/, ""));
            const className = cn(
              "text-sm text-foreground/70 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive && "text-foreground",
            );

            return isAnchor ? (
              <a
                key={link.href}
                href={link.href}
                className={className}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href as Route}
                onClick={() => setIsMenuOpen(false)}
                className={className}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* DESKTOP CTA + LOGOUT ICON */}
        <div className="hidden lg:flex items-center gap-4">
          <CTAButton
            href={user ? "/hiring" : "/hiring/signin"}
            trackingId="header-join"
          >
            Join Club
          </CTAButton>
          {user && (
            <button
              onClick={handleLogoutClick}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-500 hover:bg-orange-500/30 hover:border-orange-500 transition-all duration-300"
              aria-label="Logout"
              type="button"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 text-sm text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="sr-only">Toggle navigation</span>
          <div className="flex flex-col gap-1.5">
            {[0, 1, 2].map((idx) => (
              <span
                key={idx}
                className={cn(
                  "block h-0.5 w-5 bg-foreground transition-all duration-300",
                  isMenuOpen && idx === 0 && "translate-y-2 rotate-45",
                  isMenuOpen && idx === 1 && "opacity-0",
                  isMenuOpen && idx === 2 && "-translate-y-2 -rotate-45",
                )}
              />
            ))}
          </div>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 right-0 top-full mt-3 px-4 lg:hidden"
          >
            <div className="container-grid flex flex-col gap-4 rounded-3xl border border-border/60 bg-background/95 p-6 backdrop-blur-2xl">
              {navigationLinks.map((link) => {
                const isAnchor = link.href.includes("#");
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href.replace(/#.*$/, ""));

                const className = cn(
                  "text-base transition",
                  isActive
                    ? "text-foreground"
                    : "text-foreground/80 hover:text-foreground",
                );

                return isAnchor ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className={className}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href as Route}
                    className={className}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <CTAButton
                href={user ? "/hiring" : "/hiring/signin"}
                trackingId="mobile-join"
                onClick={() => setIsMenuOpen(false)}
              >
                Join Club
              </CTAButton>
              {/* mobile: show logout icon if user present */}
              {user && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogoutClick();
                  }}
                  type="button"
                  className="flex items-center justify-center w-full py-3 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-500 font-semibold hover:bg-orange-500/30 transition-all duration-300 gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutConfirm(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl bg-background border border-orange-500/30 p-8 shadow-2xl max-w-sm mx-4"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Confirm Logout
              </h2>
              <p className="text-foreground/70 text-base mb-6">
                Are you sure you want to logout?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  type="button"
                  className="flex-1 py-3 rounded-full border border-orange-500/30 text-orange-500 font-semibold hover:bg-orange-500/10 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignout}
                  type="button"
                  className="flex-1 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
