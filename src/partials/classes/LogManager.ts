import { LogType } from "../enums/LogType";
import { KLog, Log } from "../types/Log";

export class LogManager extends Array<KLog> {

   constructor(...logs: KLog[]) {
      super(...logs);
   }

   /**
    * Get all logs of the specified type(s)
    * @param types The type(s) of logs to get
    */
   public get(...types: LogType[]) {
      return this.filter(log => !log.expired && types.includes(log.type));
   }

   /**
    * Remove all logs of the specified type(s)
    * @param types The type(s) of logs to remove
    */
   public remove(...types: LogType[]) {
      return this.filter(log => types.includes(log.type));
   }

   /**
    * Print all logs of the specified type(s)
    * @param types The type(s) of logs to print
    */
   public print(...types: LogType[]) {
      this.get(...types).forEach(log => console.log(log.content));
   }

   /**
    * Delete all logs
    */
   public clear() {
      this.splice(0, this.length);
   }

   /**
    * Remove all expired logs
    */
   public update() {
      let validLogs = this.filter(log => !log.expired);
      this.clear();
      this.push(...validLogs);
   }

   /**
    * Add a new info log
    * @param content The content
    * @param ttl The time to live
    */
   public _info(content: string, ttl?: number) {
      this.push(Log(LogType.Info, content, ttl));
   }

   /**
    * Add a new stats log
    * @param content The content
    * @param ttl The time to live
    */
   public _stats(content: string, ttl?: number) {
      this.push(Log(LogType.Stats, content, ttl));
   }

}