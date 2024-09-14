import { LogType } from "../enums/LogType";
import { Log } from "../types/Log";
export class LogManager extends Array {
    constructor(...logs) {
        super(...logs);
    }
    /**
     * Get all logs of the specified type(s)
     * @param types The type(s) of logs to get
     */
    get(...types) {
        return this.filter(log => !log.expired && types.includes(log.type));
    }
    /**
     * Remove all logs of the specified type(s)
     * @param types The type(s) of logs to remove
     */
    remove(...types) {
        return this.filter(log => types.includes(log.type));
    }
    /**
     * Print all logs of the specified type(s)
     * @param types The type(s) of logs to print
     */
    print(...types) {
        this.get(...types).forEach(log => console.log(log.content));
    }
    /**
     * Delete all logs
     */
    clear() {
        this.splice(0, this.length);
    }
    /**
     * Remove all expired logs
     */
    update() {
        let validLogs = this.filter(log => !log.expired);
        this.clear();
        this.push(...validLogs);
    }
    /**
     * Add a new info log
     * @param content The content
     * @param ttl The time to live
     */
    _info(content, ttl) {
        this.push(Log(LogType.Info, content, ttl));
    }
    /**
     * Add a new stats log
     * @param content The content
     * @param ttl The time to live
     */
    _stats(content, ttl) {
        this.push(Log(LogType.Stats, content, ttl));
    }
}
//# sourceMappingURL=LogManager.js.map