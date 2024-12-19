import http from "node:http";
import fs from "node:fs/promises";
import {Server} from "socket.io";

import * as api from "./api.ts";
import {Room, rooms} from "./room.ts";

const port = process.env.PORT || 3000;

const htmlCache: Map<string, Buffer> = new Map();
const jsCache: Map<string, Buffer> = new Map();

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    const url = req.url.substring(1);
    if (url.endsWith(".html")) {
        if (htmlCache.has(url)) {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(htmlCache.get(url));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({error:"Resource not found"}));
        }
    } else if (url.endsWith('.js')) {
        if (jsCache.has(url)) {
            res.setHeader("Content-Type", "text/javascript");
            res.writeHead(200);
            res.end(jsCache.get(url));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({error:"Resource not found"}));
        }
    } else if (url.includes("api/")) {
        api.requestHandler(url.substring(url.indexOf("api/") + 4), req, res);
    }
    else {
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(htmlCache.get("login.html"));
    }
});

function cacheDir(directory: string, cache: Map<string, Buffer>) {
    fs.readdir(directory).then(files => {
        files.forEach(name => {
            const path = "./" + directory + "/" + name;
            fs.readFile(path).then(contents => {
                cache.set(name, contents);
            }).catch(err => {
                console.error(`Could not read ${path} file: ${err}`);
                process.exit(1);
            });
        });
    });
}

cacheDir("html", htmlCache);
cacheDir("build/client", jsCache);

const io = new Server(server);

io.on("connection", socket => {
    const auth = socket.handshake.auth as {room: string, token: string};
    if (rooms.has(auth.room)) {
        rooms.get(auth.room).userConnect(socket, auth.token);
    } else {
        socket.disconnect(true);
    }
});

startServer();

function startServer() {
    Room.create("test", io);

    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

