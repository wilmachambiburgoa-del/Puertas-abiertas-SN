import { getSql } from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';
import { setCors, handleOptions } from '../_lib/cors.js';

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'ID requerido' });
  }

  const sql = getSql();
  const payload = requireAuth(req);
  if (!payload) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    // Verificar propiedad
    const existing = await sql`SELECT * FROM casas WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Casa no encontrada' });
    }
    if (existing[0].user_id !== payload.userId) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM casas WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const body = req.body || {};
      // Solo permitir desactivar o actualizar campos básicos
      if (body.activo !== undefined) {
        const rows = await sql`
          UPDATE casas SET activo = ${!!body.activo} WHERE id = ${id} RETURNING *
        `;
        return res.status(200).json({ casa: rows[0] });
      }
      return res.status(400).json({ error: 'Nada que actualizar' });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('Casa id error:', err);
    return res.status(500).json({ error: err.message || 'Error' });
  }
}
