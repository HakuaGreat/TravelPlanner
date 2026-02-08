import type { IncomingMessage, ServerResponse } from "node:http";
import { json } from "./http/response.js";
import { HttpError } from "./http/body.js";

export type Hadler = (req: IncomingMessage, res: ServerResponse, 
    params: Record<string, string>) => Promise<void> | void;

type Route = {
    method: string;
    pattern: RegExp;
    keys: string[];
    hadler: Hadler;
};

function compilePath(path: string): { pattern: RegExp; keys: string[] } {
    const keys: string[] = [];
    const escaped = path.split("/").map((seg) => {
        if (seg.startsWith(":")) {
            keys.push(seg.slice(1));
            return "([^/]+)";
        }
        return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
    return { pattern: new RegExp(`^${escaped}$`), keys };
}

export class Router {
    private routes: Route[] = [];

    on(method: string, path: string, hadler: Handler) {
        const { pattern, keys } = compilePath(path);
        this.routes.push({ method: method.toUpperCase(), pattern, keys, handler });
    }

    async handle(req: IncomingMessage, res: ServerResponse) {
        try {
            const method = (req.method ?? "GET").toUpperCase();
            const url = new URL(req.url ?? "/", "http://local");
            const pathname = url.pathname;

            for (const r of this.routes) {
                if ( r.method !== method ) continue;
                const m = pathname.match(r.pattern)
                if(!m) continue;

                const params: Record<string, string> = {};
                r.keys.forEach((k,i) => (params[k] = decodeURIComponent(m[i + 1] ?? "" )));
                await r.handler(req, res, params);
                return;
            }
            json(res, 404, { error: "Not Found" });
        } catch (e) {
            const err = e instanceof HttpError ? e: new HttpError(500, "Internal Server Error");
            json(res, err.status, { error: err.message, code: err.code});
        }
    }
}