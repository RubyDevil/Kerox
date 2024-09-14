import 'overpaint.js';
import { Status } from "../enums/Status";
import { Info } from "../enums/Status";
import { KeroxOptions } from "../types/Options";
import { DDoSOptions } from "../types/DDoS";
export declare class Kerox {
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
    private ddosStartTime?;
    private ddosOptions?;
    private options;
    constructor(options?: Partial<KeroxOptions>);
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
     * Reads the proxies from the file and saves them to the proxies array.
     */
    private useLocalProxies;
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
    ddos(options: DDoSOptions): undefined;
}
