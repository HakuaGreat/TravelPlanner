import { json } from "../http/response.js";
import type { Handler } from "../router.js";

export const health: Handler = async (_req, res) => { json(res, 200, { ok: true });
};