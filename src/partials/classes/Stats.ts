import { toHumanTime } from "../utils/Utils";

export class Stats {

   public _disabled: boolean;
   public startTime: number = Date.now();
   public requests: number = 0;
   public pending: number = 0;
   public success: number = 0;
   public errors: number = 0;

   constructor() {
      this._disabled = false;
   }

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
      this._disabled = false;
      this.startTime = Date.now();
      this.requests = 0;
      this.pending = 0;
      this.success = 0;
      this.errors = 0;
   }

   public disable() {
      this._disabled = true;
      this.startTime = NaN;
      this.requests = NaN;
      this.pending = NaN;
      this.success = NaN;
      this.errors = NaN;
   }

}