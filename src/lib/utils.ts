import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes with proper precedence.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
