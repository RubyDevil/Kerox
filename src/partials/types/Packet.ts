import { PacketType } from "../enums/PacketType";
import { KLog } from "./Log";
import { Stats } from "../classes/Stats";
import { KProxy } from "./Proxy";
import { KeroxOptions, StresserOptions } from "./Options";
import { DDoSDuration } from "./DDoS";

type BasePacket<T extends PacketType, D> = {
   type: T;
   data?: D;
};

// Mapping object to associate each PacketType with its data type
type DataTypeMap = {
   [PacketType.Log]: KLog;
   [PacketType.Data]: Stats;
   [PacketType.Error]: string;
   [PacketType.Spawned]: undefined;
   [PacketType.Done]: undefined;
   [PacketType.Init]: StresserOptions;
   [PacketType.Stress]: DDoSDuration;
   [PacketType.ValidateProxies]: { proxies: KProxy[], timeout?: number };
};

// Dynamic KPacket type using mapped types
export type KPacket<T extends PacketType = PacketType> =
   T extends keyof DataTypeMap
   ? BasePacket<T, DataTypeMap[T]>
   : never;

// Dynamic Packet builder using mapped types
export function Packet<T extends PacketType>(type: T, data: DataTypeMap[T]): BasePacket<T, DataTypeMap[T]> {
   return { type, data } as BasePacket<T, DataTypeMap[T]>;
}