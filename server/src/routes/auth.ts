import type { Handler } from "../router.js";
import { readJson, HttpError } from "../http/body.js";
import { json, noContent } from "../http/response.js";
import { clearCookie, parseCookies, setCookie } from "../http/cookies.js";
import { login, register } from "../services/authService.js";
import { deleteSession, findSession } from "../repos/sessionRepo.js";
import { findUserById } from "../repos/userRepo.js";

function env(name: string, fallback?: string) {
    return process.env[name] ?? fallback;
}

const COOKIE = () => env("SESSION_COOKIE_NAME", "jc_sid");

export const registerRoute: Handler = async(req, res) => {
    const body = await readJson<{ email?: String; password?: string}>(req);
    const user = await register(String(body.email ?? ""), String(body.password ?? ""));
    json(res, 201, { user });
};

export const loginRoute: Handler = async (req, res) => {
    const body = await readJson<{ email?: String; password?: string}>(req);
    const out = await login(String(body.email ?? ""), String(body.password ?? ""));

    //localhost 想定だFalse　https化でTrue切り替え COOKIE()のundefinedは一時的な対応中
    setCookie(res, COOKIE()!, out.sid, {
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
        maxAgeSeconds: Math.floor((out.expiresAt.getTime() - Date.now()) / 1000)
    });

    json(res, 200, { user: out.user });
};

export const logoutRoute: Handler = async (req, res) => {
    const cookies = parseCookies(req);
    const sid = cookies[COOKIE()!];
    if (sid) await deleteSession(sid);
    clearCookie(res, COOKIE()!);
    noContent(res, 204);
};

export const meRoute: Handler = async (req, res) => {
    const cookies = parseCookies(req);
    const sid = cookies[COOKIE()!];
    if(!sid) throw new HttpError(401, "not logged in");
    const sess = await findSession(sid);
    if (!sess) throw new HttpError(401, "invalid session");
    if (new Date(sess.expires_at).getTime() < Date.now()) {
        await deleteSession(sid);
        throw new HttpError(401, "session expired");
    }

    const user = await findUserById(sess.user_id);
    if(!user) throw new HttpError(401, "invalid session");
    json(res, 200, { user });
}