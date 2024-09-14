import { PacketType } from "../enums/PacketType";
import { KLog } from "./Log";
import { Stats } from "../classes/Stats";
import { KProxy } from "./Proxy";
import { StresserOptions } from "./Options";
import { DDoSDuration } from "./DDoS";
type BasePacket<T extends PacketType, D> = {
    type: T;
    data?: D;
};
type DataTypeMap = {
    [PacketType.Log]: KLog;
    [PacketType.Data]: Stats;
    [PacketType.Error]: Error;
    [PacketType.Spawned]: undefined;
    [PacketType.Done]: undefined;
    [PacketType.Init]: StresserOptions;
    [PacketType.Stress]: DDoSDuration;
    [PacketType.ValidateProxies]: {
        proxies: KProxy[];
        timeout?: number;
    };
};
export type KPacket<T extends PacketType = PacketType> = T extends keyof DataTypeMap ? BasePacket<T, DataTypeMap[T]> : never;
export declare function Packet<T extends PacketType>(type: T, data: DataTypeMap[T]): BasePacket<T, DataTypeMap[T]>;
export {};
