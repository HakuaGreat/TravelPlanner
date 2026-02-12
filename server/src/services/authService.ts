import argon2 from "argon2";
import crypto from "node:crypto";
import { HttpError } from "../http/body.js";
import { createUser, findUserByEmail } from "../repos/userRepo.js";
import { createSession } from "../repos/sessionRepo.js";

function env(name: string, fallback: string) {
    return process.env[name] ?? fallback;
}

export async function register (email: string, password: string) {
    if (!email || !password) throw new HttpError(400, "email and password rewuired");
    if (password.length < 8) throw new HttpError(400, "password too short");

    const exists = await findUserByEmail(email);
    if(exists) throw new HttpError(400, "email already registered");
    const hash = await argon2.hash(password);
    return await createUser(email, hash);
}

export async function login(email: string, password: string) {
    if(!email || !password) throw new HttpError(400, "email and password required");
    const user = await  findUserByEmail(email);
    
    if(!user) throw new HttpError(401, "invalid credentials");
    const ok = await argon2.verify(user.password_hash, password);
    if(!ok) throw new HttpError(401, "invalid credentials");

    const sid = crypto.randomBytes(31).toString("hex");
    const ttlDays = Number(env("SESSION_TTIL_DAYS", "14"));
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    await createSession(sid , user.id, expiresAt);

    return { sid, user: { id: user.id, email: user.email }, expiresAt};

}