import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate discounted price from original price and discount percentage
 */
export function getDiscountedPrice(sellPrice: number, discount?: number): number {
  if (!discount || discount <= 0) return sellPrice;
  return Math.max(0, Math.round(sellPrice * (1 - discount / 100) * 100) / 100);
}

/**
 * Format price in Bangladeshi Taka
 */
export function formatPrice(price: number): string {
  return `৳${price.toFixed(0)}`;
}

