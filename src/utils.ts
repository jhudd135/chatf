import http from "node:http";

export function requestBody(req: http.IncomingMessage): Promise<string> {
    return new Promise(resolve => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            resolve(Buffer.concat(chunks).toString());
        });
    });
}

export function randomString(length: number, chars: string) {
    return Array.from({length: length}).map(v => chars[Math.floor(Math.random() * chars.length)]).join("");
}