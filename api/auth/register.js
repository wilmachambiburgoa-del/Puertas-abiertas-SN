import { getSql } from '../_lib/db.js';
import { hashPassword, signToken } from '../_lib/auth.js';
import { setCors, handleOptions } from '../_lib/cors.js';

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { email, password, full_name } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const sql = getSql();
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya existe una cuenta con este email' });
    }

    const password_hash = await hashPassword(password);
    const rows = await sql`
      INSERT INTO users (email, password_hash, full_name)
      VALUES (${email.toLowerCase().trim()}, ${password_hash}, ${full_name || null})
      RETURNING id, email, full_name, created_at
    `;

    const user = rows[0];
    const token = signToken({ userId: user.id, email: user.email });

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message || 'Error al registrar' });
  }
}
