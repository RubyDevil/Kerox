/**
 * Creates a new log
 * @param type The type
 * @param content The content
 * @param ttl The time to live
 */
export function Log(type, content, ttl = 0) {
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
//# sourceMappingURL=Log.js.map