import React from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { TopNav } from "./top-nav";

const FluidBackground: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none bg-[#fdfdfd]">
      <motion.div
        animate={{ x: ['0%', '15%', '-5%', '0%'], y: ['0%', '10%', '-15%', '0%'], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#d6eaff] mix-blend-multiply blur-[140px] opacity-80"
      />
      <motion.div
        animate={{ x: ['0%', '-20%', '10%', '0%'], y: ['0%', '15%', '-10%', '0%'], scale: [1, 1.2, 0.8, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#fdf1cb] mix-blend-multiply blur-[160px] opacity-80"
      />
      <motion.div
        animate={{ x: ['0%', '10%', '-15%', '0%'], y: ['0%', '-20%', '10%', '0%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-[#e0f7f1] mix-blend-multiply blur-[150px] opacity-90"
      />
      <div className="absolute inset-0 opacity-[0.3] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM1NTUiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
    </div>
  );
};



export function AppShell() {
  return (
    <div className="min-h-screen font-sans relative flex flex-col selection:bg-amber-200 selection:text-slate-900">
      <FluidBackground />

      <TopNav />

      {/* Main Content Area with Page Transitions */}
      <main className="flex-1 flex flex-col relative z-10 pt-32 pb-16 px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="h-full w-full"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
