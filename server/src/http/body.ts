import type { IncomingMessage } from "node:http";

export class HttpError extends Error {
    status: number;
    code? : string;
    constructor(status: number, message: string, code?: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

export async function readJson<T = unknown>(req: IncomingMessage, maxBytes = 1024 * 1024): Promise<T> {
    const chunks: Buffer[] = [];
    let total = 0;

    for await (const chunk of req) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        total += buf.length;
        if (total > maxBytes) throw new HttpError(413, "Payload too large");
        chunks.push(buf);
    }

    const raw = Buffer.concat(chunks).toString("utf-8").trim();
    if (!raw) return {} as T;

    try {
        return JSON.parse(raw) as T;
    } catch {
        throw new HttpError(400, "Invalid JSON");
    }
}
