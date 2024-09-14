"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpCodeRegistry = void 0;
class HttpCodeRegistry {
    constructor() {
        this.registry = {};
        this._1XX = 0;
        this._2XX = 0;
        this._3XX = 0;
        this._4XX = 0;
        this._5XX = 0;
    }
    get total() {
        return this._1XX + this._2XX + this._3XX + this._4XX + this._5XX;
    }
    register(code, count = 1) {
        this.registry[code] = this.registry[code] + 1 || 1;
        if (code >= 100 && code < 200)
            this._1XX += count;
        else if (code >= 200 && code < 300)
            this._2XX += count;
        else if (code >= 300 && code < 400)
            this._3XX += count;
        else if (code >= 400 && code < 500)
            this._4XX += count;
        else if (code >= 500 && code < 600)
            this._5XX += count;
    }
    combine(other) {
        for (let code in other.registry)
            this.register(Number(code), other.registry[code]);
    }
}
exports.HttpCodeRegistry = HttpCodeRegistry;
//# sourceMappingURL=HttpCodeRegistry.js.map