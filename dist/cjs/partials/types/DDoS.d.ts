import * as http from 'http';
/**
 * DDoS Options
 */
export type DDoSOptions = {
    target: string;
    duration: DDoSDuration;
    multiplier: 1 | 2 | 3 | 4;
    threads: number;
    CPUs: number;
    agent?: Partial<http.AgentOptions>;
    dropRequests: boolean;
    display: {
        progressBar: boolean;
        statistics: boolean;
        httpCodes: boolean;
    };
};
/**
 * DDoS Durations
 */
declare const DDoSDurations: readonly [15, 30, 60, 120, 300];
export type DDoSDuration = typeof DDoSDurations[number];
export declare function isDDoSDuration(value: any): value is DDoSDuration;
export {};
