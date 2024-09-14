"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Packet = Packet;
const PacketType_1 = require("../enums/PacketType");
// Dynamic Packet builder using mapped types
function Packet(type, data) {
    return { type, data };
}
//# sourceMappingURL=Packet.js.map