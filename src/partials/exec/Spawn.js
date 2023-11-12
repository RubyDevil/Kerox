"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Stresser_1 = require("../classes/Stresser");
process.on('message', (message) => {
    if (!process.send)
        return;
    if (typeof message !== 'object')
        return;
    switch (message.type) {
        case 'spawn': {
            // create stresser
            new Stresser_1.Stresser(message.options);
            // send spawned message
            process.send({
                type: 'spawned',
                pid: process.pid
            });
            break;
        }
    }
});
//# sourceMappingURL=Spawn.js.map