"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Stresser_1 = require("../classes/Stresser");
const PacketType_1 = require("../enums/PacketType");
const Packet_1 = require("../types/Packet");
const Log_1 = require("../types/Log");
const LogType_1 = require("../enums/LogType");
let stresser;
process.on('message', async (packet) => {
    if (!process.send)
        return;
    switch (packet.type) {
        case PacketType_1.PacketType.Init: {
            stresser = new Stresser_1.Stresser(packet.data);
            process.send?.((0, Packet_1.Packet)(PacketType_1.PacketType.Spawned, undefined));
            break;
        }
        case PacketType_1.PacketType.ValidateProxies: {
            process.send?.((0, Packet_1.Packet)(PacketType_1.PacketType.Log, (0, Log_1.Log)(LogType_1.LogType.Info, `Validating proxies...`._dim)));
            await stresser.validateProxies(packet.data?.proxies, packet.data?.timeout);
            process.send((0, Packet_1.Packet)(PacketType_1.PacketType.Done, undefined));
            break;
        }
        case PacketType_1.PacketType.Stress: {
            if (!packet.data)
                throw new Error('Duration cannot be null.');
            stresser.stress(packet.data);
            break;
        }
    }
});
//# sourceMappingURL=Spawn.js.map