import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DateRange } from "react-day-picker"

// Tone mapping types
export type ToneCode = `${'P' | 'N' | 'T'}_${number}`;
export type ToneMap = Record<ToneCode, string>;

let toneMapCache: ToneMap | null = null;

export async function getToneMap(): Promise<ToneMap> {
  if (toneMapCache) return toneMapCache;
  
  try {
    const response = await fetch('http://api.avaflow.net/tone/mapper');
    if (!response.ok) throw new Error('Failed to fetch tone mapper');
    const data = await response.json();
    toneMapCache = data;
    return data;
  } catch (error) {
    console.error('Error fetching tone map:', error);
    // Fallback mapping for critical tones if API fails
    return {
      'P_101': 'Friendly',
      'P_102': 'Professional',
      'P_103': 'Empathetic',
      'P_104': 'Confident',
      'P_105': 'Encouraging',
      'P_106': 'Sales-Oriented',
      'P_107': 'Supportive',
      'N_108': 'Overly Formal',
      'N_109': 'Frustrated',
      'N_110': 'Defensive',
      'N_111': 'Robotic',
      'N_112': 'Impatient',
      'N_113': 'Rude',
      'N_114': 'Overly Apologetic',
      'T_115': 'Neutral'
    };
  }
}

export function getToneName(code: ToneCode, toneMap: ToneMap): string {
  return toneMap[code] || code;
}

export function isToneCode(code: string): code is ToneCode {
  return /^[PNT]_\d+$/.test(code);
}

export function isPositiveTone(code: ToneCode): boolean {
  return code.startsWith('P_');
}

export function isNegativeTone(code: ToneCode): boolean {
  return code.startsWith('N_');
}

export function isNeutralTone(code: ToneCode): boolean {
  return code.startsWith('T_');
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type RequiredDateRange = {
  from: Date;
  to: Date;
}

export function getDefaultDateRange(): RequiredDateRange {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1) // 1st of current month
  const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Current date
  
  return {
    from: firstDay,
    to: currentDay
  }
}
