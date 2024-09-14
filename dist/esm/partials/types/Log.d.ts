import { LogType } from "../enums/LogType";
export type KLog = {
    type: LogType;
    content: string;
    ttl: number;
    _bornAt: number;
    get age(): number;
    get persistent(): boolean;
    get expired(): boolean;
};
/**
 * Creates a new log
 * @param type The type
 * @param content The content
 * @param ttl The time to live
 */
export declare function Log(type: LogType, content: string, ttl?: number): KLog;
