export declare class ProgressBar {
    private width;
    private max;
    private duration?;
    private static readonly icons;
    private value;
    bar: string;
    get cells(): number;
    get progress(): number;
    get percentage(): string;
    constructor(width: number, max?: number, duration?: number | undefined);
    update(value: number): void;
    private updateBar;
    private draw;
}
