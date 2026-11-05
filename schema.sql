-- Schema para Neon (PostgreSQL)
-- Ejecuta esto en el SQL Editor de Neon Console después de crear el proyecto

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de casas / propiedades
CREATE TABLE IF NOT EXISTS casas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nombre_dueno TEXT,
  whatsapp TEXT,
  titulo TEXT NOT NULL,
  direccion TEXT,
  precio NUMERIC(12,2),
  habitaciones INTEGER,
  banos INTEGER,
  tipo TEXT DEFAULT 'casa',
  descripcion TEXT,
  imagenes TEXT[] DEFAULT '{}',
  latitud NUMERIC(10,7),
  longitud NUMERIC(10,7),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_casas_activo ON casas(activo);
CREATE INDEX IF NOT EXISTS idx_casas_user_id ON casas(user_id);
CREATE INDEX IF NOT EXISTS idx_casas_created_at ON casas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
