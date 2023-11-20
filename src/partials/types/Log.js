"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
/**
 * Creates a new log
 * @param type The type
 * @param content The content
 * @param ttl The time to live
 */
function Log(type, content, ttl = 0) {
    return {
        type: type,
        content: content,
        ttl: ttl,
        _bornAt: Date.now(),
        get age() {
            return Date.now() - this._bornAt;
        },
        get persistent() {
            return !this.ttl;
        },
        get expired() {
            return !this.persistent && this.age >= this.ttl;
        }
    };
}
exports.Log = Log;
//# sourceMappingURL=Log.js.map