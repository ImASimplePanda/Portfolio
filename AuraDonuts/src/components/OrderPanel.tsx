'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { basePrice, ingredientGroups } from '@/lib/steps';
import type { Step } from '@/lib/steps';

interface OrderPanelProps {
  step: Step;
}

type Selections = Record<string, string | string[]>;

function buildDefaultSelections(): Selections {
  return ingredientGroups.reduce<Selections>((acc, group) => {
    acc[group.id] = group.type === 'single' ? group.options[0].id : [];
    return acc;
  }, {});
}

export default function OrderPanel({ step }: OrderPanelProps) {
  const [selections, setSelections] = useState<Selections>(buildDefaultSelections);
  const [added, setAdded] = useState(false);

  const total = useMemo(() => {
    let sum = basePrice;
    for (const group of ingredientGroups) {
      const selected = selections[group.id];
      if (group.type === 'single') {
        const option = group.options.find((o) => o.id === selected);
        if (option) sum += option.priceDelta;
      } else {
        for (const id of selected as string[]) {
          const option = group.options.find((o) => o.id === id);
          if (option) sum += option.priceDelta;
        }
      }
    }
    return sum;
  }, [selections]);

  const selectSingle = (groupId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [groupId]: optionId }));
  };

  const toggleMulti = (groupId: string, optionId: string) => {
    setSelections((prev) => {
      const current = new Set(prev[groupId] as string[]);
      if (current.has(optionId)) current.delete(optionId);
      else current.add(optionId);
      return { ...prev, [groupId]: Array.from(current) };
    });
  };

  const handleAdd = () => {
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <aside className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 max-h-[78vh] overflow-y-auto sm:inset-x-auto sm:bottom-auto sm:right-8 sm:top-1/2 sm:max-h-[88vh] sm:w-[22rem] sm:-translate-y-1/2 lg:right-10">
      <div className="rounded-t-[28px] border border-white/15 bg-white/[0.06] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:rounded-[28px] sm:p-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <p className="font-sans text-[11px] tracking-[0.3em] text-white/50">{step.label}</p>
            <h2 className="mt-2 font-serif text-2xl leading-tight text-[var(--foreground)] sm:text-3xl">
              {step.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{step.description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 space-y-5 border-t border-white/10 pt-6">
          {ingredientGroups.map((group) => (
            <div key={group.id}>
              <p className="font-sans text-[11px] tracking-[0.2em] text-white/45">{group.label}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const isSelected =
                    group.type === 'single'
                      ? selections[group.id] === option.id
                      : (selections[group.id] as string[]).includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        group.type === 'single'
                          ? selectSingle(group.id, option.id)
                          : toggleMulti(group.id, option.id)
                      }
                      className={clsx(
                        'rounded-full border px-3.5 py-1.5 text-xs font-medium tracking-wide transition-all duration-300',
                        isSelected
                          ? 'border-[var(--foreground)]/80 bg-[var(--foreground)] text-[#0d0d0f]'
                          : 'border-white/15 bg-white/[0.02] text-white/70 hover:border-white/35 hover:text-white'
                      )}
                    >
                      {option.label}
                      {option.priceDelta > 0 && (
                        <span className="ml-1 opacity-60">+{option.priceDelta.toFixed(2)}€</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
          <div>
            <p className="font-sans text-[10px] tracking-[0.25em] text-white/40">TOTAL</p>
            <motion.p
              key={total}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-2xl text-[var(--foreground)]"
            >
              {total.toFixed(2)}€
            </motion.p>
          </div>
          <motion.button
            type="button"
            onClick={handleAdd}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className={clsx(
              'relative overflow-hidden rounded-full px-6 py-3 text-xs font-semibold tracking-[0.15em] transition-colors duration-300',
              added ? 'bg-emerald-400 text-[#0d0d0f]' : 'bg-[var(--foreground)] text-[#0d0d0f] hover:bg-white'
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={added ? 'added' : 'idle'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="block"
              >
                {added ? 'AÑADIDO ✓' : 'ADD TO ORDER'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </aside>
  );
}
