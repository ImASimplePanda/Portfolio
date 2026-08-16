'use client';

import clsx from 'clsx';
import { steps } from '@/lib/steps';

interface StepRailProps {
  activeStep: number;
  onSelect: (index: number) => void;
}

export default function StepRail({ activeStep, onSelect }: StepRailProps) {
  return (
    <nav
      aria-label="Pasos de preparación"
      className="pointer-events-auto fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-6 md:flex lg:left-10"
    >
      {steps.map((step) => {
        const isActive = step.index === activeStep;
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onSelect(step.index)}
            className="group flex items-center gap-3 text-left"
          >
            <span
              className={clsx(
                'h-px transition-all duration-500 ease-out',
                isActive
                  ? 'w-10 bg-[var(--foreground)]'
                  : 'w-4 bg-white/30 group-hover:w-7 group-hover:bg-white/60'
              )}
            />
            <span
              className={clsx(
                'font-sans text-[11px] tracking-[0.25em] transition-all duration-500',
                isActive
                  ? 'text-[var(--foreground)] opacity-100'
                  : 'text-white/40 opacity-80 group-hover:text-white/70'
              )}
            >
              {step.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
