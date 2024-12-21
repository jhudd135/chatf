import http from "node:http";
import { requestBody } from "./utils.ts";
import { Room, rooms } from "./room.ts";
import { UserConfig } from "./client/login.ts";

export function requestHandler(command: string, req: http.IncomingMessage, res: http.ServerResponse) {
    switch (command) {
        case "join/signup":
            requestBody(req).then(bodyString => {
                const body: /*UserConfig*/{room: string, name: string} = JSON.parse(bodyString);
                if (!validUsername(body.name)) {
                    res.writeHead(400);
                    res.end("username must be 4-16 characters long and only contain a-z, A-Z, 0-9, and _");
                    return;
                }
                if (!rooms.has(body.room)) {
                    res.writeHead(404);
                    res.end("room not found");
                    return;
                }
                const config: UserConfig = rooms.get(body.room).signup(body.name); 
                if (!config) {
                    res.writeHead(409);
                    res.end("username already taken");
                } else {
                    res.setHeader("Content-Type", "application/json");
                    res.writeHead(201);
                    res.end(JSON.stringify(config));
                }
                // }
            });
            break;
        case "join/login":
            requestBody(req).then(bodyString => {
                const body: UserConfig = JSON.parse(bodyString);
                if (!validUsername(body.name) || !rooms.has(body.room) || !rooms.get(body.room).exists(body.name, body.token)) {
                    res.writeHead(400);
                    res.end("invalid user config");
                    return;
                }
                res.writeHead(200);
                res.end();
            });
            break;
        case "leave":
            requestBody(req).then(bodyString => {
                const body: UserConfig = JSON.parse(bodyString);
                if (!rooms.has(body.room)) {
                    res.writeHead(404);
                    res.end("room not found");
                    return;
                }
                if (rooms.get(body.room).remove(body.name, body.token)) {
                    res.writeHead(201);
                    res.end("successfully removed");
                } else {
                    res.writeHead(400);
                    res.end("invalid token");
                }
            });
            break;
    }
}

function validUsername(name: string) {
    return !(name.length < 4 || name.match(/[^\w]/) || 16 < name.length);
}