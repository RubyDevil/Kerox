var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Stresser } from "../classes/Stresser";
import { PacketType } from "../enums/PacketType";
import { Packet } from "../types/Packet";
import { Log } from "../types/Log";
import { LogType } from "../enums/LogType";
let stresser;
process.on('message', (packet) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if (!process.send)
        return;
    switch (packet.type) {
        case PacketType.Init: {
            stresser = new Stresser(packet.data);
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, Packet(PacketType.Spawned, undefined));
            break;
        }
        case PacketType.ValidateProxies: {
            (_b = process.send) === null || _b === void 0 ? void 0 : _b.call(process, Packet(PacketType.Log, Log(LogType.Info, `Validating proxies...`._dim)));
            yield stresser.validateProxies((_c = packet.data) === null || _c === void 0 ? void 0 : _c.proxies);
            process.send(Packet(PacketType.Done, undefined));
            break;
        }
        case PacketType.Stress: {
            if (!packet.data)
                throw new Error('Duration cannot be null.');
            yield stresser.stress(packet.data);
            break;
        }
    }
}));
//# sourceMappingURL=Spawn.js.map