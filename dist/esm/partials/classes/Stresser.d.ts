import 'overpaint.js';
import { StresserOptions } from '../types/Options';
import { KProxy } from '../types/Proxy';
import { DDoSDuration } from "../types/DDoS";
export declare class Stresser {
    private targetURL;
    private httpAgent;
    private _proxyIndex;
    private get nextProxy();
    private stats;
    private options;
    constructor(options: StresserOptions);
    /**
     * Send a request to the target URL
     * @param proxy The proxy to use for the request
     */
    private makeRequest_Beta;
    /**
     * Send a request to the target URL
     * @param proxy The proxy to use for the request
     */
    private makeRequest;
    /**
     * Stress the target URL for a specified duration
     * @param duration The duration of the attack
     * @param config The configuration to use for the requests
     */
    stress(duration: DDoSDuration): Promise<void>;
    private tick_v1;
    private tick_v2;
    validateProxies(proxies: KProxy[]): Promise<KProxy[]>;
    private requestSent;
    private requestError;
    private requestDropped;
    private requestCompleted;
    /**
     * Send a stats update to the master process
     */
    private sendStatsUpdate;
}
