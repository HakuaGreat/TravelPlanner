import { pool } from "../db/pool.js";

export async function createSession(id: string, userId: number, expiresAt: Date) {
    await pool.execute("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", [id, userId, expiresAt]);
}

export async function deleteSession(id: string) {
    await pool.execute("DELETE FROM sessions WHERE id = ?", [id]);
}

export async function findSession(id: string) : Promise<{ id: string; user_id: number; expires_at: Date } | null> {
    const [rows] = await pool.query("SELECT id, user_id, expires_at FROM sessions WHERE id = ? LIMIT 1", [id]);
    const arr = rows as { id: string; user_id: number; expires_at: Date }[];
    return arr[0] ?? null;
}