import { LogType } from "../enums/LogType";
import { KLog } from "../types/Log";
export declare class LogManager extends Array<KLog> {
    constructor(...logs: KLog[]);
    /**
     * Get all logs of the specified type(s)
     * @param types The type(s) of logs to get
     */
    get(...types: LogType[]): KLog[];
    /**
     * Remove all logs of the specified type(s)
     * @param types The type(s) of logs to remove
     */
    remove(...types: LogType[]): KLog[];
    /**
     * Print all logs of the specified type(s)
     * @param types The type(s) of logs to print
     */
    print(...types: LogType[]): void;
    /**
     * Delete all logs
     */
    clear(): void;
    /**
     * Remove all expired logs
     */
    update(): void;
    /**
     * Add a new info log
     * @param content The content
     * @param ttl The time to live
     */
    _info(content: string, ttl?: number): void;
    /**
     * Add a new stats log
     * @param content The content
     * @param ttl The time to live
     */
    _stats(content: string, ttl?: number): void;
}
