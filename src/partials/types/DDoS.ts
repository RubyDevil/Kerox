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
const DDoSDurations = [15, 30, 60, 120, 300] as const;
export type DDoSDuration = typeof DDoSDurations[number];
export function isDDoSDuration(value: any): value is DDoSDuration {
   return DDoSDurations.includes(value);
}
