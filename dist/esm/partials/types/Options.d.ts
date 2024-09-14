import * as http from "http";
import { KProxy } from "./Proxy";
export type KeroxOptions = {
    updateInterval?: number;
    refreshRate: OneToSixty;
    useProxies: boolean;
    validateProxies: boolean;
};
export type StresserOptions = {
    updateInterval: number;
    target: string;
    useProxies: boolean;
    proxies: KProxy[];
    multiplier: 1 | 2 | 3 | 4;
    threads: number;
    agent?: Partial<http.AgentOptions>;
    dropRequests: boolean;
};
export type Options = KeroxOptions & StresserOptions;
export type OneToSixty = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60;
