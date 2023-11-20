"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stats = void 0;
const Utils_1 = require("../utils/Utils");
class Stats {
    _disabled;
    startTime = Date.now();
    requests = 0;
    pending = 0;
    success = 0;
    errors = 0;
    constructor() {
        this._disabled = false;
    }
    get age() {
        return Date.now() - this.startTime;
    }
    get duration() {
        return (0, Utils_1.toHumanTime)(this.age, true);
    }
    get speed() {
        return (this.requests / (this.age / 1000)).toFixed(2) + ' req/s';
    }
    reset() {
        this._disabled = false;
        this.startTime = Date.now();
        this.requests = 0;
        this.pending = 0;
        this.success = 0;
        this.errors = 0;
    }
    disable() {
        this._disabled = true;
        this.startTime = NaN;
        this.requests = NaN;
        this.pending = NaN;
        this.success = NaN;
        this.errors = NaN;
    }
}
exports.Stats = Stats;
//# sourceMappingURL=Stats.js.map