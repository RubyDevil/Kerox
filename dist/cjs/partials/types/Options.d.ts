import * as http from "http";
import { KProxy } from "./Proxy";
export type KeroxOptions = {
    updateInterval?: number;
    refreshRate: number;
    useProxies: boolean;
    validateProxies: boolean;
    proxyFilePath?: string;
};
export type StresserOptions = {
    updateInterval: number;
    target: string;
    useProxies: boolean;
    proxies: KProxy[];
    multiplier: number;
    maxPending: number;
    agent?: Partial<http.AgentOptions>;
    dropRequests: boolean;
};
export type Options = KeroxOptions & StresserOptions;
