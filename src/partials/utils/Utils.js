"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHumanTime = exports.joinProxies = exports.parseProxies = exports.addStatic = exports.setStatic = exports.getStatic = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function getStatic(fileName) {
    return fs.readFileSync(path.join(__dirname, '..', '..', 'static', fileName), 'utf8');
}
exports.getStatic = getStatic;
function setStatic(fileName, content) {
    return fs.writeFileSync(path.join(__dirname, '..', '..', 'static', fileName), content, 'utf8');
}
exports.setStatic = setStatic;
function addStatic(fileName, content) {
    return fs.appendFileSync(path.join(__dirname, '..', '..', 'static', fileName), content, 'utf8');
}
exports.addStatic = addStatic;
function parseProxies(proxies) {
    return proxies
        .map(proxy => proxy.split(':'))
        .filter(proxy => proxy.length >= 2);
}
exports.parseProxies = parseProxies;
function joinProxies(proxies) {
    return proxies.map(proxy => proxy.join(':'));
}
exports.joinProxies = joinProxies;
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
function toHumanTime(ms, compact) {
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
exports.toHumanTime = toHumanTime;
//# sourceMappingURL=Utils.js.map