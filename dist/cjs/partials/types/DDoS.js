"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDDoSDuration = isDDoSDuration;
/**
 * DDoS Durations
 */
const DDoSDurations = [15, 30, 60, 120, 300];
function isDDoSDuration(value) {
    return DDoSDurations.includes(value);
}
//# sourceMappingURL=DDoS.js.map