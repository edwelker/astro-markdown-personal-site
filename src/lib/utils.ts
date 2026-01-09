import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function readingTime(html: string) {
  const textOnly = html.replace(/<[^>]+>/g, "");
  const wordCount = textOnly.split(/\s+/).length;
  const readingTimeMinutes = (wordCount / 200 + 1).toFixed();
  return `${readingTimeMinutes} min read`;
}

export function formatRelativeTime(dateInput: string | Date): string {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    // Safety check for invalid dates
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInDays = Math.floor(diffInSeconds / 86400);

    if (diffInDays === 0) {
        return 'Today';
    } else if (diffInDays === 1) {
        return 'Yesterday';
    } else {
        return `${diffInDays} days ago`;
    }
}

export function decodeHtmlEntities(str: string | null | undefined): string {
    if (!str) return "";
    return str.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(Number(dec)))
              .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
              .replace(/&quot;/g, '"')
              .replace(/&apos;/g, "'")
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>');
}

export function getSourceDomain(url: string | null | undefined): string {
    if (!url) return '';
    try {
        const domain = new URL(url).hostname;
        return domain.replace('www.', '');
    } catch (e) {
        return '';
    }
}

export function formatPrice(price: any) {
  const p = parseFloat(price);
  if (isNaN(p)) return 'N/A';
  return `$${p.toFixed(2)}`;
}
