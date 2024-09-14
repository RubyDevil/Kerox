import { toHumanTime } from "../utils/Utils";
import { HttpCodeRegistry } from "./HttpCodeRegistry";
export class Stats {
    constructor() {
        this._disabled = false;
        this.startTime = Date.now();
        this.requests = 0;
        this.pending = 0;
        this.success = 0;
        this.fails = 0;
        this.errors = 0;
        this.dropped = 0;
        this.codes = new HttpCodeRegistry();
    }
    get age() {
        return Date.now() - this.startTime;
    }
    get duration() {
        return toHumanTime(this.age, true);
    }
    get speed() {
        return (this.requests / (this.age / 1000)).toFixed(2) + ' req/s';
    }
    reset() {
        this.requests = 0;
        this.pending = 0;
        this.success = 0;
        this.fails = 0;
        this.errors = 0;
        this.dropped = 0;
        this.codes = new HttpCodeRegistry();
    }
    disable() {
        this._disabled = true;
        this.startTime = NaN;
        this.requests = NaN;
        this.pending = NaN;
        this.success = NaN;
        this.fails = NaN;
        this.errors = NaN;
        this.dropped = NaN;
        this.codes = new HttpCodeRegistry();
    }
    combine(other) {
        this.requests += other.requests;
        this.pending += other.pending;
        this.success += other.success;
        this.fails += other.fails;
        this.errors += other.errors;
        this.dropped += other.dropped;
        this.codes.combine(other.codes);
    }
}
//# sourceMappingURL=Stats.js.map