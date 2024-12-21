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
    connections: Map<string, Socket>; // token : socket

    constructor(id: string, io: Server) {
        this.id = id;
        this.io = io;
        this.users = new Map();
        this.tokens = new Map();
        this.connections = new Map();
        this.messages = [];
    }
    static create(id: string, io: Server) {
        rooms.set(id, new Room(id, io));
    }

    private exists(name: string, token: string) {
        return this.tokens.has(token) && this.tokens.get(token) === name;
    }
    signup(name: string): UserConfig {
        if (this.users.has(name)) {
            return null;
        }
        const user = new User(name);
        this.users.set(name, user);
        this.tokens.set(user.token, user.name);
        return { room: this.id, name: user.name, token: user.token };
    }
    login(name: string, token: string): UserConfig {
        return this.exists(name, token) ? { room: this.id, name: name, token: token } : null;
    }
    remove(name: string, token: string): boolean {
        if (!this.exists(name, token)) {
            return false;
        }
        this.notifyConnection(token, false);
        this.users.get(name).remove();
        this.users.delete(name);
        this.tokens.delete(token);
        return true;
    }
    userConnect(socket: Socket, auth: UserConfig) {
        if (!this.exists(auth.name, auth.token) || this.connections.has(auth.token)) {
            socket.disconnect(true);
            return;
        }
        this.connections.set(auth.token, null); // change null to socket if actually needed
        
        socket.join(this.id);

        socket.on("disconnect", () => {
            this.connections.delete(auth.token);
            this.notifyConnection(auth.token, false);
        });

        socket.on("refresh", callback => {
            callback({messages: this.messages, names: Array.from(this.connections.keys()).map(tk => this.tokens.get(tk))});
        });
        
        socket.on("message", (msg: { token: string, message: Message }) => {
            const message = msg.message as Message;
            if (!this.exists(message.name, msg.token)) {
                return;
            }
            message.content = message.content.trim();
            if (!message.content) {
                return;
            }
            this.messages.push(message);
            this.io.to(this.id).emit("message", message);
            
        });

        // console.log("connected user", this.users.get(auth.name).toString(), "room", this.id);
        
        this.notifyConnection(auth.token, true);
    }

    notifyConnection(token: string, connected: boolean) {
        if (!this.tokens.has(token)) {return;}
        console.log(
            this.id, ":", 
            this.tokens.get(token) + ":" + token, 
            connected ? "connected" : "disconnected", 
            Array.from(this.connections.keys()).map(tk => this.tokens.get(tk))
        );
        this.io.to(this.id).emit("statusUpdate", {name: this.tokens.get(token), connected: connected});
    }
}