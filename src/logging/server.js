"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const server = http.createServer();
server.on('request', (req, res) => {
    let ips = [req.headers['x-forwarded-for'] /*.split(',')*/, req.socket.remoteAddress];
    // remove undefined values
    ips = ips.filter(ip => typeof ip !== 'undefined');
    // flatten array
    ips = ips.flat();
    // log ips
    console.log(ips);
    // write ips to file
    ips.forEach((ip) => {
        (ip.length > 15)
            ? fs.appendFileSync('ipv6.log', ip + '\n')
            : fs.appendFileSync('ipv4.log', ip + '\n');
    });
});
server.listen(80, '82.165.215.110');
//# sourceMappingURL=server.js.map