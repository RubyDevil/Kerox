import { toHumanTime } from "../utils/Utils";
import { HttpCodeRegistry } from "./HttpCodeRegistry";

export class Stats {

   public _disabled: boolean = false;
   public startTime: number = Date.now();

   public requests: number = 0;
   public pending: number = 0;
   public success: number = 0;
   public fails: number = 0;
   public errors: number = 0;
   public dropped: number = 0;

   public codes: HttpCodeRegistry = new HttpCodeRegistry();

   constructor() { }

   public get age(): number {
      return Date.now() - this.startTime;
   }

   public get duration(): string {
      return toHumanTime(this.age, true);
   }

   public get speed(): string {
      return (this.requests / (this.age / 1000)).toFixed(2) + ' req/s';
   }

   public reset() {
      this.requests = 0;
      this.pending = 0;
      this.success = 0;
      this.fails = 0;
      this.errors = 0;
      this.dropped = 0;
      this.codes = new HttpCodeRegistry();
   }

   public disable() {
      this._disabled = true;
      this.startTime = NaN;
      this.requests = NaN;
      this.pending = NaN;
      this.success = NaN;
      this.fails = NaN;
      this.errors = NaN;
      this.dropped = NaN;
      this.codes = new HttpCodeRegistry();
   }

   public combine(other: Stats) {
      this.requests += other.requests;
      this.pending += other.pending;
      this.success += other.success;
      this.fails += other.fails;
      this.errors += other.errors;
      this.dropped += other.dropped;
      this.codes.combine(other.codes);
   }

}