import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Une clases de Tailwind sin duplicados (la usan los componentes de shadcn, Magic UI y SmoothUI)
export function cn(...entradas) {
  return twMerge(clsx(entradas));
}
