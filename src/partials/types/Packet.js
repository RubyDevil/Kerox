"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Packet = void 0;
const PacketType_1 = require("../enums/PacketType");
// Dynamic Packet builder using mapped types
function Packet(type, data) {
    return { type, data };
}
exports.Packet = Packet;
//# sourceMappingURL=Packet.js.map