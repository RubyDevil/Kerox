export class ProgressBar {

   private static readonly icons = {
      filled: '∎',
      empty: '□',
      left: '[',
      right: ']',
   };

   private value: number;
   public bar: string = '';

   public get cells() { return this.width - 2; }
   public get progress() { return this.value / this.max; }
   public get percentage() { return (this.value / this.max * 100).toFixed(2) + '%'; }

   constructor(
      private width: number,
      private max: number = 1,
      private duration?: number
   ) {
      this.width = width;
      this.max = max;
      this.value = 0;
      this.updateBar();
   }

   public update(value: number): void {
      this.value = value;
      this.updateBar();
   }

   private updateBar(): void {
      let filled = Math.floor(this.progress * this.cells);
      let empty = this.cells - filled;
      try {
         this.bar = this.draw(filled, empty);
      } catch {
         this.bar = this.draw(0, this.cells);
      }
   }

   private draw(filled: number, empty: number): string {
      return (
         ProgressBar.icons.left +
         ProgressBar.icons.filled.repeat(filled) +
         ProgressBar.icons.empty.repeat(empty) +
         ProgressBar.icons.right
      ).trim();
   }

}

/*left: '▰', right: '▱'*/