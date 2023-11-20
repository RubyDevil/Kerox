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
export function Log(type: LogType, content: string, ttl: number = 0): KLog {
   return {
      type: type,
      content: content,
      ttl: ttl,
      _bornAt: Date.now(),
      get age() {
         return Date.now() - this._bornAt;
      },
      get persistent() {
         return !this.ttl;
      },
      get expired() {
         return !this.persistent && this.age >= this.ttl;
      }
   } as KLog;
}