export class HttpCodeRegistry {

   public registry: { [code: number]: number } = {};

   public _1XX: number = 0;
   public _2XX: number = 0;
   public _3XX: number = 0;
   public _4XX: number = 0;
   public _5XX: number = 0;

   constructor() { }

   public get total(): number {
      return this._1XX + this._2XX + this._3XX + this._4XX + this._5XX;
   }

   public register(code: number, count: number = 1) {
      this.registry[code] = this.registry[code] + 1 || 1;
      if (code >= 100 && code < 200) this._1XX += count;
      else if (code >= 200 && code < 300) this._2XX += count;
      else if (code >= 300 && code < 400) this._3XX += count;
      else if (code >= 400 && code < 500) this._4XX += count;
      else if (code >= 500 && code < 600) this._5XX += count;
   }

   public combine(other: HttpCodeRegistry) {
      for (let code in other.registry)
         this.register(Number(code), other.registry[code]);
   }

}
