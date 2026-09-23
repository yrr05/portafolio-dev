// ============================================
// ATLAS — api.js | Rutas a los 5 JSON servers
// Cambia VITE_API_HOST en .env si el server
// está en otra IP (ej: 192.168.0.83)
// ============================================

const HOST = import.meta.env.VITE_API_HOST || '192.168.233.220';

const URL_USUARIOS   = `http://${HOST}:3001`;
const URL_RUTINAS    = `http://${HOST}:3002`;
const URL_EJERCICIOS = `http://${HOST}:3003`;
const URL_CLASES     = `http://${HOST}:3004`;
const URL_EVENTOS    = `http://${HOST}:3005`;

const json  = (res) => { if (!res.ok) throw new Error(res.statusText); return res.json(); };
const patch = (url, data) => fetch(url, { method: 'PATCH',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(json);
const post  = (url, data) => fetch(url, { method: 'POST',   headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(json);
const del   = (url)       => fetch(url, { method: 'DELETE' }).then(r => { if (!r.ok) throw new Error(r.statusText); });

// ─── GYMS ───────────────────────────────────
export const fetchGyms    = () => fetch(`${URL_USUARIOS}/gyms`).then(json);
export const fetchGymById = (id) => fetch(`${URL_USUARIOS}/gyms/${id}`).then(json);

// ─── USUARIOS ───────────────────────────────
export const fetchUsuarios           = () => fetch(`${URL_USUARIOS}/usuarios`).then(json);
export const fetchUsuarioById        = (id) => fetch(`${URL_USUARIOS}/usuarios/${id}`).then(json);
export const fetchUsuariosByGym      = (gymId) => fetch(`${URL_USUARIOS}/usuarios?gymId=${gymId}`).then(json);
export const actualizarUsuario       = (id, datos) => patch(`${URL_USUARIOS}/usuarios/${id}`, datos);
export const upgradeUsuarioPremium   = (id) => patch(`${URL_USUARIOS}/usuarios/${id}`, { premium: true });
export const downgradeUsuarioPremium = (id) => patch(`${URL_USUARIOS}/usuarios/${id}`, { premium: false });

export async function loginUsuario(email, password) {
  const usuarios = await fetchUsuarios();
  return usuarios.find(u => u.email === email && u.password === password) || null;
}

export async function registrarUsuario(nombre, apellidos, email, password, dni, iban) {
  const usuarios = await fetchUsuarios();
  if (usuarios.find(u => u.email === email)) return { error: 'El email ya está registrado.' };
  const nuevo = {
    id: `u${Date.now()}`, nombre, apellidos: apellidos || '', email, password,
    rol: 'cliente', gymId: null, premium: false, gymsInscritos: [],
    dni: (dni || '').toUpperCase(), iban: (iban || '').toUpperCase(),
  };
  return { user: await post(`${URL_USUARIOS}/usuarios`, nuevo) };
}

export async function matricularEnGym(userId, gymId) {
  const u = await fetchUsuarioById(userId);
  const gymsInscritos = u.gymsInscritos || [];
  if (gymsInscritos.includes(gymId)) return u;
  const nuevosGyms = [...gymsInscritos, gymId];
  return patch(`${URL_USUARIOS}/usuarios/${userId}`, {
    gymId: gymId,
    gymsInscritos: nuevosGyms,
  });
}

export async function cancelarMatricula(userId, gymId) {
  const u = await fetchUsuarioById(userId);
  const gymsInscritos = (u.gymsInscritos || []).filter(g => g !== gymId);
  const gymPrincipal  = gymsInscritos.length > 0 ? gymsInscritos[gymsInscritos.length - 1] : null;
  return patch(`${URL_USUARIOS}/usuarios/${userId}`, { gymId: gymPrincipal, gymsInscritos });
}

// ─── EJERCICIOS ─────────────────────────────
export const fetchEjercicios = () => fetch(`${URL_EJERCICIOS}/ejercicios`).then(json);

// ─── RUTINAS ────────────────────────────────
export const fetchRutinas     = () => fetch(`${URL_RUTINAS}/rutinas`).then(json);
export const fetchMisRutinas  = (userId) => fetch(`${URL_RUTINAS}/rutinas?userId=${userId}`).then(json);
export const actualizarRutina = (id, datos) => patch(`${URL_RUTINAS}/rutinas/${id}`, datos);
export const eliminarRutina   = (id) => del(`${URL_RUTINAS}/rutinas/${id}`);

export async function crearRutina(datos) {
  return post(`${URL_RUTINAS}/rutinas`, { id: `rt${Date.now()}`, ...datos, ejercicios: datos.ejercicios || [] });
}

// ─── CLASES ─────────────────────────────────
export const fetchClases     = () => fetch(`${URL_CLASES}/clases`).then(json);
export const fetchClaseById  = (id) => fetch(`${URL_CLASES}/clases/${id}`).then(json);
export const actualizarClase = (id, datos) => patch(`${URL_CLASES}/clases/${id}`, datos);
export const eliminarClase   = (id) => del(`${URL_CLASES}/clases/${id}`);

export async function crearClase(datos) {
  return post(`${URL_CLASES}/clases`, { id: `cl${Date.now()}`, ...datos, inscritos: [], fechaFin: null });
}

export async function inscribirseClase(claseId, userId) {
  const c = await fetchClaseById(claseId);
  if (c.inscritos.includes(userId)) return { error: 'Ya estás inscrito.' };
  if (c.inscritos.length >= c.plazas) return { error: 'No quedan plazas.' };
  return actualizarClase(claseId, { inscritos: [...c.inscritos, userId] });
}

export async function desinscribirseClase(claseId, userId) {
  const c = await fetchClaseById(claseId);
  return actualizarClase(claseId, { inscritos: c.inscritos.filter(id => id !== userId) });
}

// ─── EVENTOS ────────────────────────────────
export const fetchEventos     = () => fetch(`${URL_EVENTOS}/eventos`).then(json);
export const fetchEventoById  = (id) => fetch(`${URL_EVENTOS}/eventos/${id}`).then(json);
export const actualizarEvento = (id, datos) => patch(`${URL_EVENTOS}/eventos/${id}`, datos);
export const eliminarEvento   = (id) => del(`${URL_EVENTOS}/eventos/${id}`);

export async function crearEvento(datos) {
  return post(`${URL_EVENTOS}/eventos`, { id: `ev${Date.now()}`, ...datos, inscritos: [] });
}

export async function inscribirseEvento(eventoId, userId) {
  const e = await fetchEventoById(eventoId);
  if (e.inscritos.includes(userId)) return { error: 'Ya estás inscrito.' };
  if (!e.sinLimite && e.inscritos.length >= e.plazas) return { error: 'No quedan plazas.' };
  return actualizarEvento(eventoId, { inscritos: [...e.inscritos, userId] });
}

export async function desinscribirseEvento(eventoId, userId) {
  const e = await fetchEventoById(eventoId);
  return actualizarEvento(eventoId, { inscritos: e.inscritos.filter(id => id !== userId) });
}

// ─── VALIDACIONES ───────────────────────────
export const validarIBAN = (iban) => /^[A-Za-z]{2}\d{22}$/.test(iban.trim().replace(/\s/g, ''));
export const validarDNI  = (dni)  => /^[0-9XYZxyz]\d{7}[A-Za-z]$/.test(dni.trim());

// ─── SUPERADMIN ─────────────────────────────
export async function crearAdminGym(nombre, email, password, gymId) {
  const usuarios = await fetchUsuarios();
  if (usuarios.find(u => u.email === email)) return { error: 'El email ya está registrado.' };
  const nuevo = {
    id: `u${Date.now()}`, nombre, apellidos: '', email, password,
    rol: 'admin', gymId, premium: true,
    gymsInscritos: [gymId],
  };
  return { user: await post(`${URL_USUARIOS}/usuarios`, nuevo) };
}

export async function crearGym(nombre, ciudad) {
  return post(`${URL_USUARIOS}/gyms`, { id: `g${Date.now()}`, nombre, ciudad });
}

export const eliminarUsuario = (id) => del(`${URL_USUARIOS}/usuarios/${id}`);

// eliminarGym:
// 1. Manda el DELETE (json-server 0.17 puede devolver 500 aunque borre)
// 2. Espera y verifica que ya no existe
// 3. Limpia gymId y gymsInscritos de todos los usuarios afectados
export async function eliminarGym(id) {
  await fetch(`${URL_USUARIOS}/gyms/${id}`, { method: 'DELETE' });
  await new Promise(r => setTimeout(r, 400));
  const gymsRestantes = await fetchGyms();
  if (gymsRestantes.find(g => g.id === id)) {
    throw new Error('No se pudo eliminar el gimnasio');
  }
  const usuarios = await fetchUsuarios();
  const afectados = usuarios.filter(u =>
    u.gymId === id || (u.gymsInscritos || []).includes(id)
  );
  await Promise.all(afectados.map(u => {
    const nuevosGyms   = (u.gymsInscritos || []).filter(gid => gid !== id);
    const nuevoGymPpal = u.gymId === id
      ? (nuevosGyms.length > 0 ? nuevosGyms[nuevosGyms.length - 1] : null)
      : u.gymId;
    return patch(`${URL_USUARIOS}/usuarios/${u.id}`, {
      gymId:         nuevoGymPpal,
      gymsInscritos: nuevosGyms,
    });
  }));
}
