import type { ServerResponse } from "node:http";

export function json(res: ServerResponse, status: number, data: unknown) {
    const body = JSON.stringify(data);
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Length", Buffer.byteLength(body));
    res.end(body);
}

export function text(res: ServerResponse, status: number, date: string) {
    res.statusCode = status;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(date);
}

export function noContent(res: ServerResponse, status=204) {
    res.statusCode = status;
    res.end();
}