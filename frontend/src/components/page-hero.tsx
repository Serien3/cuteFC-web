import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";

export interface PageHeroProps {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string;
  bgImage?: string;
  buttons?: { label: string; active?: boolean; onClick?: () => void }[];
}

export function PageHero({ eyebrow, title, description, bgImage, buttons }: PageHeroProps) {
  // We want to orchestrate: text first, then background.

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-slate-50 flex flex-col justify-center min-h-[55vh] pt-32 pb-24 border-b border-slate-200/50">
      {/* Background Image - Fades in slowly with a delay, "虚弱化设计" */}
      {bgImage && (
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          {/* Using a pseudo-mask / gradient overlay to fade out the image into the background so text is perfectly readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10" />
          <img
            src={bgImage}
            alt="Hero background"
            className="w-full h-full object-cover object-right opacity-90 mix-blend-multiply filter grayscale-[10%]"
          />
        </motion.div>
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            show: {
              transition: { staggerChildren: 0.2, delayChildren: 0.1 }
            }
          }}
          className="max-w-2xl"
        >
          {eyebrow && (
            <motion.p
              variants={textVariants}
              className="text-amber-600 font-semibold tracking-widest uppercase text-sm mb-6 flex items-center gap-4"
            >
              <span className="w-8 h-px bg-amber-600/50"></span>
              {eyebrow}
            </motion.p>
          )}

          <motion.h1
            variants={textVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-8"
          >
            {title}
          </motion.h1>

          {description && (
            <motion.p
              variants={textVariants}
              className="text-lg md:text-xl text-slate-600 leading-relaxed font-light mt-4"
            >
              {description}
            </motion.p>
          )}

          {buttons && buttons.length > 0 && (
            <motion.div variants={textVariants} className="mt-12 flex flex-wrap items-center gap-4">
              {buttons.map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.onClick}
                  className={`px-8 py-3.5 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${btn.active !== false
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-amber-600 hover:shadow-amber-600/30"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-amber-300 hover:bg-amber-50"
                    }`}
                >
                  {btn.label}
                  {btn.active !== false && <ArrowRight className="w-4 h-4 ml-1" />}
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
