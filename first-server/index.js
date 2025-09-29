import { createServer } from 'node:http';
import { getActiveResourcesInfo } from 'node:process';

const server = createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('hello world');
});

const port = 65535;
const host = "localhost";

server.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
});
