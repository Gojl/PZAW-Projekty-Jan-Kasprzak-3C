import { createServer } from 'node:http';
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { handlePath } from "./src/path_handlers.js";

const index_html = readFileSync("static/index.html");

const server = createServer((req, res) => {
    const request_url = new URL(`http://${host}${req.url}`);
    const path = request_url.pathname;
    console.log(`Request: ${req.method} ${request_url.pathname}`);
      
    handlePath(request_url.pathname, req, res);

  if (!res.writableEnded) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Site not found!\n');
  }
});



const port = 65534;
const host = "localhost";

server.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
});
