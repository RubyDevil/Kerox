export declare enum PacketType {
    /** Data to be displayed on the main console */
    Log = 0,
    /** Stresser stats data */
    Data = 1,
    /** Error */
    Error = 2,
    /** Stresser spawned successfully */
    Spawned = 3,
    /** Stresser completed task */
    Done = 4,
    /** Proxies validated */
    ValidationCompleted = 5,
    /** Initialize stresser */
    Init = 6,
    /** Begin attack */
    Stress = 7,
    /** Validate proxies */
    ValidateProxies = 8
}
