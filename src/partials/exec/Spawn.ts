import { Stresser } from "../classes/Stresser";

process.on('message', (message: any) => {

   if (!process.send) return;

   if (typeof message !== 'object') return;

   switch (message.type) {

      case 'spawn': {
         // create stresser
         new Stresser(message.options);
         // send spawned message
         process.send({
            type: 'spawned',
            pid: process.pid
         });
         break;
      }

   }

});