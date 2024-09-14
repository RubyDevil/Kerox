import { HttpCodeRegistry } from "./HttpCodeRegistry";
export declare class Stats {
    _disabled: boolean;
    startTime: number;
    requests: number;
    pending: number;
    success: number;
    fails: number;
    errors: number;
    dropped: number;
    codes: HttpCodeRegistry;
    constructor();
    get age(): number;
    get duration(): string;
    get speed(): string;
    reset(): void;
    disable(): void;
    combine(other: Stats): void;
}
