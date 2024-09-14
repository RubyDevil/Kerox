"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Info = exports.Status = void 0;
var Status;
(function (Status) {
    Status["Unknown"] = "Unknown";
    Status["Idle"] = "Idle";
    Status["Busy"] = "Busy";
    Status["Dead"] = "Dead";
})(Status || (exports.Status = Status = {}));
var Info;
(function (Info) {
    Info["Unknown"] = "Unknown";
    Info["Initializing"] = "Initializing";
    Info["ValidatingProxies"] = "Validating Proxies";
    Info["Stressing"] = "Currently Converging DDoS Attack";
})(Info || (exports.Info = Info = {}));
//# sourceMappingURL=Status.js.map