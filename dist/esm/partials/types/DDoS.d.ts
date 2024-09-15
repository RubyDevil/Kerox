import * as http from 'http';
/**
 * DDoS Options
 */
export type DDoSOptions = {
    target: string;
    duration: number;
    multiplier: number;
    maxPending: number;
    childProcesses: number;
    agent?: Partial<http.AgentOptions>;
    dropRequests: boolean;
    display: {
        progressBar: boolean;
        statistics: boolean;
        httpCodes: boolean;
    };
};
