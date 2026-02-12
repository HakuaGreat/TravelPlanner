import http from "node:http";
import { Router } from "./router.js";
import { applyCors } from "./middlewares/cors.js";
import { health } from "./routes/health.js";
import { loginRoute, logoutRoute, meRoute, registerRoute } from "./routes/auth.js";

function env(name: string, fallback?: string) {
    const v = process.env[name] ?? fallback;
    if ( v == null ) throw new  Error(`Missing env: ${name}`);
    return v;
}

import fs from "node:fs";
import path from "node:path";
const envPath = path.resolve(process.cwd(), ".env");
if ( fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for ( const line of lines ) {
        const t = line.trim();
        if(!t || t.startsWith("#")) continue;
        const i = t.indexOf("=");
        if ( i === -1 ) continue;
        const k = t.slice(0, i).trim();
        const v = t.slice(i + 1).trim();
        if(!(k in process.env)) process.env[k] = v;
    }
}

const router = new Router();
router.on("GET", "/health", health);

router.on("POST", "/auth/register", registerRoute);
router.on("POST", "/auth/login", loginRoute);
router.on("DELETE", "/auth/logout", logoutRoute);
router.on("GET", "/auth/me", meRoute);

const server = http.createServer(async (req, res) => {
    const handled = applyCors(req, res, process.env.CORS_ORIGIN);
    if( handled ) return;
    const start = Date.now();
    res.on("finish", () => {
        const ms = Date.now() - start;
        console.log(`${req.method} ${req.url} -> ${res.statusCode} ${ms}ms`);
    });

    await router.handle(req, res);
});

server.listen(Number(env("PORT", "3001")), () => {
    console.log(`API listening on http://localhost:${env("PORT", "3001")}`);
});