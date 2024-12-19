import { User } from "./user.ts";

export const rooms: Map<string, Room> = new Map();

export class Room {
    id: string;
    users: Map<string, User>

    constructor(id: string) {
        this.id = id;
        this.users = new Map();
    }
    static create(id: string) {
        rooms.set(id, new Room(id));
    }

    userJoin(name: string): User {
        if (this.users.has(name)) {
            return null;
        }
        const user = new User(name);
        this.users.set(name, user);
        return user;
    }
}