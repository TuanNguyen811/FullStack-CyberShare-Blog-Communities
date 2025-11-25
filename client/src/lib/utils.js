import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
  if (!dateString) return '';
  return format(new Date(dateString), 'MMM dd, yyyy');
}
