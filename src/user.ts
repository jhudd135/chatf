import { randomString } from "./utils.ts";

const tokenChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const tokens: Set<string> = new Set();

export class User {
    name: string;
    token: string;
    constructor(name: string) {
        this.name = name;
        do {
            this.token = randomString(6, tokenChars);
        } while (tokens.has(this.token));
        tokens.add(this.token);
    }
    toString(): string {
        return this.name + ":" + this.token;
    }
}