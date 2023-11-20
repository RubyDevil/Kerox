import * as http from 'http';

/**
 * DDoS Options
 */
export type DDoSOptions = {
   target: string;
   duration: DDoSDuration;
   threads: number;
   CPUs: number;
   agent?: Partial<http.AgentOptions>;
};

/**
 * DDoS Durations
 */
const DDoSDurations = [15, 30, 60, 120, 300] as const;
export type DDoSDuration = typeof DDoSDurations[number];
export function isDDoSDuration(value: any): value is DDoSDuration {
   return DDoSDurations.includes(value);
}
