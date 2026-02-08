import type { IncomingMessage, ServerResponse } from "node:http";

export function applyCors(req: IncomingMessage, res: ServerResponse, originAllowed: string | undefined) {
    const origin = req.headers.origin;

    if (originAllowed && origin && origin === originAllowed) {
        res.setHeader("Access-Control-Allow-Origin", originAllowed);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");

    if((req.method ?? "").toUpperCase() === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return true;
    }
    return false;
}
