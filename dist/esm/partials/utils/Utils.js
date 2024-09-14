import * as fs from 'fs';
import * as path from 'path';
export function getStatic(fileName) {
    return fs.readFileSync(path.join(__dirname, '..', '..', '..', 'static', fileName), 'utf8');
}
export function setStatic(fileName, content) {
    return fs.writeFileSync(path.join(__dirname, '..', '..', '..', 'static', fileName), content, 'utf8');
}
export function parseProxies(proxies) {
    return proxies
        .map(proxy => proxy.split(':'))
        .filter(proxy => proxy.length >= 2);
}
export function joinProxies(proxies) {
    return proxies.map(proxy => proxy.join(':'));
}
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
export function toHumanTime(ms, compact) {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);
    seconds %= 60;
    minutes %= 60;
    hours %= 24;
    let parts = [];
    let s = (n) => n > 1 ? 's' : '';
    if (days > 0)
        parts.push(`${days}${compact ? 'd' : ' day' + s(days)}`);
    if (hours > 0)
        parts.push(`${hours}${compact ? 'h' : ' hour' + s(hours)}`);
    if (minutes > 0)
        parts.push(`${minutes}${compact ? 'm' : ' minute' + s(minutes)}`);
    if (seconds > 0)
        parts.push(`${seconds}${compact ? 's' : ' second' + s(seconds)}`);
    return parts.join(compact ? ' ' : ', ') || `0${compact ? 's' : ' second' + s(seconds)}`;
}
//# sourceMappingURL=Utils.js.map