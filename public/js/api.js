// js/api.js - Cliente API para Neon + Vercel Serverless

const API_BASE = ''; // Mismo origen en Vercel

function getToken() {
  return localStorage.getItem('pa_token') || null;
}

function setToken(token) {
  if (token) localStorage.setItem('pa_token', token);
  else localStorage.removeItem('pa_token');
}

function getUser() {
  try {
    const raw = localStorage.getItem('pa_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setUser(user) {
  if (user) localStorage.setItem('pa_user', JSON.stringify(user));
  else localStorage.removeItem('pa_user');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(API_BASE + path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Auth
export async function register({ email, password, full_name }) {
  const data = await request('/api/auth/register', {
    method: 'POST',
    body: { email, password, full_name }
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function login({ email, password }) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function getMe() {
  if (!getToken()) return null;
  try {
    const data = await request('/api/auth/me');
    setUser(data.user);
    return data.user;
  } catch {
    setToken(null);
    setUser(null);
    return null;
  }
}

export function logout() {
  setToken(null);
  setUser(null);
}

export function isLoggedIn() {
  return !!getToken();
}

export function currentUser() {
  return getUser();
}

// Casas
export async function listCasas() {
  const data = await request('/api/casas');
  return data.casas || [];
}

export async function listMisCasas() {
  const data = await request('/api/casas?mine=1');
  return data.casas || [];
}

export async function createCasa(casaData) {
  const data = await request('/api/casas', {
    method: 'POST',
    body: casaData
  });
  return data.casa;
}

export async function deleteCasa(id) {
  return request(`/api/casas/${id}`, { method: 'DELETE' });
}

export async function toggleActivoCasa(id, activo) {
  return request(`/api/casas/${id}`, {
    method: 'PUT',
    body: { activo }
  });
}

// Upload imagen (base64)
export async function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(',')[1];
        const data = await request('/api/upload', {
          method: 'POST',
          body: {
            filename: file.name,
            contentType: file.type || 'image/jpeg',
            data: base64
          }
        });
        resolve(data.url);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error('Error leyendo archivo'));
    reader.readAsDataURL(file);
  });
}

// Exponer globalmente para scripts clásicos
window.PA = {
  register,
  login,
  getMe,
  logout,
  isLoggedIn,
  currentUser,
  listCasas,
  listMisCasas,
  createCasa,
  deleteCasa,
  toggleActivoCasa,
  uploadImage,
  getToken,
  setToken,
  getUser,
  setUser
};
