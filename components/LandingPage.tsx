"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Zap,
  Monitor,
  Aperture,
  ArrowRight,
  Layers,
  Smartphone,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  X,
  Plus,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

interface LandingPageProps {
  onStart: () => void;
}

// Hook for scroll reveal animation
const useScrollReveal = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// FAQ Item Component
const FAQItem: React.FC<{
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  index: number;
}> = ({ question, answer, isOpen, onClick, index }) => {
  return (
    <div
      className={`border-b border-white/5 last:border-0 transition-colors duration-500 ${
        isOpen ? "bg-white/[0.02]" : "hover:bg-white/[0.01]"
      }`}
    >
      <button
        onClick={onClick}
        className="w-full py-8 px-6 text-left flex items-center justify-between gap-6 focus:outline-none group"
      >
        <span
          className={`text-xl font-medium transition-colors duration-300 ${
            isOpen ? "text-white" : "text-neutral-400 group-hover:text-white"
          }`}
        >
          {question}
        </span>
        <div
          className={`relative flex-shrink-0 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            isOpen
              ? "bg-white text-black rotate-45 border-white"
              : "bg-transparent text-white group-hover:border-white/30"
          }`}
        >
          <Plus className="w-5 h-5" />
        </div>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-8 text-neutral-400 leading-relaxed text-lg max-w-3xl font-light">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: faqRef, isVisible: faqVisible } = useScrollReveal(0.2);
  const [showShowreel, setShowShowreel] = useState(false);
  const { scrollY } = useScroll();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 250]);
  const heroOpacity = useTransform(scrollY, [0, 700], [1, 0]);

  const faqs = [
    {
      question: "How does Crystal work without installation?",
      answer:
        "Crystal leverages advanced browser capabilities (Navigator.mediaDevices) to capture your screen and camera directly within the DOM. No .exe, .dmg, or extensions are needed. It runs entirely in your browser's secure sandbox.",
    },
    {
      question: "Is my recording private?",
      answer:
        "Absolutely. Processing happens locally on your machine. Your video streams are never uploaded to our servers. When you download the video, it's generated directly from your browser's memory.",
    },
    {
      question: "What is the maximum recording quality?",
      answer:
        "We support up to 4K (3840x2160) resolution at 60fps, depending on your device's hardware capabilities. The default export format is high-bitrate WebM, compatible with all modern editors.",
    },
    {
      question: "Can I record system audio?",
      answer:
        "Yes. When the browser prompts you to select a screen, simply check the 'Share system audio' box. Crystal mixes your microphone input with system audio automatically for a professional soundscape.",
    },
    {
      question: "Is it completely free?",
      answer:
        "Crystal is currently in a free public beta. All features, including 4K recording and unlimited duration (browser memory dependent), are available at no cost.",
    },
  ];

  const handleFaqClick = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col overflow-hidden"
    >
      {/* Navigation / Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 glass px-4 py-2 rounded-full">
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <Aperture className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Crystal
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-4">
          {/* <button className="hidden md:block text-sm font-medium text-neutral-400 hover:text-white transition-colors px-4">
            Sign In
          </button> */}
          <button
            onClick={onStart}
            className="px-5 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Scrollable Area */}
      <div className="flex-1 flex flex-col items-center pt-32 px-6">
        {/* Hero Section */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="text-center max-w-5xl mx-auto mb-32"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-neutral-300 tracking-wider uppercase">
              System Operational
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 leading-[0.9]"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500">
              Crystal.
            </span>
            <br />
            <span className="text-shimmer">Capture Reality.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed tracking-wide"
          >
            The next generation of screen recording.
            <span className="text-neutral-200">
              {" "}
              Zero latency. Crystal clarity.
            </span>
            <br />
            No Account. No Sign Up. And
            <b className="text-white hover:text-white/80 transition-colors">
              it's Free.
            </b>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <button
              onClick={onStart}
              className="group relative px-10 py-5 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_50px_-15px_rgba(255,255,255,0.4)] overflow-hidden flex items-center gap-3"
            >
              <span className="relative z-10">Start Recording</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button
              onClick={() => setShowShowreel(true)}
              className="px-10 py-5 rounded-full font-medium text-lg text-white border border-white/10 hover:bg-white/5 transition-all flex items-center gap-3 backdrop-blur-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Showreel</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Bento Grid Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-5 w-full max-w-[1400px] mb-32">
          {/* Large Feature - Studio Quality */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            className="md:col-span-2 md:row-span-2 relative h-[500px] md:h-auto rounded-[32px] border border-white/10 bg-neutral-900/40 backdrop-blur-md overflow-hidden group"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                alt="Abstract Dark Glass"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-end p-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-6 shadow-lg">
                <Aperture className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-3xl font-medium mb-3 text-white">
                Studio Quality
              </h3>
              <p className="text-neutral-400 text-lg max-w-md">
                Engineered for perfection. Record in 4K with adaptive bitrate
                and lossless audio processing.
              </p>
            </div>
          </motion.div>

          {/* Feature 2 - Dual Stream */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            className="md:col-span-1 relative h-[300px] md:h-auto rounded-[32px] border border-white/10 bg-neutral-900/40 backdrop-blur-md overflow-hidden group"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop"
                alt="Technology"
                className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/60"></div>
            </div>
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-white">
                  Multi-Layer
                </h3>
                <p className="text-neutral-400 text-sm">
                  Advanced composition with intelligent cutout.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Feature 3 - Performance */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            className="md:col-span-1 relative h-[300px] md:h-auto rounded-[32px] border border-white/10 bg-neutral-900/40 backdrop-blur-md overflow-hidden group"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2574&auto=format&fit=crop"
                alt="Fast Speed Neon"
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black to-transparent"></div>
            </div>
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-white">Instant</h3>
                <p className="text-neutral-400 text-sm">
                  Zero-latency rendering pipeline.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Wide Feature - Cross Platform */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.3 }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            className="md:col-span-2 relative h-[280px] rounded-[32px] border border-white/10 bg-neutral-900/40 backdrop-blur-md overflow-hidden group"
          >
            <div className="absolute right-0 top-0 w-1/2 h-full">
              <img
                src="https://images.unsplash.com/photo-1614850523060-8da1d56ae167?q=80&w=2670&auto=format&fit=crop"
                alt="Light refraction"
                className="w-full h-full object-cover opacity-30 mask-image-gradient"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black)",
                }}
              />
            </div>
            <div className="relative z-10 p-10 h-full flex flex-col justify-center max-w-md">
              <div className="flex gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-neutral-300" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-neutral-300" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-neutral-300" />
                </div>
              </div>
              <h3 className="text-2xl font-medium mb-2 text-white">
                Universal Capture
              </h3>
              <p className="text-neutral-400">
                Works seamlessly across all modern browsers. No installation
                required. Your content, everywhere.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      {/* FAQ Section */}
      <div
        ref={faqRef}
        className={`w-full max-w-4xl m-auto mb-32 transition-all duration-1000 ${
          faqVisible ? "reveal-visible" : "reveal-hidden"
        }`}
      >
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-3 block">
            Support
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Common Questions
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto">
            Everything you need to know about the platform.
          </p>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
          {/* Glow Effect behind FAQ */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                index={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaqIndex === index}
                onClick={() => handleFaqClick(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Premium Footer */}
      <footer className="relative w-full pt-24 pb-12 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-black pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-neutral-900 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
            {/* Brand & Newsletter */}
            <div className="md:col-span-5 flex flex-col gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <Aperture className="w-5 h-5 text-black" />
                </div>
                <span className="font-bold text-2xl text-white tracking-tight">
                  Crystal
                </span>
              </div>

              <p className="text-neutral-400 text-lg leading-relaxed max-w-md font-light">
                The future of browser-based recording. <br />
                <span className="text-white">Simple. Powerful. Private.</span>
              </p>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  Join the Community
                </h4>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                  />
                  <button className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors">
                    Join
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-white font-semibold mb-6">Product</h4>
                <ul className="space-y-4">
                  <li>
                    <a
                      href="#"
                      className="text-neutral-500 hover:text-white transition-colors text-sm"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-neutral-500 hover:text-white transition-colors text-sm"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-neutral-500 hover:text-white transition-colors text-sm"
                    >
                      Enterprise
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-neutral-500 hover:text-white transition-colors text-sm"
                    >
                      Changelog
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-6">Company</h4>
                <ul className="space-y-4">
                  <li>
                    <a
                      href="#"
                      className="text-neutral-500 hover:text-white transition-colors text-sm"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-neutral-500 hover:text-white transition-colors text-sm"
                    >
                      Careers
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-neutral-500 hover:text-white transition-colors text-sm"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-neutral-500 hover:text-white transition-colors text-sm"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-6">Legal</h4>
                <ul className="space-y-4">
                  <li>
                    <a
                      href="#"
                      className="text-neutral-500 hover:text-white transition-colors text-sm"
                    >
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-neutral-500 hover:text-white transition-colors text-sm"
                    >
                      Terms
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-neutral-500 hover:text-white transition-colors text-sm"
                    >
                      Security
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Massive Footer Text */}
          <div className="relative w-full flex justify-center items-center py-12 border-t border-white/5">
            <h1 className="text-[15vw] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-neutral-800 to-black select-none tracking-tighter opacity-50">
              CRYSTAL
            </h1>

            <div className="absolute inset-0 flex flex-col justify-end pb-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-6">
                <p className="text-neutral-500 text-sm">
                  © 2025 Crystal Loom Inc.
                </p>
                <div className="flex gap-6">
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-white transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-white transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-white transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-white transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Showreel Modal */}
      <AnimatePresence>
        {showShowreel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
            onClick={() => setShowShowreel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowShowreel(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>

              <video
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                className="w-full h-full object-cover"
                controls
                autoPlay
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
