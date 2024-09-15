import { PacketType } from "../enums/PacketType";
import { KLog } from "./Log";
import { Stats } from "../classes/Stats";
import { KProxy } from "./Proxy";
import { StresserOptions } from "./Options";

type BasePacket<T extends PacketType, D> = {
   type: T;
   data?: D;
};

// Mapping object to associate each PacketType with its data type
type DataTypeMap = {
   [PacketType.Log]: KLog;
   [PacketType.Data]: Stats;
   [PacketType.Error]: Error;
   [PacketType.Spawned]: undefined;
   [PacketType.Done]: undefined;
   [PacketType.ValidationCompleted]: KProxy[];
   [PacketType.Init]: StresserOptions;
   [PacketType.Stress]: number;
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