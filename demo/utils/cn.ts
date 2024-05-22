import { twMerge } from 'tailwind-merge';
import clsx, { ClassValue } from 'clsx';

export function cn(...args: ClassValue[]) {
  return twMerge(clsx(args));
}
