import 'overpaint.js';
import { Status } from "../enums/Status";
import { Info } from "../enums/Status";
import { KeroxOptions } from "../types/Options";
import { DDoSOptions } from "../types/DDoS";
import EventEmitter from "node:events";
export interface KeroxEvents {
    idle: () => any;
}
export declare class Kerox extends EventEmitter {
    emit<K extends keyof KeroxEvents>(event: K, ...args: Parameters<KeroxEvents[K]>): boolean;
    on<K extends keyof KeroxEvents>(event: K, listener: KeroxEvents[K]): this;
    once<K extends keyof KeroxEvents>(event: K, listener: KeroxEvents[K]): this;
    off<K extends keyof KeroxEvents>(event: K, listener: KeroxEvents[K]): this;
    static header: string;
    status: Status;
    info: Info;
    set _status(value: [Status?, Info?]);
    private logs;
    private stressers;
    private stresserStats;
    private proxies;
    private httpAgent;
    private stats;
    private progressBar;
    private ddosOptions?;
    private options;
    constructor(options?: Partial<KeroxOptions>);
    private crash;
    private initialize;
    private stopStressers;
    private resetStats;
    private updateStats;
    private renderFrame;
    renderTerminal(fps?: number): void;
    private createField;
    private createPannel;
    private statsPanel;
    private httpCodesPanel;
    /**
     * Starts a stresser to validate the proxies and keep only the working ones.
     */
    private validateProxies;
    /**
     * Starts a stresser sub-process.
     * @param options Configuration options for the stresser
     */
    private spawn;
    /**
     * Kills a stresser sub-process.
     * @param pid The process id of the stresser to kill
     */
    private kill;
    /**
     * Starts stressing a target url with a single stresser
     * @param target The target url
     */
    ddos(options: DDoSOptions): void;
}
