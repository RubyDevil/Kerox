import { Stresser } from "../classes/Stresser";
import { PacketType } from "../enums/PacketType";
import { KPacket, Packet } from "../types/Packet";
import { Log } from "../types/Log";
import { LogType } from "../enums/LogType";

let stresser: Stresser;

process.on('message', async (packet: KPacket) => {
   if (!process.send) return;

   switch (packet.type) {

      case PacketType.Init: {
         stresser = new Stresser(packet.data!);
         process.send?.(Packet(PacketType.Spawned, undefined));
         break;
      }

      case PacketType.ValidateProxies: {
         process.send?.(Packet(PacketType.Log, Log(LogType.Info, `Validating proxies...`._dim)));
         const validProxies = await stresser.validateProxies(packet.data?.proxies!);
         process.send(Packet(PacketType.ValidationCompleted, validProxies));
         process.send(Packet(PacketType.Done, undefined));
         break;
      }

      case PacketType.Stress: {
         if (!packet.data) throw new Error('Duration cannot be null.');
         await stresser.stress(packet.data);
         break;
      }

   }
});
