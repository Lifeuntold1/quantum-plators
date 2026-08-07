import React, { useState, useEffect } from 'react';

interface CountdownProps {
  signOutTarget?: string | null;
  signOutLabel?: string;
  dinnerTarget?: string | null;
  dinnerLabel?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const Countdown: React.FC<CountdownProps> = ({
  signOutTarget = "2026-08-22T14:30:00+01:00",
  signOutLabel = "Sign-Out",
  dinnerTarget = null,
  dinnerLabel = "Dinner & Awards Night",
}) => {
  const calculateTimeLeft = (targetDateString: string | null | undefined): TimeLeft | null => {
    if (!targetDateString) return null;
    const target = new Date(targetDateString).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [signOutTime, setSignOutTime] = useState<TimeLeft | null>(() => calculateTimeLeft(signOutTarget));
  const [dinnerTime, setDinnerTime] = useState<TimeLeft | null>(() => calculateTimeLeft(dinnerTarget));

  useEffect(() => {
    const timer = setInterval(() => {
      setSignOutTime(calculateTimeLeft(signOutTarget));
      setDinnerTime(calculateTimeLeft(dinnerTarget));
    }, 1000);

    return () => clearInterval(timer);
  }, [signOutTarget, dinnerTarget]);

  const renderTickingUnit = (value: number, label: string) => (
    <div className="flex flex-col items-center justify-center flex-1 p-2.5 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-ink-950/90 border border-gold-500/30 backdrop-blur-md min-w-[56px] sm:min-w-[84px] lg:min-w-[96px] relative overflow-hidden group hover:border-gold-400 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Inner Gold Radial Glow */}
      <div className="absolute inset-0 bg-radial-gold opacity-30 group-hover:opacity-60 transition-opacity"></div>
      <span className="font-mono text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-extrabold text-gold-300 tracking-tight tabular-nums z-10 scale-y-105">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 sm:mt-2 font-mono text-[9px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-semibold text-muted z-10 group-hover:text-text transition-colors truncate w-full text-center">
        {label}
      </span>
    </div>
  );

  return (
    <div className="w-full my-8" id="countdown-section">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Sign-out Countdown Card with Signature Gold Planetary Orbit Motif */}
        <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-surface via-ink-950 to-surface border border-gold-500/30 p-6 sm:p-12 relative overflow-hidden flex flex-col justify-between shadow-2xl group" id="sign-out-countdown">
          
          {/* Planetary Gold Orbit Rings */}
          <div className="absolute -right-24 -bottom-24 w-[420px] h-[420px] rounded-full border border-gold-500/25 pointer-events-none flex items-center justify-center">
            <div className="w-[340px] h-[340px] rounded-full border border-gold-400/20 border-dashed animate-[spin_80s_linear_infinite]"></div>
            <div className="w-[260px] h-[260px] rounded-full border border-gold-300/15 pointer-events-none"></div>
            <div className="absolute w-3 h-3 rounded-full bg-gold-400 shadow-[0_0_12px_rgba(235,195,81,0.8)] top-8 left-20 animate-pulse"></div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/50 mb-6 shadow-gold-glow">
              <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-ping"></span>
              <span className="text-xs font-mono tracking-widest text-gold-300 uppercase font-bold">Countdown to Signout</span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F8F8FA] tracking-tight drop-shadow-sm">
              {signOutLabel}
            </h3>
            <p className="mt-3 text-sm sm:text-base font-body text-gray-300 max-w-lg leading-relaxed font-medium">
              Celebrating the end of our memorable journey after 6 years of rigor in the Department of Physics at the University of Jos. We are counting down every second to our big celebration!
            </p>
          </div>

          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/[0.1] relative z-10 w-full">
            {signOutTime ? (
              <div className="flex flex-nowrap items-center justify-between gap-1 sm:gap-3 lg:gap-4 w-full">
                {renderTickingUnit(signOutTime.days, 'Days')}
                <span className="text-gold-400 font-mono text-lg sm:text-3xl font-bold pb-4 sm:pb-6 shrink-0 animate-pulse">:</span>
                {renderTickingUnit(signOutTime.hours, 'Hours')}
                <span className="text-gold-400 font-mono text-lg sm:text-3xl font-bold pb-4 sm:pb-6 shrink-0 animate-pulse">:</span>
                {renderTickingUnit(signOutTime.minutes, 'Mins')}
                <span className="text-gold-400 font-mono text-lg sm:text-3xl font-bold pb-4 sm:pb-6 shrink-0 animate-pulse">:</span>
                {renderTickingUnit(signOutTime.seconds, 'Secs')}
              </div>
            ) : (
              <div className="font-mono text-sm sm:text-base font-bold text-gold-300 bg-gold-500/15 p-4 rounded-xl border border-gold-500/40 text-center shadow-gold-glow">
                It is Sign-Out Day! Congratulations to the Physics Class of 2024!
              </div>
            )}
          </div>
        </div>

        {/* Dinner & Awards Night - Fully Designed 'Coming Soon' / Scheduling State */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-plum-900/60 via-surface to-ink-950 border border-plum-500/50 p-6 sm:p-12 relative overflow-hidden flex flex-col justify-between shadow-2xl group hover:border-plum-400 transition-all duration-500" id="dinner-countdown">
          
          {/* Plum aesthetic radial planetary ring for evening banquet */}
          <div className="absolute inset-0 bg-radial-plum opacity-70 pointer-events-none"></div>
          <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full border border-plum-400/30 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 rounded-full border border-plum-300/20 border-dotted animate-[spin_100s_linear_infinite]"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum-600/40 border border-plum-400/60 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-plum-300 animate-pulse"></span>
              <span className="text-xs font-mono tracking-widest text-plum-100 uppercase font-bold">Dinner & Awards Night</span>
            </div>
            <h3 className="font-display text-3xl sm:text-4xl font-bold text-[#F8F8FA] tracking-tight drop-shadow-sm">
              {dinnerLabel}
            </h3>
            <p className="mt-3 text-sm sm:text-base font-body text-gray-300 leading-relaxed font-medium">
              A joyous evening of great food, music, and friendship as we gather together to present our class awards and celebrate our graduation.
            </p>
          </div>

          {/* Designed 'Coming Soon' / Scheduling State */}
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/[0.1] relative z-10 w-full">
            {dinnerTime ? (
              <div className="flex flex-nowrap items-center justify-between gap-1 sm:gap-3 lg:gap-4 w-full">
                {renderTickingUnit(dinnerTime.days, 'Days')}
                <span className="text-plum-400 font-mono text-lg sm:text-2xl pb-4 sm:pb-6 shrink-0">:</span>
                {renderTickingUnit(dinnerTime.hours, 'Hrs')}
                <span className="text-plum-400 font-mono text-lg sm:text-2xl pb-4 sm:pb-6 shrink-0">:</span>
                {renderTickingUnit(dinnerTime.minutes, 'Mins')}
                <span className="text-plum-400 font-mono text-lg sm:text-2xl pb-4 sm:pb-6 shrink-0">:</span>
                {renderTickingUnit(dinnerTime.seconds, 'Secs')}
              </div>
            ) : (
              <div className="w-full p-8 rounded-2xl bg-ink-950/90 border border-plum-500/40 backdrop-blur-md flex items-center justify-between gap-4 shadow-xl hover:border-plum-400 transition-colors">
                <div>
                  <div className="font-display text-2xl text-[#F8F8FA] font-bold tracking-tight">Date Coming Soon</div>
                  <p className="text-xs font-mono text-gold-300 mt-1.5 uppercase tracking-wider font-bold">
                    ✦ Date to be Announced Soon
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-gold-500/50 flex items-center justify-center text-gold-300 font-mono text-xl shadow-gold-glow shrink-0 animate-pulse">
                  ❖
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Countdown;
