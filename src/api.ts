import http from "node:http";
import { requestBody } from "./utils.ts";
import { Room, rooms } from "./room.ts";
import { User } from "./user.ts";

export function requestHandler(command: string, req: http.IncomingMessage, res: http.ServerResponse) {
    switch (command) {
        case "join":
            requestBody(req).then(body => {
                const json: {room: string, user: string, token: string} = JSON.parse(body);
                if (json.user.length < 4 || json.user.match(/[^\w]/)) {
                    res.writeHead(400);
                    res.end("username must be at least 4 characters long and only contain a-z, A-Z, 0-9, and _");
                    return;
                }
                if (rooms.has(json.room)) {
                    const room: Room = rooms.get(json.room);
                    let user: User;
                    if (json.token) {
                        user = room.userJoin(json.user, json.token);
                        if (!user) {
                            res.writeHead(400);
                            res.end("username and token combination does not exist");
                            return;
                        }
                    } else {
                        user = room.newUserJoin(json.user);
                        if (!user) {
                            res.writeHead(409);
                            res.end("username already taken");
                            return;
                        }
                    }
                    res.setHeader("Content-Type", "application/json");
                    res.writeHead(201);
                    res.end(JSON.stringify(user));
                } else {
                    res.writeHead(404);
                    res.end("room not found");
                }
            });
            break;
    }
}