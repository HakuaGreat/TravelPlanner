import mysql from "mysql2/promise";

function env(name: string, fallback?: string) {
    const v = process.env[name] ?? fallback;
    if (v == null) throw new Error(`Missing env: ${name}`);
    return v;
}

export const pool = mysql.createPool({
    host: env("DB_HOST"),
    port: Number(env("DB_PORT", "3306")),
    user: env("DB_USER"),
    password: env("DB_PASSWORD"),
    database: env("DB_NAME"),
    connectionLimit: 10
});