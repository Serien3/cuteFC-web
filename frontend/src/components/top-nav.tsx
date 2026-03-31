import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export const navItems = [
  { to: "/app", label: "Dashboard", end: true },
  { to: "/app/platform", label: "Platform", end: false },
  { to: "/app/pipeline", label: "Pipeline", end: false },
  { to: "/app/genetic-map", label: "Genetic Map", end: false },
  { to: "/app/showcase", label: "Showcase", end: false }
];

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    // Trigger once on mount
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 lg:px-20 py-6 transition-all duration-500 ${
        scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-black/5 py-4 shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="cursor-pointer" onClick={() => navigate('/')}>
        <span className="text-2xl md:text-3xl font-serif italic tracking-tight text-slate-900 hover:text-amber-600 transition-colors duration-300">
          cuteFC.
        </span>
      </div>

      <div className="flex items-center gap-8 lg:gap-12">
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `
                  text-[11px] font-bold tracking-[0.1em] uppercase transition-colors relative
                  ${isActive ? 'text-amber-600' : 'text-slate-500 hover:text-slate-900'}
                `}
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTopNavIndicator"
                        className="absolute -bottom-2 left-0 right-0 h-[2px] bg-amber-600"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
        <button
          onClick={() => navigate('/app/pipeline/new')}
          className="px-6 py-2.5 border border-slate-300 hover:border-slate-800 text-slate-800 text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-300 hover:bg-slate-900 hover:!text-slate-50 rounded-none backdrop-blur-sm shadow-sm"
        >
          New Analysis
        </button>
      </div>
    </motion.nav>
  );
}
