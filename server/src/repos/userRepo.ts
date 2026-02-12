import { pool } from "../db/pool.js";

export type UserRow = { id: number; email: string; password_hash: string };

export async function findUserByEmail(email: string): Promise<UserRow | null> {
    const [rows] = await pool.query("SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1", [email]);
    const arr = rows as UserRow[];
    return arr[0] ?? null;
}

export async function createUser(email: string, passwordHash: string): Promise<{ id:number; email: string }> {
    const [result] = await pool.execute("INSERT INTO users (email, password_hash) VALUES (? ,?)", [email, passwordHash]);
    const r = result as { insertId: number };
    return { id: r.insertId, email };
}

export async function findUserById(id: number): Promise<{ id: number; email: string } | null> {
    const [rows] = await pool.query("SELECT id, email FROM users WHERE id = ? LIMIT 1", [id]);
    const arr = rows as { id: number; email: string }[];
    return arr[0] ?? null;
}