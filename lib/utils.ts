import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge.
 * This is the standard utility used by shadcn/ui components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a Date to a localized Indonesian date string.
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format a Date to a localized Indonesian time string (HH:mm).
 */
export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a Date to a full Indonesian date-time string.
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)}, ${formatTime(date)}`;
}

/**
 * Get today's date at midnight (start of day) in local timezone.
 */
export function getStartOfToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Get today's date at end of day (23:59:59.999) in local timezone.
 */
export function getEndOfToday(): Date {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
}
