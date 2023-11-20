export enum PacketType {

   // STRESSER -> KEROX

   /** Data to be displayed on the main console */
   Log,
   /** Stresser stats data */
   Data,
   /** Error */
   Error,
   /** Stresser spawned successfully */
   Spawned,
   /** Stresser completed task */
   Done,

   // KEROX -> STRESSER

   /** Initialize stresser */
   Init,
   /** Begin attack */
   Stress,
   /** Validate proxies */
   ValidateProxies,
};