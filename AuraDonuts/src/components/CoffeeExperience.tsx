'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';
import StepRail from './StepRail';
import OrderPanel from './OrderPanel';
import { steps } from '@/lib/steps';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

// Total scroll distance (in viewport heights) that drives the video scrub.
const SCROLL_LENGTH_VH = 420;

export default function CoffeeExperience() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeStepRef = useRef(0);
  const [activeStep, setActiveStep] = useState(0);
  const [ready, setReady] = useState(false);

  useGSAP(
    () => {
      const video = videoRef.current;
      const wrapper = wrapperRef.current;
      const pin = pinRef.current;
      if (!video || !wrapper || !pin) return;

      let trigger: ScrollTrigger | undefined;

      const setup = () => {
        setReady(true);
        trigger = ScrollTrigger.create({
          id: 'coffee-scrub',
          trigger: wrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.85,
          pin,
          anticipatePin: 1,
          onUpdate: (self) => {
            const duration = video.duration;
            if (duration && Number.isFinite(duration)) {
              video.currentTime = self.progress * duration;
            }
            const stepIndex = Math.min(
              steps.length - 1,
              Math.floor(self.progress * steps.length)
            );
            if (activeStepRef.current !== stepIndex) {
              activeStepRef.current = stepIndex;
              setActiveStep(stepIndex);
            }
          },
        });
      };

      // Seeking requires metadata (duration) to be available first.
      if (video.readyState >= 1) {
        setup();
      } else {
        video.addEventListener('loadedmetadata', setup, { once: true });
      }

      return () => {
        trigger?.kill();
      };
    },
    { scope: wrapperRef }
  );

  const scrollToStep = (index: number) => {
    const trigger = ScrollTrigger.getById('coffee-scrub');
    if (!trigger) return;
    const targetProgress = Math.min(1, (index + 0.5) / steps.length);
    const scrollPos = trigger.start + targetProgress * (trigger.end - trigger.start);
    gsap.to(window, {
      duration: 1.1,
      ease: 'power2.inOut',
      scrollTo: { y: scrollPos, autoKill: true },
    });
  };

  return (
    <div ref={wrapperRef} style={{ height: `${SCROLL_LENGTH_VH}vh` }} className="relative">
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden bg-[#0d0d0f]">
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
          src="/videos/cafe.mp4"
          muted
          playsInline
          preload="auto"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/40" />

        <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 sm:px-10 sm:py-8">
          <span className="font-serif text-lg tracking-[0.2em] text-[var(--foreground)]">
            AFTERGLOW
          </span>
          <span className="font-sans text-[11px] tracking-[0.25em] text-white/50">
            EDICIÓN CAFÉ
          </span>
        </header>

        <StepRail activeStep={activeStep} onSelect={scrollToStep} />
        <OrderPanel step={steps[activeStep]} />

        <div className="pointer-events-auto absolute top-20 left-1/2 z-20 flex -translate-x-1/2 gap-3 md:hidden">
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              aria-label={step.label}
              onClick={() => scrollToStep(step.index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step.index === activeStep ? 'w-8 bg-[var(--foreground)]' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
