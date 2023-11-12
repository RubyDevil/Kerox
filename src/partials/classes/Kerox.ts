import { ChildProcess, fork } from "child_process";
import { KeroxOptions } from "../types/KeroxOptions";
import { getStatic, toHumanTime } from "../utils/Utils";
import { Counter } from "./Counter";
import { Stats } from "../types/Stats";

import 'overpaint.js';

export class Kerox {

   private static header: string = getStatic('header.txt')._RebeccaPurple;

   private logs: string[] = [];

   private stressers = new Map<number, ChildProcess>();
   private stresserStats = new Map<number, any>();

   private options: KeroxOptions = {
      target: 'https://starve.io',
      useProxies: false,
      proxyFile: 'proxies.txt'
   };

   private stats = {
      startTime: Date.now(),
      requests: new Counter(),
      pending: new Counter(),
      success: new Counter(),
      errors: new Counter(),
   }

   private get duration(): string {
      return toHumanTime(Date.now() - this.stats.startTime, true);
   }

   constructor(options?: Partial<KeroxOptions>) {
      // set options
      if (typeof options === 'object') {
         Object.assign(this.options, options);
      }
      // add static logs
      // this.logs.push(`   Target: ${this.options.target}`._PurpleAmethyst);
      // spawn stressers
      this.spawnStressers(8);
      // start rendering terminal
      this.renderTerminal(10);
   }

   // ========== Stats ================================================================================

   private updateStats() {
      // reset stats
      this.stats.requests.reset();
      this.stats.pending.reset();
      this.stats.success.reset();
      this.stats.errors.reset();
      // cumulate stresser stats
      this.stresserStats.forEach(stats => {
         this.stats.requests.inc(stats.requests as number);
         this.stats.pending.inc(stats.pending as number);
         this.stats.success.inc(stats.success as number);
         this.stats.errors.inc(stats.errors as number);
      });
   }

   // ========== Rendering ============================================================================

   private renderFrame() {
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

   public renderTerminal(fps: number = 10) {
      this.renderFrame();
      setInterval(() => this.renderFrame(), 1000 / fps);
   }

   // ========== Stressers =============================================================================

   private spawnStressers(amount: number) {
      for (let i = 0; i < amount; i++) {
         const stresser = fork('src/partials/exec/spawn.js');
         this.stressers.set(stresser.pid!, stresser);

         stresser.on('message', (message: any) => {
            if (typeof message !== 'object') return;
            switch (message.type) {
               case 'spawned':
                  this.logs.push(`   Spawned stresser (pid: ${message.pid})`._BlueDiamond);
                  break;
               case 'data':
                  this.stresserStats.set(stresser.pid!, message.data);
                  this.updateStats();
                  // console.log(message.data);
                  break;
            }
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