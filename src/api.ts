import http from "node:http";
import { requestBody } from "./utils.ts";
import { Room, rooms } from "./room.ts";
import { User } from "./user.ts";

export function requestHandler(command: string, req: http.IncomingMessage, res: http.ServerResponse) {
    switch (command) {
        case "join":
            requestBody(req).then(bodyString => {
                const body: { room: string, user: string, token: string } = JSON.parse(bodyString);
                if (body.user.length < 4 || body.user.match(/[^\w]/)) {
                    res.writeHead(400);
                    res.end("username must be at least 4 characters long and only contain a-z, A-Z, 0-9, and _");
                    return;
                }
                if (rooms.has(body.room)) {
                    const room: Room = rooms.get(body.room);
                    let user: User;
                    if (body.token) {
                        user = room.userJoin(body.user, body.token);
                        if (!user) {
                            res.writeHead(400);
                            res.end("username and token combination does not exist");
                        } else {
                            res.setHeader("Content-Type", "application/json");
                            res.writeHead(200);
                            res.end(JSON.stringify(user));
                        }
                    } else {
                        user = room.newUserJoin(body.user);
                        if (!user) {
                            res.writeHead(409);
                            res.end("username already taken");
                        } else {
                            res.setHeader("Content-Type", "application/json");
                            res.writeHead(201);
                            res.end(JSON.stringify(user));
                        }
                    }
                } else {
                    res.writeHead(404);
                    res.end("room not found");
                }
            });
            break;
        case "leave":
            requestBody(req).then()
    }
}