import React, { useState, useEffect } from 'react';

interface Slide {
  path: string;
  filename: string;
  src: string;
}

interface HeroSlideshowProps {
  slides?: Slide[];
}

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({ slides = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="w-full relative rounded-3xl overflow-hidden bg-gradient-to-br from-surface via-ink-950 to-ink-900 border border-gold-500/30 shadow-[0_20px_60px_-15px_rgba(201,162,75,0.2)] min-h-[560px] sm:min-h-[640px] flex items-center justify-center p-8 sm:p-16 transition-all duration-700 hover:border-gold-400/50">
        {/* Decorative architectural background rings & glowing orbs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full border border-gold-500/30 animate-[ping_16s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full border border-plum-500/30 pointer-events-none"></div>
        <div className="absolute inset-0 bg-radial-gold opacity-70"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-ink-950/90 border border-gold-500/40 text-gold-300 font-mono text-xs tracking-widest uppercase mb-8 shadow-gold-glow backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
            <span>Theme: Quantum Leap • Department of Physics, University of Jos</span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#F8F8FA] leading-[1.05] drop-shadow-md">
            Quantum Plators <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-amber-200">'24</span>
          </h1>

          <p className="mt-6 text-lg sm:text-2xl font-body text-gray-200 max-w-2xl font-light leading-relaxed drop-shadow animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            Welcome to the official platform, student directory, and history collection for our graduating class.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-lg">
            <a
              href="/students"
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-ink-950 font-body font-bold text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(201,162,75,0.4)] hover:shadow-[0_0_35px_rgba(201,162,75,0.7)] hover:-translate-y-1 text-center text-decoration-none"
            >
              Explore Class Directory
            </a>
            <a
              href="/fyb-week"
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-[#F8F8FA] font-body font-semibold text-sm tracking-wide border border-gold-500/40 hover:border-gold-400 transition-all hover:-translate-y-1 text-center text-decoration-none backdrop-blur-sm"
            >
              View FYB Week Recap
            </a>
          </div>

          <div className="mt-16 pt-8 border-t border-white/[0.1] grid grid-cols-3 gap-8 w-full max-w-2xl text-center animate-fade-in-up" style={{ animationDelay: '450ms' }}>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="font-mono text-3xl font-bold text-gold-300 drop-shadow">6</div>
              <div className="text-[11px] font-mono text-gray-300 uppercase tracking-wider mt-1 font-medium">Years of Rigor</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="font-mono text-3xl font-bold text-gold-300 drop-shadow">100%</div>
              <div className="text-[11px] font-mono text-gray-300 uppercase tracking-wider mt-1 font-medium">Live Updates</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="font-mono text-3xl font-bold text-gold-300 drop-shadow">'24</div>
              <div className="text-[11px] font-mono text-gray-300 uppercase tracking-wider mt-1 font-medium">Class Legacy</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative rounded-3xl overflow-hidden bg-ink-950 border border-gold-500/30 shadow-[0_20px_60px_-15px_rgba(201,162,75,0.25)] min-h-[560px] sm:min-h-[640px]">
      {slides.map((slide, i) => (
        <div
          key={slide.path}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.src}
            alt={slide.filename || `Slideshow image ${i + 1}`}
            className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
              i === currentIndex ? 'scale-105' : 'scale-100'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent"></div>
        </div>
      ))}

      {/* Gold overlay mark and content */}
      <div className="relative z-20 max-w-4xl mx-auto text-center flex flex-col items-center justify-end h-full min-h-[560px] sm:min-h-[640px] p-8 sm:p-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ink-950/90 border border-gold-500/50 text-gold-300 font-mono text-xs tracking-widest uppercase mb-6 backdrop-blur-md shadow-gold-glow animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
          <span>Theme: Quantum Leap • Physics Class of 2024</span>
        </div>
        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#F8F8FA] drop-shadow-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Quantum Plators <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-amber-200">'24</span>
        </h1>
        <p className="mt-4 text-base sm:text-2xl font-body text-gray-200 max-w-2xl font-light drop-shadow animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          Welcome to the official platform, class directory, and history collection for the Department of Physics, University of Jos.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <a href="/students" className="px-9 py-4 rounded-full bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-ink-950 font-bold text-sm transition-all shadow-[0_0_25px_rgba(201,162,75,0.4)] hover:shadow-[0_0_35px_rgba(201,162,75,0.7)] hover:-translate-y-1">
            Explore Class Directory
          </a>
          <a href="/fyb-week" className="px-9 py-4 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#F8F8FA] font-semibold text-sm border border-gold-500/40 transition-all hover:-translate-y-1 backdrop-blur-sm">
            View FYB Week Recap
          </a>
        </div>

        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="mt-12 flex items-center gap-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                  idx === currentIndex ? 'w-10 bg-gold-400 shadow-gold-glow' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSlideshow;
