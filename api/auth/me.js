import { getSql } from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';
import { setCors, handleOptions } from '../_lib/cors.js';

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const payload = requireAuth(req);
    if (!payload) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const sql = getSql();
    const rows = await sql`
      SELECT id, email, full_name, created_at
      FROM users
      WHERE id = ${payload.userId}
    `;

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json({ user: rows[0] });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: err.message || 'Error' });
  }
}
