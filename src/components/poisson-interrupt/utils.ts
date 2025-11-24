import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import colors from "tailwindcss/colors";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60) + 9; // Assume 9am start
  const m = Math.floor(minutes % 60);
  const ampm = h >= 12 ? "pm" : "am";
  const displayH = h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")}${ampm}`;
};

export const getBlockColor = (duration: number) => {
  if (duration < 15) return colors.red[500];
  if (duration < 30) return colors.amber[500];
  if (duration < 45) return colors.indigo[500];
  return colors.teal[500];
};
