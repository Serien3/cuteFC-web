import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { TopNav } from '../components/top-nav';
import HeroGenomicModel from '../components/HeroGenomicModel';

/* =========================================
   FLUID MESH BACKGROUND (INSITRO-LIKE BLUE/YELLOW)
   ========================================= */
const FluidBackground: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none bg-[#fdfdfd]">
      <motion.div
        animate={{
          x: ['0%', '15%', '-5%', '0%'],
          y: ['0%', '10%', '-15%', '0%'],
          scale: [1, 1.1, 0.9, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#d6eaff] mix-blend-multiply blur-[140px] opacity-80"
      />
      <motion.div
        animate={{
          x: ['0%', '-20%', '10%', '0%'],
          y: ['0%', '15%', '-10%', '0%'],
          scale: [1, 1.2, 0.8, 1]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#fdf1cb] mix-blend-multiply blur-[160px] opacity-80"
      />
      <motion.div
        animate={{
          x: ['0%', '10%', '-15%', '0%'],
          y: ['0%', '-20%', '10%', '0%']
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-[#e0f7f1] mix-blend-multiply blur-[150px] opacity-90"
      />
      <div className="absolute inset-0 opacity-[0.3] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM1NTUiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
    </div>
  );
};

/* =========================================
   PARTICLE NETWORK (INSITRO GENOME NET)
   ========================================= */
const ParticleNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => { mouse = { x: -1000, y: -1000 }; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const initParticles = () => {
      particles = [];
      const numParticles = Math.min(Math.floor(width * height / 8000), 120);
      for (let i = 0; i < numParticles; i++) {
        const isRightWall = Math.random() > 0.4;
        const x = isRightWall
          ? width * 0.65 + (Math.random() - 0.5) * (width * 0.5)
          : Math.random() * width;
        const y = Math.random() * height;
        particles.push({
          x, y, originX: x, originY: y,
          vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 0.5,
          color: Math.random() > 0.6 ? 'rgba(40, 110, 180, 0.4)' : 'rgba(230, 150, 40, 0.4)'
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p, index) => {
        p.x += p.vx; p.y += p.vy;
        if (Math.abs(p.x - p.originX) > 80) p.vx *= -1;
        if (Math.abs(p.y - p.originY) > 80) p.vy *= -1;

        const dxMouse = p.x - mouse.x;
        const dyMouse = p.y - mouse.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        const minDist = 150;

        if (distMouse < minDist) {
          const force = (minDist - distMouse) / minDist;
          p.x += (dxMouse / distMouse) * force * 2;
          p.y += (dyMouse / distMouse) * force * 2;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x; const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 130;
          if (distance < maxDist) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
            const opacity = 0.1 * (1 - distance / maxDist);
            ctx.strokeStyle = `rgba(100, 150, 200, ${opacity})`;
            ctx.lineWidth = 1; ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width; canvas.height = height; initParticles();
    };

    window.addEventListener('resize', handleResize);
    initParticles(); draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-screen h-screen z-10 pointer-events-none" />;
};

/* =========================================
   ANIMATED TEXT REVEAL COMPONENTS
   ========================================= */
const RevealText: React.FC<{ text: string, delay?: number, className?: string, as?: React.ElementType, animateOn?: 'load' | 'scroll' }> = ({
  text, delay = 0, className, as: Component = 'div', animateOn = 'scroll'
}) => {
  return (
    <div className="overflow-hidden pb-4">
      <motion.div
        initial={{ y: "115%" }}
        animate={animateOn === 'load' ? { y: 0 } : undefined}
        whileInView={animateOn === 'scroll' ? { y: 0 } : undefined}
        viewport={{ once: true, margin: "0px" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
        className={className}
      >
        <Component>{text}</Component>
      </motion.div>
    </div>
  );
};

const AnimatedLink: React.FC<{ text: string, onClick?: () => void }> = ({ text, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      initial="initial"
      whileHover="hover"
      className="group flex items-center gap-4 text-slate-900 transition-colors uppercase tracking-[0.1em] text-[13px] font-bold mt-10"
    >
      <span className="group-hover:text-amber-600 transition-colors duration-300">{text}</span>
      <div className="relative w-12 h-[1px] bg-slate-400 group-hover:bg-amber-600 transition-colors duration-300">
        <motion.div
          variants={{ initial: { x: 0 }, hover: { x: 8 } }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute -right-[1px] -top-[5.5px] text-slate-400 group-hover:text-amber-600"
        >
          <ChevronRight className="w-3 h-3" />
        </motion.div>
      </div>
    </motion.button>
  );
};

/* =========================================
   MAIN LANDING PAGE
   ========================================= */

/* =========================================
   PHOTO WALL CAROUSEL
   ========================================= */
const CAROUSEL_ITEMS = [
  {
    id: 1,
    title: "cuteFC计算方法的总体技术路线",
    description: "cuteFC面向群体结构变异联合检测中的重分型任务，构建了一条“特征提取—聚类识别—覆盖统计—似然分型”的技术路线：首先从长读长测序比对结果中提取能够表征插入、缺失、重复、倒位和易位等结构变异的信号特征，并结合目标VCF位点集合筛选候选区域；随后针对不同基因组场景，采用自适应聚类与多等位基因感知聚类策略，从复杂噪声背景中精准识别替代等位基因特征；在此基础上，引入GPS线性扫描算法，对目标位点周围的覆盖读段进行高效统计，分离参考等位基因与替代等位基因支持证据；最后基于最大似然估计模型对各目标结构变异位点完成基因型判定，从而在保证准确性的同时兼顾大规模群体数据处理中的计算效率与工程可扩展性。",
    // How to replace: change `imgSrc` to your actual image path inside the public/ folder, e.g., '/images/example1.jpg'
    imgSrc: "showcase/图片1.png"
  },
  {
    id: 2,
    title: "构建中国100人队列结构变异图谱的统计结果",
    description: "在大规模中国队列的基因型重分型基准测试中，cuteFC展现出更优的群体分析性能与结果可靠性：其生成的结构变异集合在经过严格群体遗传统计过滤后，低质量位点比例最低，同时保留了最多的高质量结构变异，说明该方法能够在控制假阳性的同时尽可能保留具有研究价值的有效变异；进一步的分类型统计、群体等位基因频率一致性比较以及低频变异验证结果表明，cuteFC不仅在插入、缺失等多类结构变异上均具有较强的位点恢复能力，而且其结果与群体遗传规律及全球高质量参考队列表现出更好一致性，尤其在单例、双例等低频结构变异场景下仍具备较高的判别准确性，因此更适合作为大规模中国人群结构变异图谱构建的基础重分型工具。",
    imgSrc: "showcase/图片2.jpg"
  },
  {
    id: 3,
    title: "中国队列变异等位基因频率一致性和验证的基准结果",
    description: "在大规模中国队列的基因型重分型基准测试中，cuteFC展现出更优的群体分析性能与结果可靠性：其生成的结构变异集合在经过严格群体遗传统计过滤后，低质量位点比例最低，同时保留了最多的高质量结构变异，说明该方法能够在控制假阳性的同时尽可能保留具有研究价值的有效变异；进一步的分类型统计、群体等位基因频率一致性比较以及低频变异验证结果表明，cuteFC不仅在插入、缺失等多类结构变异上均具有较强的位点恢复能力，而且其结果与群体遗传规律及全球高质量参考队列表现出更好一致性，尤其在单例、双例等低频结构变异场景下仍具备较高的判别准确性，因此更适合作为大规模中国人群结构变异图谱构建的基础重分型工具。",
    imgSrc: "showcase/实验图2.jpg"
  },
  {
    id: 4,
    title: "中国十万人基因组计划",
    description: "“中国十万人基因组计划”是我国首个完全自主实施的人类全基因组计划。该计划的核心目标是选取覆盖中国主要地区和多个民族的十万自然人群，通过测序绘制精度达到万分之一的中国人基因组变异图谱，并结合表型组、暴露组数据构建“中国人多组学健康地图”。项目旨在系统揭示中国人群特有的基因组变异及其对健康的影响，从而破解制约我国精准医学发展的数据瓶颈，为疾病的个性化预防、诊断与治疗提供关键的基础参考数据库，对推动“健康中国”建设具有重大战略意义",
    imgSrc: "showcase/十万人2.jpg"
  },
  {
    id: 5,
    title: "基于典型示例的 cuteFC 工作流程示意图",
    description: "",
    imgSrc: "showcase/示例图.jpg"
  }

];



const PhotoWallCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length);
  };

  return (
    <section className="relative z-20 w-full py-24 md:py-32 bg-white/50 backdrop-blur-md border-t border-slate-200/60 overflow-hidden">
      <div className="px-8 md:px-16 lg:px-20 xl:px-40 mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-20">
        <div className="max-w-none">
          <h2 className="text-[2.25rem] md:text-[3.5rem] lg:text-[4rem] font-serif text-slate-900 leading-[1.1] whitespace-nowrap">Capabilities at a Glance.</h2>
        </div>
        <div className="pb-2 text-slate-500 text-[11px] font-bold tracking-[0.2em] uppercase flex items-center gap-4">
          <button onClick={handlePrev} className="hover:text-amber-600 transition-colors uppercase w-8 h-8 flex items-center justify-center border border-slate-300 rounded-full">&lt;</button>
          <button onClick={handleNext} className="hover:text-amber-600 transition-colors uppercase w-8 h-8 flex items-center justify-center border border-slate-300 rounded-full">&gt;</button>
        </div>
      </div>

      {/* 3D Rotary Stage */}
      <div className="relative w-full h-[700px] md:h-[800px] flex justify-center items-center perspective-[1200px] z-10 overflow-hidden px-4 md:px-0">
        {CAROUSEL_ITEMS.map((item, i) => {

          let offset = i - activeIndex;
          if (offset > Math.floor(CAROUSEL_ITEMS.length / 2)) offset -= CAROUSEL_ITEMS.length;
          if (offset < -Math.floor(CAROUSEL_ITEMS.length / 2)) offset += CAROUSEL_ITEMS.length;

          const isActive = offset === 0;
          const isVisible = Math.abs(offset) <= 1;

          return (
            <motion.div
              key={item.id}
              onClick={() => setActiveIndex(i)}
              animate={{
                x: `${offset * 85}%`,
                scale: isActive ? 1 : 0.75,
                rotateY: offset * -25,
                z: isActive ? 0 : -200,
                opacity: isVisible ? (isActive ? 1 : 0.4) : 0,
                zIndex: isActive ? 30 : isVisible ? 20 : 10,
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: "preserve-3d" }}
              className={`absolute w-[90vw] md:w-[800px] lg:w-[1100px] h-[500px] md:h-[650px] flex flex-col md:flex-row bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-200/60 overflow-hidden cursor-pointer ${!isVisible && 'pointer-events-none'}`}
            >
              {/* Image Section */}
              <div className="relative w-full md:w-[60%] aspect-[4/3] md:aspect-auto bg-white overflow-hidden group flex items-center justify-center p-4">
                {item.imgSrc ? (
                  <img src={item.imgSrc} alt={item.title} className="absolute inset-0 w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#f8fafc] to-[#f1f5f9] flex items-center justify-center transition-transform duration-1000 group-hover:scale-105">
                    <span className="text-slate-400 font-bold tracking-[0.15em] uppercase text-[10px] z-10">[ Place Image Here ]</span>
                  </div>
                )}
                {/* Active overlay border & hover filter */}
                <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${isActive ? 'bg-transparent' : 'bg-slate-900/10 backdrop-blur-[2px]'}`} />
              </div>

              {/* Text Section */}
              <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-12 relative overflow-hidden bg-white">
                <h3 className={`text-2xl md:text-3xl font-serif text-slate-900 mb-4 transition-colors duration-500 ${!isActive && 'text-slate-400'}`}>{item.title}</h3>
                <p className={`text-slate-600 text-[1.05rem] leading-[1.6] transition-opacity duration-500 ${!isActive && 'opacity-60'}`}>{item.description}</p>
                <div className={`mt-8 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                  <AnimatedLink text="Learn More" onClick={() => { }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative text-slate-900 overflow-x-hidden font-sans selection:bg-amber-200/50 min-h-screen">
      <FluidBackground />
      <ParticleNetwork />

      <TopNav />

      {/* HERO SECTION */}
      <main className="relative w-full h-[100vh] flex flex-col justify-center px-8 md:px-16 lg:px-20 xl:px-40 z-20">
        <div className="absolute right-[-10%] lg:right-[5%] xl:right-[15%] top-[50%] -translate-y-[55%] w-[500px] h-[500px] lg:w-[800px] lg:h-[800px] hidden md:flex items-center justify-center pointer-events-none z-0"><HeroGenomicModel className="w-full h-full" /></div>
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="pt-24 relative w-full flex flex-col justify-center max-w-[50rem] z-10 pointer-events-none">

          <div className="font-serif text-[3.5rem] md:text-[5rem] lg:text-[7rem] leading-[1.05] tracking-tight text-slate-900 mb-10 pointer-events-auto">
            <RevealText text="Visualizing" delay={0.1} animateOn="load" />
            <RevealText text="Genomes." delay={0.2} className="text-amber-600 italic" animateOn="load" />
            <RevealText text="Differently." delay={0.3} animateOn="load" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[42rem] pointer-events-auto"
          >
            <p className="text-[1.125rem] md:text-[1.25rem] text-slate-700 leading-[1.6] font-normal">
              在 cuteFC，我们致力于构建一个与众不同的平台，借助机器学习与大规模数据的力量，更快速地将更高质量的结构变异洞见带给最需要的研究者，解码基因组学的复杂性。
            </p>
            <AnimatedLink text="Discover Our Pipeline" onClick={() => navigate('/app')} />
          </motion.div>

        </motion.div>

        {/* SCROLL INDICATOR */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1.5 }}
          className="absolute bottom-16 right-8 md:right-16 lg:right-20 z-20 flex flex-col items-center gap-6 text-slate-400 text-[10px] tracking-[0.2em] uppercase font-bold"
        >
          <span className="-rotate-90 origin-bottom whitespace-nowrap mb-16">Scroll for More</span>
          <div className="w-[1px] h-20 bg-gradient-to-b from-slate-400 to-transparent"></div>
        </motion.div>
      </main>

      {/* SECTION 1: PHOTO CAROUSEL */}
      <PhotoWallCarousel />

      {/* SECTION 2: Pipeline */}
      <section className="relative z-20 w-full px-8 md:px-16 lg:px-20 xl:px-40 py-32 md:py-40 flex items-center border-t border-slate-200/60 bg-white/40 backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 w-full max-w-7xl mx-auto relative z-10">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <RevealText
              text="A Pipeline for Genomic Benefit, by Design"
              className="text-[2.25rem] md:text-[3.5rem] lg:text-[4rem] font-serif text-slate-900 mb-6 leading-[1.1]"
              as="h2"
            />
          </div>
          <div className="lg:col-span-5 lg:col-start-8 flex flex-col justify-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-slate-700 text-[1.125rem] md:text-[1.25rem] leading-[1.6] font-normal"
            >
              凭借由 cuteFC 平台产生的一系列洞察，我们正在构建一套强大的工具集，用于识别结构变异、过滤噪声，并实现证据图谱的视觉重构，以推动基因组学研究。
            </motion.p>
            <AnimatedLink text="Explore Pipeline" />
          </div>
        </div>
      </section>

      {/* SECTION 3: Platform */}
      <section className="relative z-20 w-full px-8 md:px-16 lg:px-20 xl:px-40 py-32 md:py-40 flex items-center border-t border-slate-200/60 bg-white/60 backdrop-blur-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 w-full max-w-7xl mx-auto relative z-10">
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-slate-700 text-[1.125rem] md:text-[1.25rem] leading-[1.6] font-normal"
            >
              cuteFC 依托先进的计算分析能力，提供快速且精准的结构变异重分型服务。您可上传基因组测序结果，系统将自动识别基因组中的结构变异位点，并为医学参考与研究应用提供可靠依据。
            </motion.p>
            <AnimatedLink text="View Platform Architecture" />
          </div>
          <div className="lg:col-span-6 lg:col-start-7 flex flex-col justify-center order-1 lg:order-2">
            <RevealText
              text="Robust Analysis Platform, Fueled by Data"
              className="text-[2.25rem] md:text-[3.5rem] lg:text-[4rem] font-serif text-slate-900 mb-6 leading-[1.1]"
              as="h2"
            />
          </div>
        </div>
      </section>

      {/* SECTION 4: Large Quote Box */}
      <section className="relative z-20 w-full px-8 md:px-16 lg:px-20 xl:px-40 py-40 md:py-56 border-y border-slate-200/60 bg-gradient-to-b from-white/70 to-slate-50/70 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <RevealText
            text="“We set out to create a unique interface that unites callers from diverse paradigms into a single, intuitive truth screen.”"
            className="text-[2rem] md:text-[2.75rem] font-serif text-slate-900 leading-[1.25] mb-12"
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-slate-500 font-bold uppercase tracking-[0.15em] text-[11px]"
          >
            The cuteFC Development Team
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: Team/Network */}
      <section className="relative z-20 w-full px-8 md:px-16 lg:px-20 xl:px-40 py-32 md:py-40 flex flex-col justify-center items-center text-center bg-white/80 backdrop-blur-md">
        <div className="max-w-[48rem] mx-auto flex flex-col items-center">
          <RevealText
            text="A System Greater Than the Sum of Its Parts"
            className="text-[2.25rem] md:text-[3.5rem] lg:text-[4rem] font-serif text-slate-900 mb-8 leading-[1.1]"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-slate-700 text-[1.125rem] md:text-[1.25rem] leading-[1.6] font-normal mt-2 mb-10"
          >
            我们建立了一种独特的基因组学文化环境。在这里，生命科学家、数据工程师和药物研发专家并肩协作，共同确认最核心的研究课题，设计可扩展的识别架构，并对结果进行无缝分析。
          </motion.p>
          <AnimatedLink text="Meet The Network" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 w-full px-8 md:px-16 lg:px-20 xl:px-40 py-20 md:py-32 border-t border-slate-200 bg-[#fbfcfd]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 w-full max-w-7xl mx-auto text-[13px] text-slate-500 font-normal">
          <div className="md:col-span-5 lg:col-span-6">
            <span className="text-[2.5rem] font-serif italic tracking-tight text-slate-900 block mb-10">
              cuteFC.
            </span>
            <div className="space-y-4">
              <p>General Inquiries: <a href="#" className="text-amber-600 hover:text-amber-700 transition-colors">info@cutefc.local</a></p>
              <p>Partner Opportunities: <a href="#" className="text-amber-600 hover:text-amber-700 transition-colors">science@cutefc.local</a></p>
              <div className="pt-6">
                <p className="leading-relaxed">HIT-Bioinformatics</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 lg:col-span-3 pt-4">
            <div className="flex flex-col gap-5 uppercase tracking-[0.1em] font-bold text-[11px]">
              <a href="#" className="text-slate-800 hover:text-amber-600 transition-colors">Platform</a>
              <a href="#" className="text-slate-800 hover:text-amber-600 transition-colors">Pipeline</a>
              <a href="#" className="text-slate-800 hover:text-amber-600 transition-colors">People</a>
            </div>
          </div>

          <div className="md:col-span-4 lg:col-span-3 pt-4">
            <div className="flex flex-col gap-5 uppercase tracking-[0.1em] font-bold text-[11px]">
              <a href="#" className="text-slate-800 hover:text-amber-600 transition-colors">Publications & Press</a>
              <a href="#" className="text-slate-800 hover:text-amber-600 transition-colors">Join Us</a>
              <a href="#" className="text-slate-800 hover:text-amber-600 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto mt-24 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-[11px] uppercase tracking-wider font-bold">
          <p>© 2026 cuteFC. All Rights Reserved.</p>
          <div className="flex gap-8 mt-6 md:mt-0 text-slate-800">
            <a href="#" className="hover:text-amber-600 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-amber-600 transition-colors">GitHub</a>
            <a href="#" className="hover:text-amber-600 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
