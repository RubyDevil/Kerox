export declare class HttpCodeRegistry {
    registry: {
        [code: number]: number;
    };
    _1XX: number;
    _2XX: number;
    _3XX: number;
    _4XX: number;
    _5XX: number;
    constructor();
    get total(): number;
    register(code: number, count?: number): void;
    combine(other: HttpCodeRegistry): void;
}
