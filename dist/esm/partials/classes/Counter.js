export class Counter {
    constructor() {
        this.value = 0;
        this.increment = 1;
        this.decrement = 1;
        this.bornAt = Date.now();
    }
    /**
     * The current value of the counter.
     */
    get count() {
        return this.value;
    }
    /**
     * Increments the counter by the specified amount.
     */
    inc(n) {
        this.value += n !== null && n !== void 0 ? n : this.increment;
    }
    /**
     * Decrements the counter by the specified amount.
     */
    dec(n) {
        this.value -= n !== null && n !== void 0 ? n : this.decrement;
    }
    /**
     * Sets the counter to the specified value.
     */
    set(n) {
        this.value = n !== null && n !== void 0 ? n : this.value;
    }
    /**
     * Resets the counter to 0.
     */
    reset() {
        this.value = 0;
    }
    /**
     * The age of the counter (in milliseconds).
     */
    get age() {
        return Date.now() - this.bornAt;
    }
    /**
     * Returns the average of the counter (per minute).
     */
    get perMinute() {
        return (this.value / this.age * 1000 * 60);
    }
}
//# sourceMappingURL=Counter.js.map