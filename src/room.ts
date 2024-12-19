import { Server, Socket } from "socket.io";
import { User } from "./user.ts";

export const rooms: Map<string, Room> = new Map();

export class Room {
    id: string;
    io: Server;
    users: Map<string, User>; // username : user
    tokens: Map<string, string>; // token : username
    // connections: Map<string, Socket>; // token : socket

    constructor(id: string, io: Server) {
        this.id = id;
        this.io = io;
        this.users = new Map();
        this.tokens = new Map();
        // this.connections = new Map();
    }
    static create(id: string, io: Server) {
        rooms.set(id, new Room(id, io));
    }

    newUserJoin(name: string): User {
        if (this.users.has(name)) {
            return null;
        }
        const user = new User(name);
        this.users.set(name, user);
        this.tokens.set(user.token, user.name);
        return user;
    }
    userJoin(name: string, token: string): User {
        return this.users.has(name) && this.users.get(name).token === token ? this.users.get(name) : null;
    }
    userConnect(socket: Socket, token: string) {
        if (this.tokens.has(token)) {
            // this.connections.set(token, socket);
            console.log("connected user", this.users.get(this.tokens.get(token)).toString(), "room", this.id);
            socket.join(this.id);
            socket.on("message", msg => {
                this.io.to(this.id).emit("message", msg);
            });
        } else {
            socket.disconnect(true);
        }
    }
}