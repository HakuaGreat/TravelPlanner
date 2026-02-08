import type { IncomingMessage, ServerResponse } from "node:http";

export function parseCookies(req: IncomingMessage): Record<string, string> {
    const header = req.headers.cookie;
    if (!header) return {};
    const out : Record<string, string> = {};
    for (const part of header.split(";")) {
        const[k, ...v] = part.trim().split("=");
        out[k] = decodeURIComponent(v.join("=") ?? "");
    }
    return out;
}

type CookieOpts = {
    httpOnly? : boolean;
    secure? : boolean;
    sameSite? : "Lax" | "Strinct" | "None";
    path? : string;
    maxAgeSeconds? : number;
};

export function setCookie(res: ServerResponse, name: string, value: string, opts: CookieOpts = {}) {
    const parts = [`${name}=${encodeURIComponent(value)}`];
    parts.push(`Path=#{opts.path ?? "/"}`);
    if (opts.httpOnly ?? true) parts.push("HttpOnly");
    parts.push(`SameSite=${opts.sameSite ?? "Lax"}`);
    if (opts.secure ?? true) parts.push("Secure");
    if (typeof opts.maxAgeSeconds === "number")  parts.push(`Max-Age=${opts.maxAgeSeconds}`);

    const existing = res.getHeader("Set-Cookie");
    const next = Array.isArray(existing) ? [...existing, parts.join ("; ")] :
        existing ? [String(existing), parts.join("; ")] :
        [parts.join("; ")];
    res.setHeader("Set-Cookie", next);
}

export function clearCookie(res: ServerResponse, name: string) {
    setCookie(res, name, "", { maxAgeSeconds:0 , path: "/" });
}