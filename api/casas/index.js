import { getSql } from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';
import { setCors, handleOptions } from '../_lib/cors.js';

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;

  const sql = getSql();

  try {
    if (req.method === 'GET') {
      // Listar casas activas (público) o las del usuario si ?mine=1
      const mine = req.query.mine === '1' || req.query.mine === 'true';
      
      if (mine) {
        const payload = requireAuth(req);
        if (!payload) {
          return res.status(401).json({ error: 'Debes iniciar sesión' });
        }
        const rows = await sql`
          SELECT * FROM casas
          WHERE user_id = ${payload.userId}
          ORDER BY created_at DESC
        `;
        return res.status(200).json({ casas: rows });
      }

      // Público: solo activas
      const rows = await sql`
        SELECT id, user_id, nombre_dueno, whatsapp, titulo, direccion, precio,
               habitaciones, banos, tipo, descripcion, imagenes, latitud, longitud,
               activo, created_at
        FROM casas
        WHERE activo = true
        ORDER BY created_at DESC
      `;
      return res.status(200).json({ casas: rows });
    }

    if (req.method === 'POST') {
      const payload = requireAuth(req);
      if (!payload) {
        return res.status(401).json({ error: 'Debes iniciar sesión para publicar' });
      }

      const body = req.body || {};
      const {
        nombre_dueno, whatsapp, titulo, direccion, precio,
        habitaciones, banos, tipo, descripcion, imagenes,
        latitud, longitud
      } = body;

      if (!titulo || !precio) {
        return res.status(400).json({ error: 'Título y precio son obligatorios' });
      }

      const rows = await sql`
        INSERT INTO casas (
          user_id, nombre_dueno, whatsapp, titulo, direccion, precio,
          habitaciones, banos, tipo, descripcion, imagenes, latitud, longitud, activo
        ) VALUES (
          ${payload.userId},
          ${nombre_dueno || null},
          ${whatsapp || null},
          ${titulo},
          ${direccion || null},
          ${Number(precio)},
          ${habitaciones ? Number(habitaciones) : null},
          ${banos ? Number(banos) : null},
          ${tipo || 'casa'},
          ${descripcion || null},
          ${imagenes || []},
          ${latitud ? Number(latitud) : null},
          ${longitud ? Number(longitud) : null},
          true
        )
        RETURNING *
      `;

      return res.status(201).json({ casa: rows[0] });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('Casas error:', err);
    return res.status(500).json({ error: err.message || 'Error en casas' });
  }
}
