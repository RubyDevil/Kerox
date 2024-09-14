import { KProxy } from '../types/Proxy';
export declare function getStatic(fileName: string): string;
export declare function setStatic(fileName: string, content: string): void;
export declare function parseProxies(proxies: string[]): KProxy[];
export declare function joinProxies(proxies: KProxy[]): string[];
/**
 * Converts a duration from milliseconds to a human-readable format.
 * @param ms - The duration in milliseconds.
 * @param compact - Whether to use a compact format (e.g. "3d 18h 47m 2s") or a verbose format (e.g. "3 days, 18 hours, 47 minutes, 2 seconds").
 * @returns A formatted string representing the duration in days, hours, minutes, and seconds.
 * @example
 * const result = toHumanTime(324242000);
 * console.log(result); // "3 days, 18 hours, 47 minutes, 2 seconds"
 * @example
 * const result = toHumanTime(324242000, true);
 * console.log(result); // "3d 18h 47m 2s"
 */
export declare function toHumanTime(ms: number, compact?: boolean): string;
