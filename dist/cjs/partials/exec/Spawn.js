"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Stresser_1 = require("../classes/Stresser");
const PacketType_1 = require("../enums/PacketType");
const Packet_1 = require("../types/Packet");
const Log_1 = require("../types/Log");
const LogType_1 = require("../enums/LogType");
let stresser;
process.on('message', (packet) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if (!process.send)
        return;
    switch (packet.type) {
        case PacketType_1.PacketType.Init: {
            stresser = new Stresser_1.Stresser(packet.data);
            (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, (0, Packet_1.Packet)(PacketType_1.PacketType.Spawned, undefined));
            break;
        }
        case PacketType_1.PacketType.ValidateProxies: {
            (_b = process.send) === null || _b === void 0 ? void 0 : _b.call(process, (0, Packet_1.Packet)(PacketType_1.PacketType.Log, (0, Log_1.Log)(LogType_1.LogType.Info, `Validating proxies...`._dim)));
            const validProxies = yield stresser.validateProxies((_c = packet.data) === null || _c === void 0 ? void 0 : _c.proxies);
            process.send((0, Packet_1.Packet)(PacketType_1.PacketType.ValidationCompleted, validProxies));
            process.send((0, Packet_1.Packet)(PacketType_1.PacketType.Done, undefined));
            break;
        }
        case PacketType_1.PacketType.Stress: {
            if (!packet.data)
                throw new Error('Duration cannot be null.');
            yield stresser.stress(packet.data);
            break;
        }
    }
}));
//# sourceMappingURL=Spawn.js.map