import http from "http";

const port = 3000;

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    res.writeHead(200);
    res.end("hello world!\n");
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});