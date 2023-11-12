export class Counter {

   private bornAt: number;

   private value: number = 0;
   private increment: number = 1;
   private decrement: number = 1;

   public constructor() {
      this.bornAt = Date.now();
   }

   /**
    * The current value of the counter.
    */
   public get count(): number {
      return this.value;
   }

   /**
    * Increments the counter by the specified amount.
    */
   public inc(n?: number): void {
      this.value += n ?? this.increment;
   }

   /**
    * Decrements the counter by the specified amount.
    */
   public dec(n?: number): void {
      this.value -= n ?? this.decrement;
   }

   /**
    * Sets the counter to the specified value.
    */
   public set(n: number): void {
      this.value = n ?? this.value;
   }

   /**
    * Resets the counter to 0.
    */
   public reset(): void {
      this.value = 0;
   }

   /**
    * The age of the counter (in milliseconds).
    */
   public get age(): number {
      return Date.now() - this.bornAt;
   }

   /**
    * Returns the average of the counter (per minute).
    */
   public get perMinute(): number {
      return (this.value / this.age * 1000 * 60);
   }

}