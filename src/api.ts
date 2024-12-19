import http from "node:http";
import { requestBody } from "./utils.ts";
import { Room, rooms } from "./room.ts";

export function requestHandler(command: string, req: http.IncomingMessage, res: http.ServerResponse) {
    switch (command) {
        case "join":
            requestBody(req).then(body => {
                const json: {room: string, user: string} = JSON.parse(body);
                if (rooms.has(json.room)) {
                    const user = rooms.get(json.room).userJoin(json.user);
                    if (user) {
                        res.setHeader("Content-Type", "application/json");
                        res.writeHead(201);
                        res.end(JSON.stringify(user));
                    } else {
                        res.writeHead(409);
                        res.end("username already taken");
                    }
                    
                } else {
                    res.writeHead(404);
                    res.end("room not found");
                }
            });
            break;
    }
}