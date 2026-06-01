import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getCategoryIcon(category) {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("bio")) return "biotech";
  if (cat.includes("hist")) return "history_edu";
  if (cat.includes("chem")) return "science";
  if (cat.includes("phys")) return "science";
  if (cat.includes("math")) return "calculate";
  if (cat.includes("comp")) return "computer";
  if (cat.includes("lit")) return "menu_book";
  return "description";
}
