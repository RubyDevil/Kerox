import * as http from 'http';
import * as fs from 'fs';

const server = http.createServer();

server.on('request', (req, res) => {
   let ips = [req.headers['x-forwarded-for']/*.split(',')*/, req.socket.remoteAddress];
   // remove undefined values
   ips = ips.filter(ip => typeof ip !== 'undefined');
   // flatten array
   ips = ips.flat();
   // log ips
   console.log(ips);
   // write ips to file
   ips.forEach((ip: any) => {
      (ip.length > 15)
         ? fs.appendFileSync('ipv6.log', ip + '\n')
         : fs.appendFileSync('ipv4.log', ip + '\n');
   });
});

server.listen(80, '82.165.215.110');
