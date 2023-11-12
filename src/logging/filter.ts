import * as fs from 'fs';

let ipv4_data = fs.readFileSync('ipv4.log', 'utf8');
let ipv6_data = fs.readFileSync('ipv6.log', 'utf8');

let ipv4s = [...new Set(ipv4_data.split('\n'))];
let ipv6s = [...new Set(ipv6_data.split('\n'))];


let log = {
   total: ipv4s.length + ipv6s.length,
   ipv4: ipv4s.length,
   ipv6: ipv6s.length,
};

console.log(log);