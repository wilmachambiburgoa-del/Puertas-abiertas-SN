# Puertas Abiertas — Neon + Vercel

Portal de alquileres migrado de **Supabase** a **Neon (PostgreSQL)** + **Vercel Serverless Functions**.

## Qué cambió

- Base de datos: **Neon** (Postgres serverless)
- Auth: propia con JWT + bcrypt (tabla `users`)
- Imágenes: **Vercel Blob** (recomendado) o fallback a data-URL
- Backend: funciones serverless en `/api`
- Frontend: HTML/JS estático (mismo diseño)

## 1. Crear proyecto en Neon

1. Entra a [https://console.neon.tech](https://console.neon.tech) y crea un proyecto.
2. Copia la **Connection string** (DATABASE_URL).
3. En el SQL Editor de Neon, pega y ejecuta el contenido de `schema.sql`.

## 2. Variables de entorno

Copia `.env.example` a `.env` (solo local) y configura:

```
DATABASE_URL=postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require
JWT_SECRET=una_cadena_muy_segura_y_larga
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...   # opcional pero recomendado
```

### Cómo obtener BLOB_READ_WRITE_TOKEN

1. En el dashboard de Vercel → tu proyecto → **Storage** → **Blob** → Create.
2. Copia el token `BLOB_READ_WRITE_TOKEN`.
3. Si no configuras Blob, las imágenes se guardan como data-URL (funciona, pero no es ideal para producción).

## 3. Subir a GitHub

```bash
cd puertas-abiertas-neon
git init
git add .
git commit -m "Puertas Abiertas con Neon + Vercel"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/puertas-abiertas.git
git push -u origin main
```

## 4. Deploy en Vercel

1. Entra a [vercel.com](https://vercel.com) → **Add New Project** → importa el repo de GitHub.
2. **Environment Variables** (importante):
   - `DATABASE_URL` → pega la connection string de Neon
   - `JWT_SECRET` → genera uno (`openssl rand -base64 32`)
   - `BLOB_READ_WRITE_TOKEN` → (recomendado) el token de Vercel Blob
3. Deploy.

Vercel detectará las funciones en `/api` automáticamente.

## 5. Probar

1. Abre la URL de Vercel.
2. Regístrate con email + contraseña.
3. Publica una propiedad (sube fotos).
4. Verifica que aparezca en **Buscar** y en **Mis publicaciones**.

## Estructura

```
/
├── api/
│   ├── _lib/          # db, auth, cors
│   ├── auth/          # register, login, me
│   ├── casas/         # list, create, [id]
│   └── upload.js      # subida de imágenes
├── css/
├── js/
│   ├── api.js         # cliente frontend
│   ├── auth.js
│   ├── buscar.js
│   ├── mis-publicaciones.js
│   └── upload.js
├── index.html
├── login.html
├── buscar.html
├── upload.html
├── mis-publicaciones.html
├── schema.sql
├── package.json
└── .env.example
```

## Notas

- Cambia el número de WhatsApp intermediario en `js/config.js`.
- Las contraseñas se hashean con bcrypt.
- El token JWT dura 7 días (guardado en localStorage).
- Si usas Vercel Blob, las imágenes quedan en CDN público de Vercel.
- Límite de body en Vercel ≈ 4.5 MB → no subas fotos muy pesadas.

¡Listo para producción!
