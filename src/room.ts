import { Server, Socket } from "socket.io";
import { User } from "./user.ts";
import { Message } from "./client/chat.ts";
import { UserConfig } from "./client/login.ts";

export const rooms: Map<string, Room> = new Map();

export class Room {
    id: string;
    io: Server;
    users: Map<string, User>; // username : user
    tokens: Map<string, string>; // token : username
    messages: Message[];
    // connections: Map<string, Socket>; // token : socket

    constructor(id: string, io: Server) {
        this.id = id;
        this.io = io;
        this.users = new Map();
        this.tokens = new Map();
        this.messages = [];
        // this.connections = new Map();
    }
    static create(id: string, io: Server) {
        rooms.set(id, new Room(id, io));
    }

    signup(name: string): UserConfig {
        if (this.users.has(name)) {
            return null;
        }
        const user = new User(name);
        this.users.set(name, user);
        this.tokens.set(user.token, user.name);
        return {room: this.id, name: user.name, token: user.token};
    }
    login(name: string, token: string): UserConfig {
        return this.users.has(name) && this.users.get(name).token === token ? {room: this.id, name: name, token: token} : null;
    }
    remove(name: string, token: string): boolean {
        if (this.tokens.has(token) && this.tokens.get(token) === name) {
            this.users.get(name).remove();
            this.users.delete(name);
            this.tokens.delete(token);
            return true;
        }
        return false;
    }
    userConnect(socket: Socket, auth: UserConfig) {
        if (this.tokens.has(auth.token) && this.tokens.get(auth.token) === auth.name) {
            // this.connections.set(token, socket);
            console.log("connected user", this.users.get(auth.name).toString(), "room", this.id);
            socket.join(this.id);
            socket.on("refresh", callback => {
                callback(this.messages);
            });
            socket.on("message", msg => {
                const message = msg as Message;
                message.content = message.content.trim();
                if (message.content) {
                    this.messages.push(message);
                    this.io.to(this.id).emit("message", message);
                }
            });
        } else {
            socket.disconnect(true);
        }
    }
}