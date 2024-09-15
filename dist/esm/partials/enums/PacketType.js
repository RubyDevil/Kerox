export var PacketType;
(function (PacketType) {
    // STRESSER -> KEROX
    /** Data to be displayed on the main console */
    PacketType[PacketType["Log"] = 0] = "Log";
    /** Stresser stats data */
    PacketType[PacketType["Data"] = 1] = "Data";
    /** Error */
    PacketType[PacketType["Error"] = 2] = "Error";
    /** Stresser spawned successfully */
    PacketType[PacketType["Spawned"] = 3] = "Spawned";
    /** Stresser completed task */
    PacketType[PacketType["Done"] = 4] = "Done";
    /** Proxies validated */
    PacketType[PacketType["ValidationCompleted"] = 5] = "ValidationCompleted";
    // KEROX -> STRESSER
    /** Initialize stresser */
    PacketType[PacketType["Init"] = 6] = "Init";
    /** Begin attack */
    PacketType[PacketType["Stress"] = 7] = "Stress";
    /** Validate proxies */
    PacketType[PacketType["ValidateProxies"] = 8] = "ValidateProxies";
})(PacketType || (PacketType = {}));
;
//# sourceMappingURL=PacketType.js.map