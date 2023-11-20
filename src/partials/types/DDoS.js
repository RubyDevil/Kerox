"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDDoSDuration = void 0;
/**
 * DDoS Durations
 */
const DDoSDurations = [15, 30, 60, 120, 300];
function isDDoSDuration(value) {
    return DDoSDurations.includes(value);
}
exports.isDDoSDuration = isDDoSDuration;
//# sourceMappingURL=DDoS.js.map