import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a Date to localized Indonesian long date string in Asia/Jakarta (UTC+7).
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

/**
 * Format a Date to localized Indonesian short date string (DD/MM/YYYY) in Asia/Jakarta (UTC+7).
 */
export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

/**
 * Format a Date to localized time string (HH:mm:ss) in Asia/Jakarta (UTC+7).
 */
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).replace(/\./g, ":");
}

/**
 * Format a Date to full Indonesian date-time string in Asia/Jakarta (UTC+7).
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return `${formatDate(date)}, ${formatTime(date)} WIB`;
}

/**
 * Get today's date at midnight (start of day) in Asia/Jakarta timezone.
 */
export function getStartOfToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Get today's date at end of day (23:59:59.999) in Asia/Jakarta timezone.
 */
export function getEndOfToday(): Date {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
}
