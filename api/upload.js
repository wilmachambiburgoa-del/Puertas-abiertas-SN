import { put } from '@vercel/blob';
import { requireAuth } from './_lib/auth.js';
import { setCors, handleOptions } from './_lib/cors.js';

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const payload = requireAuth(req);
  if (!payload) {
    return res.status(401).json({ error: 'Debes iniciar sesión' });
  }

  try {
    // Esperamos body: { filename, contentType, data (base64) }
    const { filename, contentType, data } = req.body || {};

    if (!filename || !data) {
      return res.status(400).json({ error: 'filename y data (base64) son requeridos' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      // Fallback: devolver data URL (solo para desarrollo / sin Blob configurado)
      // En producción se recomienda configurar BLOB_READ_WRITE_TOKEN
      const dataUrl = `data:${contentType || 'image/jpeg'};base64,${data}`;
      return res.status(200).json({ url: dataUrl, fallback: true });
    }

    const buffer = Buffer.from(data, 'base64');
    const blob = await put(`casas/${payload.userId}/${Date.now()}-${filename}`, buffer, {
      access: 'public',
      contentType: contentType || 'image/jpeg',
      token,
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message || 'Error al subir imagen' });
  }
}
