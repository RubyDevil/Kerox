export declare class Counter {
    private bornAt;
    private value;
    private increment;
    private decrement;
    constructor();
    /**
     * The current value of the counter.
     */
    get count(): number;
    /**
     * Increments the counter by the specified amount.
     */
    inc(n?: number): void;
    /**
     * Decrements the counter by the specified amount.
     */
    dec(n?: number): void;
    /**
     * Sets the counter to the specified value.
     */
    set(n: number): void;
    /**
     * Resets the counter to 0.
     */
    reset(): void;
    /**
     * The age of the counter (in milliseconds).
     */
    get age(): number;
    /**
     * Returns the average of the counter (per minute).
     */
    get perMinute(): number;
}
