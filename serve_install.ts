import http from 'http';
import fs from 'fs';
import path from 'path';

const deploySh = fs.readFileSync(path.join(__dirname, 'server_full_deploy.sh'), 'utf8');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(deploySh);
});

server.listen(3399, '0.0.0.0', () => {
  console.log('Temporary installer serving on port 3399');
});
