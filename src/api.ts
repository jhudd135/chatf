import http from "node:http";
import { requestBody } from "./utils.ts";
import { Room, rooms } from "./room.ts";
import { UserConfig } from "./client/login.ts";

export function requestHandler(command: string, req: http.IncomingMessage, res: http.ServerResponse) {
    switch (command) {
        case "join":
            requestBody(req).then(bodyString => {
                const body: UserConfig = JSON.parse(bodyString);
                if (body.name.length < 4 || body.name.match(/[^\w]/)) {
                    res.writeHead(400);
                    res.end("username must be at least 4 characters long and only contain a-z, A-Z, 0-9, and _");
                    return;
                }
                if (!rooms.has(body.room)) {
                    res.writeHead(404);
                    res.end("room not found");
                    return;
                }
                const room: Room = rooms.get(body.room);
                let config: UserConfig;
                if (body.token) {
                    config = room.login(body.name, body.token);
                    if (!config) {
                        res.writeHead(400);
                        res.end("username and token combination does not exist");
                    } else {
                        res.setHeader("Content-Type", "application/json");
                        res.writeHead(200);
                        res.end(JSON.stringify(config));
                    }
                } else {
                    config = room.signup(body.name);
                    if (!config) {
                        res.writeHead(409);
                        res.end("username already taken");
                    } else {
                        res.setHeader("Content-Type", "application/json");
                        res.writeHead(201);
                        res.end(JSON.stringify(config));
                    }
                }
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
                    res.end("username and token combination does not exist");
                }
            });
    }
}