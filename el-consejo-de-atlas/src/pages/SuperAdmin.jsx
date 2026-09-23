import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchUsuarios, fetchGyms, fetchGymById,
  fetchClases, fetchEventos, fetchRutinas,
  actualizarUsuario, eliminarUsuario,
  crearAdminGym, crearGym, eliminarGym,
  actualizarClase, eliminarClase, crearClase,
  actualizarEvento, eliminarEvento, crearEvento,
  actualizarRutina, eliminarRutina,
  upgradeUsuarioPremium, downgradeUsuarioPremium,
} from '../services/api';
import './SuperAdmin.css';

const Icon = ({ path, size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width={size} height={size}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);
const ICONS = {
  users:   "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  gym:     "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z",
  class:   "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  event:   "M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0",
  routine: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z",
  edit:    "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10",
  trash:   "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
  plus:    "M12 4.5v15m7.5-7.5h-15",
  shield:  "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
};

const TABS = [
  { id: 'usuarios', label: 'Usuarios',  icon: 'users'   },
  { id: 'gyms',     label: 'Gimnasios', icon: 'gym'     },
  { id: 'clases',   label: 'Clases',    icon: 'class'   },
  { id: 'eventos',  label: 'Eventos',   icon: 'event'   },
  { id: 'rutinas',  label: 'Rutinas',   icon: 'routine' },
];

const ROL_COLORS = { superadmin: 'superadmin', admin: 'admin', cliente: 'cliente' };
const ROL_LABEL  = { superadmin: 'Superadmin', admin: 'Admin', cliente: 'Cliente' };

export default function SuperAdmin() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [tab,     setTab]     = useState('usuarios');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [toast,   setToast]   = useState('');

  const [usuarios, setUsuarios] = useState([]);
  const [gyms,     setGyms]     = useState([]);
  const [clases,   setClases]   = useState([]);
  const [eventos,  setEventos]  = useState([]);
  const [rutinas,  setRutinas]  = useState([]);

  const [modalAdmin,   setModalAdmin]   = useState(false);
  const [modalGym,     setModalGym]     = useState(false);
  const [modalClase,   setModalClase]   = useState(null);
  const [modalEvento,  setModalEvento]  = useState(null);
  const [modalDelUser, setModalDelUser] = useState(null);
  const [modalDelGym,  setModalDelGym]  = useState(null);

  const [fAdmin,  setFAdmin]  = useState({ nombre:'', email:'', password:'', gymId:'' });
  const [fGym,    setFGym]    = useState({ nombre:'', ciudad:'' });
  const [fClase,  setFClase]  = useState({});
  const [fEvento, setFEvento] = useState({});

  const [busqUsuarios, setBusqUsuarios] = useState('');
  const [busqClases,   setBusqClases]   = useState('');
  const [busqEventos,  setBusqEventos]  = useState('');
  const [busqRutinas,  setBusqRutinas]  = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [u, g, c, e, r] = await Promise.all([
        fetchUsuarios(), fetchGyms(), fetchClases(), fetchEventos(), fetchRutinas(),
      ]);
      setUsuarios(u); setGyms(g); setClases(c); setEventos(e); setRutinas(r);
    } catch { setError('Error al cargar datos'); }
    finally  { setLoading(false); }
  };

  const getGymNombre = (id) => gyms.find(g => g.id === id)?.nombre || '—';

  // USUARIOS
  const handleTogglePremium = async (u) => {
    try {
      if (u.premium) await downgradeUsuarioPremium(u.id);
      else           await upgradeUsuarioPremium(u.id);
      await loadAll(); showToast(`Plan actualizado para ${u.nombre}`);
    } catch { showToast('Error al actualizar'); }
  };

  const handleEliminarUsuario = async () => {
    try {
      await eliminarUsuario(modalDelUser.id);
      setModalDelUser(null); await loadAll(); showToast('Usuario eliminado');
    } catch { showToast('Error al eliminar'); }
  };

  const handleCrearAdmin = async () => {
    if (!fAdmin.nombre || !fAdmin.email || !fAdmin.password || !fAdmin.gymId) {
      showToast('Rellena todos los campos'); return;
    }
    const res = await crearAdminGym(fAdmin.nombre, fAdmin.email, fAdmin.password, fAdmin.gymId);
    if (res.error) { showToast(res.error); return; }
    setModalAdmin(false); setFAdmin({ nombre:'', email:'', password:'', gymId:'' });
    await loadAll(); showToast(`Admin "${fAdmin.nombre}" creado`);
  };

  // GYMS
  const handleCrearGym = async () => {
    if (!fGym.nombre || !fGym.ciudad) { showToast('Rellena nombre y ciudad'); return; }
    await crearGym(fGym.nombre, fGym.ciudad);
    setModalGym(false); setFGym({ nombre:'', ciudad:'' });
    await loadAll(); showToast(`Gimnasio "${fGym.nombre}" creado`);
  };

  const handleEliminarGym = async () => {
    const nombre = modalDelGym.nombre;
    try {
      await eliminarGym(modalDelGym.id);
      setModalDelGym(null);
      await loadAll();
      showToast(`Gimnasio "${nombre}" eliminado`);
      setTimeout(() => navigate('/superadmin'), 100);
    } catch {
      showToast('Error al eliminar el gimnasio');
    }
  };

  // CLASES
  const handleSaveClase = async () => {
    try {
      if (fClase.id) await actualizarClase(fClase.id, fClase);
      else           await crearClase({ ...fClase, gymId: fClase.gymId });
      setModalClase(null); await loadAll(); showToast('Clase guardada');
    } catch { showToast('Error al guardar clase'); }
  };
  const handleEliminarClase = async (id) => {
    if (!confirm('¿Eliminar esta clase?')) return;
    await eliminarClase(id); await loadAll(); showToast('Clase eliminada');
  };
  const openEditClase = (c) => { setFClase({...c}); setModalClase('edit'); };
  const openNewClase  = () => { setFClase({ nombre:'', monitor:'', descripcion:'', duracion:60, plazas:20, dia:'', hora:'', gymId: gyms[0]?.id || '' }); setModalClase('new'); };

  // EVENTOS
  const handleSaveEvento = async () => {
    try {
      if (fEvento.id) await actualizarEvento(fEvento.id, fEvento);
      else {
        const gym = gyms.find(g => g.id === fEvento.gymId);
        await crearEvento({ ...fEvento, gymNombre: gym?.nombre || 'Atlas', creadoPor: user.id, inscritos: [] });
      }
      setModalEvento(null); await loadAll(); showToast('Evento guardado');
    } catch { showToast('Error al guardar evento'); }
  };
  const handleEliminarEvento = async (id) => {
    if (!confirm('¿Eliminar este evento?')) return;
    await eliminarEvento(id); await loadAll(); showToast('Evento eliminado');
  };
  const openEditEvento = (e) => { setFEvento({...e}); setModalEvento('edit'); };
  const openNewEvento  = () => { setFEvento({ nombre:'', descripcion:'', monitores:'', duracion:60, fecha:'', plazas:50, sinLimite:false, gymId: gyms[0]?.id || '' }); setModalEvento('new'); };

  // RUTINAS
  const handleEliminarRutina = async (id) => {
    if (!confirm('¿Eliminar esta rutina?')) return;
    await eliminarRutina(id); await loadAll(); showToast('Rutina eliminada');
  };

  if (loading) return <div style={{ padding:80, textAlign:'center', color:'var(--gold)', fontSize:'1.1rem' }}>Cargando panel...</div>;

  const usuariosFiltrados = usuarios.filter(u => !busqUsuarios || `${u.nombre} ${u.apellidos} ${u.email}`.toLowerCase().includes(busqUsuarios.toLowerCase()));
  const clasesFiltradas   = clases.filter(c  => !busqClases   || c.nombre.toLowerCase().includes(busqClases.toLowerCase()));
  const eventosFiltrados  = eventos.filter(e => !busqEventos  || e.nombre.toLowerCase().includes(busqEventos.toLowerCase()));
  const rutinasFiltradas  = rutinas.filter(r => !busqRutinas  || `${r.nombre} ${r.creadoPor}`.toLowerCase().includes(busqRutinas.toLowerCase()));

  return (
    <div className="sa-page">

      {toast && <div className="sa-toast">{toast}</div>}

      <div className="sa-header">
        <div className="sa-header-left">
          <div className="sa-shield"><Icon path={ICONS.shield} size={22} /></div>
          <div>
            <h1 className="sa-title">Panel de Control</h1>
            <p className="sa-sub">Superadministrador · Red Atlas completa</p>
          </div>
        </div>
        <div className="sa-stats">
          <div className="sa-stat"><span className="sa-stat-num">{usuarios.filter(u=>u.rol==='cliente').length}</span><span className="sa-stat-label">Clientes</span></div>
          <div className="sa-stat"><span className="sa-stat-num">{usuarios.filter(u=>u.rol==='admin').length}</span><span className="sa-stat-label">Admins</span></div>
          <div className="sa-stat"><span className="sa-stat-num">{gyms.length}</span><span className="sa-stat-label">Gyms</span></div>
          <div className="sa-stat"><span className="sa-stat-num">{clases.length}</span><span className="sa-stat-label">Clases</span></div>
        </div>
      </div>

      {error && <div className="error-message" style={{ maxWidth:960, margin:'0 auto 16px' }}>{error}</div>}

      <div className="sa-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`sa-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <Icon path={ICONS[t.icon]} size={15} />
            {t.label}
            <span className="sa-tab-count">
              {t.id === 'usuarios' && usuarios.length}
              {t.id === 'gyms'     && gyms.length}
              {t.id === 'clases'   && clases.length}
              {t.id === 'eventos'  && eventos.length}
              {t.id === 'rutinas'  && rutinas.length}
            </span>
          </button>
        ))}
      </div>

      <div className="sa-content">

        {/* USUARIOS */}
        {tab === 'usuarios' && (
          <div>
            <div className="sa-section-header">
              <input className="sa-search" placeholder="Buscar por nombre o email..." value={busqUsuarios} onChange={e => setBusqUsuarios(e.target.value)} />
              <button className="btn-gold" onClick={() => setModalAdmin(true)}>
                <Icon path={ICONS.plus} size={14} /> Crear admin
              </button>
            </div>
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Gyms</th><th>Plan</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(u => (
                    <tr key={u.id} className={u.rol === 'superadmin' ? 'tr-super' : ''}>
                      <td className="td-name">
                        <div className="td-avatar" style={{ background: u.rol === 'superadmin' ? '#C9A84C' : u.rol === 'admin' ? '#3b82f6' : '#6b7280' }}>
                          {u.nombre[0].toUpperCase()}
                        </div>
                        <span>{u.nombre} {u.apellidos}</span>
                      </td>
                      <td className="td-muted">{u.email}</td>
                      <td><span className={`rol-badge ${ROL_COLORS[u.rol]}`}>{ROL_LABEL[u.rol]}</span></td>
                      <td>
                        {u.rol === 'superadmin' ? (
                          <span className="td-muted">—</span>
                        ) : (u.gymsInscritos && u.gymsInscritos.length > 0)
                          ? u.gymsInscritos.map(gid => (
                              <span key={gid} className="gym-chip" style={{ marginRight:4, display:'inline-block', marginBottom:2 }}>
                                {getGymNombre(gid)}
                              </span>
                            ))
                          : <span className="td-muted">—</span>
                        }
                      </td>
                      <td>
                        {u.rol !== 'superadmin' && (
                          <span className={`plan-badge ${u.premium ? 'premium' : 'basic'}`}>
                            {u.premium ? 'Premium' : 'Básico'}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="td-actions">
                          {u.rol !== 'superadmin' && (
                            <>
                              <button className="btn-icon-sm" title={u.premium ? 'Quitar Premium' : 'Dar Premium'} onClick={() => handleTogglePremium(u)}>
                                <Icon path="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" size={14} />
                              </button>
                              <button className="btn-icon-sm danger" title="Eliminar" onClick={() => setModalDelUser(u)}>
                                <Icon path={ICONS.trash} size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GYMS */}
        {tab === 'gyms' && (
          <div>
            <div className="sa-section-header">
              <h3 className="sa-section-title">Gimnasios de la red</h3>
              <button className="btn-gold" onClick={() => setModalGym(true)}>
                <Icon path={ICONS.plus} size={14} /> Nuevo gym
              </button>
            </div>
            <div className="sa-gyms-grid">
              {gyms.map(g => {
                const admins   = usuarios.filter(u => u.gymId === g.id && u.rol === 'admin');
                const clientes = usuarios.filter(u => (u.gymsInscritos || []).includes(g.id) && u.rol === 'cliente');
                return (
                  <div key={g.id} className="sa-gym-card">
                    <div className="sa-gym-top">
                      <div>
                        <div className="sa-gym-nombre">{g.nombre}</div>
                        <div className="sa-gym-ciudad">{g.ciudad}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span className="sa-gym-id">{g.id}</span>
                        <button className="btn-icon-sm danger" title="Eliminar gimnasio" onClick={() => setModalDelGym(g)}>
                          <Icon path={ICONS.trash} size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="sa-gym-stats">
                      <div className="sa-gym-stat"><span>{admins.length}</span> admin{admins.length !== 1 ? 's' : ''}</div>
                      <div className="sa-gym-stat"><span>{clientes.length}</span> cliente{clientes.length !== 1 ? 's' : ''}</div>
                      <div className="sa-gym-stat"><span>{clases.filter(c => c.gymId === g.id).length}</span> clases</div>
                    </div>
                    {admins.length > 0 && (
                      <div className="sa-gym-admins">
                        {admins.map(a => <span key={a.id} className="sa-gym-admin-chip">{a.nombre}</span>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CLASES */}
        {tab === 'clases' && (
          <div>
            <div className="sa-section-header">
              <input className="sa-search" placeholder="Buscar clase..." value={busqClases} onChange={e => setBusqClases(e.target.value)} />
              <button className="btn-gold" onClick={openNewClase}>
                <Icon path={ICONS.plus} size={14} /> Nueva clase
              </button>
            </div>
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr><th>Nombre</th><th>Gym</th><th>Monitor</th><th>Horario</th><th>Plazas</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {clasesFiltradas.map(c => (
                    <tr key={c.id}>
                      <td className="td-bold">{c.nombre}</td>
                      <td><span className="gym-chip">{getGymNombre(c.gymId)}</span></td>
                      <td className="td-muted">{c.monitor}</td>
                      <td className="td-muted">{c.dia || '—'}{c.hora ? ` · ${c.hora}` : ''}</td>
                      <td className="td-muted">{c.inscritos?.length || 0}/{c.plazas}</td>
                      <td>
                        <div className="td-actions">
                          <button className="btn-icon-sm" onClick={() => openEditClase(c)}><Icon path={ICONS.edit} size={14} /></button>
                          <button className="btn-icon-sm danger" onClick={() => handleEliminarClase(c.id)}><Icon path={ICONS.trash} size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EVENTOS */}
        {tab === 'eventos' && (
          <div>
            <div className="sa-section-header">
              <input className="sa-search" placeholder="Buscar evento..." value={busqEventos} onChange={e => setBusqEventos(e.target.value)} />
              <button className="btn-gold" onClick={openNewEvento}>
                <Icon path={ICONS.plus} size={14} /> Nuevo evento
              </button>
            </div>
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr><th>Nombre</th><th>Gym</th><th>Fecha</th><th>Monitores</th><th>Plazas</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {eventosFiltrados.map(e => (
                    <tr key={e.id}>
                      <td className="td-bold">{e.nombre}</td>
                      <td><span className="gym-chip">{e.gymNombre || getGymNombre(e.gymId)}</span></td>
                      <td className="td-muted">{new Date(e.fecha).toLocaleDateString('es-ES')}</td>
                      <td className="td-muted">{e.monitores || '—'}</td>
                      <td className="td-muted">{e.sinLimite ? 'Sin límite' : `${e.inscritos?.length || 0}/${e.plazas}`}</td>
                      <td>
                        <div className="td-actions">
                          <button className="btn-icon-sm" onClick={() => openEditEvento(e)}><Icon path={ICONS.edit} size={14} /></button>
                          <button className="btn-icon-sm danger" onClick={() => handleEliminarEvento(e.id)}><Icon path={ICONS.trash} size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RUTINAS */}
        {tab === 'rutinas' && (
          <div>
            <div className="sa-section-header">
              <input className="sa-search" placeholder="Buscar rutina o creador..." value={busqRutinas} onChange={e => setBusqRutinas(e.target.value)} />
            </div>
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr><th>Nombre</th><th>Creada por</th><th>Tipo</th><th>Ejercicios</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {rutinasFiltradas.map(r => (
                    <tr key={r.id}>
                      <td className="td-bold">{r.nombre}</td>
                      <td className="td-muted">{r.creadoPor}</td>
                      <td>
                        <span className={`tipo-badge ${r.tipo === 'comunidad' ? 'comunidad' : 'propia'}`}>
                          {r.tipo === 'comunidad' ? 'Comunidad' : 'Personal'}
                        </span>
                      </td>
                      <td className="td-muted">{r.ejercicios?.length || 0} ejercicios</td>
                      <td>
                        <div className="td-actions">
                          <button className="btn-icon-sm danger" onClick={() => handleEliminarRutina(r.id)}><Icon path={ICONS.trash} size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREAR ADMIN */}
      {modalAdmin && (
        <div className="modal-overlay" onClick={() => setModalAdmin(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h2>Crear administrador</h2>
              <button className="btn-icon" onClick={() => setModalAdmin(false)}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group"><label>Nombre completo *</label><input value={fAdmin.nombre} onChange={e => setFAdmin(f=>({...f,nombre:e.target.value}))} placeholder="Ej: Carlos Ruiz" /></div>
              <div className="form-group"><label>Email *</label><input type="email" value={fAdmin.email} onChange={e => setFAdmin(f=>({...f,email:e.target.value}))} placeholder="admin@gym.com" /></div>
              <div className="form-group"><label>Contraseña *</label><input type="password" value={fAdmin.password} onChange={e => setFAdmin(f=>({...f,password:e.target.value}))} placeholder="Mínimo 6 caracteres" /></div>
              <div className="form-group">
                <label>Gimnasio *</label>
                <select value={fAdmin.gymId} onChange={e => setFAdmin(f=>({...f,gymId:e.target.value}))}>
                  <option value="">Selecciona un gym...</option>
                  {gyms.map(g => <option key={g.id} value={g.id}>{g.nombre} — {g.ciudad}</option>)}
                </select>
              </div>
              <div className="form-actions">
                <button className="btn-gold" onClick={handleCrearAdmin}>Crear administrador</button>
                <button className="btn-ghost" onClick={() => setModalAdmin(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR GYM */}
      {modalGym && (
        <div className="modal-overlay" onClick={() => setModalGym(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h2>Nuevo gimnasio</h2>
              <button className="btn-icon" onClick={() => setModalGym(false)}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group"><label>Nombre *</label><input value={fGym.nombre} onChange={e => setFGym(f=>({...f,nombre:e.target.value}))} placeholder="Ej: FitZone" /></div>
              <div className="form-group"><label>Ciudad *</label><input value={fGym.ciudad} onChange={e => setFGym(f=>({...f,ciudad:e.target.value}))} placeholder="Ej: Valencia" /></div>
              <div className="form-actions">
                <button className="btn-gold" onClick={handleCrearGym}>Crear gimnasio</button>
                <button className="btn-ghost" onClick={() => setModalGym(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CLASE */}
      {modalClase && (
        <div className="modal-overlay" onClick={() => setModalClase(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h2>{modalClase === 'edit' ? 'Editar clase' : 'Nueva clase'}</h2>
              <button className="btn-icon" onClick={() => setModalClase(null)}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label>Gimnasio *</label>
                <select value={fClase.gymId||''} onChange={e => setFClase(f=>({...f,gymId:e.target.value}))}>
                  {gyms.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
              </div>
              {['nombre','monitor','descripcion'].map(field => (
                <div className="form-group" key={field}>
                  <label>{field.charAt(0).toUpperCase()+field.slice(1)}</label>
                  <input value={fClase[field]||''} onChange={e => setFClase(f=>({...f,[field]:e.target.value}))} />
                </div>
              ))}
              <div className="form-row-2">
                <div className="form-group"><label>Duración (min)</label><input type="number" value={fClase.duracion||60} onChange={e => setFClase(f=>({...f,duracion:+e.target.value}))} /></div>
                <div className="form-group"><label>Plazas</label><input type="number" value={fClase.plazas||20} onChange={e => setFClase(f=>({...f,plazas:+e.target.value}))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-group"><label>Día</label><input value={fClase.dia||''} onChange={e => setFClase(f=>({...f,dia:e.target.value}))} /></div>
                <div className="form-group"><label>Hora</label><input type="time" value={fClase.hora||''} onChange={e => setFClase(f=>({...f,hora:e.target.value}))} /></div>
              </div>
              <div className="form-actions">
                <button className="btn-gold" onClick={handleSaveClase}>Guardar</button>
                <button className="btn-ghost" onClick={() => setModalClase(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EVENTO */}
      {modalEvento && (
        <div className="modal-overlay" onClick={() => setModalEvento(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h2>{modalEvento === 'edit' ? 'Editar evento' : 'Nuevo evento'}</h2>
              <button className="btn-icon" onClick={() => setModalEvento(null)}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label>Gimnasio</label>
                <select value={fEvento.gymId||''} onChange={e => setFEvento(f=>({...f,gymId:e.target.value}))}>
                  <option value="">Red Atlas (sin gym específico)</option>
                  {gyms.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
              </div>
              {['nombre','descripcion','monitores'].map(field => (
                <div className="form-group" key={field}>
                  <label>{field.charAt(0).toUpperCase()+field.slice(1)}</label>
                  <input value={fEvento[field]||''} onChange={e => setFEvento(f=>({...f,[field]:e.target.value}))} />
                </div>
              ))}
              <div className="form-row-2">
                <div className="form-group"><label>Fecha</label><input type="date" value={fEvento.fecha||''} onChange={e => setFEvento(f=>({...f,fecha:e.target.value}))} /></div>
                <div className="form-group"><label>Duración (min)</label><input type="number" value={fEvento.duracion||60} onChange={e => setFEvento(f=>({...f,duracion:+e.target.value}))} /></div>
              </div>
              <div className="form-group">
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                  <input type="checkbox" checked={fEvento.sinLimite||false} onChange={e => setFEvento(f=>({...f,sinLimite:e.target.checked}))} />
                  Sin límite de plazas
                </label>
              </div>
              {!fEvento.sinLimite && (
                <div className="form-group"><label>Plazas</label><input type="number" value={fEvento.plazas||50} onChange={e => setFEvento(f=>({...f,plazas:+e.target.value}))} /></div>
              )}
              <div className="form-actions">
                <button className="btn-gold" onClick={handleSaveEvento}>Guardar</button>
                <button className="btn-ghost" onClick={() => setModalEvento(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR USUARIO */}
      {modalDelUser && (
        <div className="modal-overlay" onClick={() => setModalDelUser(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth:400 }}>
            <div className="modal-top">
              <h2>Eliminar usuario</h2>
              <button className="btn-icon" onClick={() => setModalDelUser(null)}>✕</button>
            </div>
            <p style={{ color:'var(--muted)', fontSize:'.9rem', marginBottom:8 }}>
              ¿Eliminar a <strong style={{ color:'var(--text)' }}>{modalDelUser.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="form-actions" style={{ marginTop:16 }}>
              <button className="btn-danger" onClick={handleEliminarUsuario}>Eliminar</button>
              <button className="btn-ghost" onClick={() => setModalDelUser(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR GYM */}
      {modalDelGym && (
        <div className="modal-overlay" onClick={() => setModalDelGym(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth:400 }}>
            <div className="modal-top">
              <h2>Eliminar gimnasio</h2>
              <button className="btn-icon" onClick={() => setModalDelGym(null)}>✕</button>
            </div>
            <p style={{ color:'var(--muted)', fontSize:'.9rem', marginBottom:8 }}>
              ¿Eliminar <strong style={{ color:'var(--text)' }}>{modalDelGym.nombre}</strong> ({modalDelGym.ciudad})?
            </p>
            <p style={{ color:'#f87171', fontSize:'.82rem', marginBottom:8 }}>
              Los usuarios y clases asociados no se eliminarán automáticamente.
            </p>
            <div className="form-actions" style={{ marginTop:16 }}>
              <button className="btn-danger" onClick={handleEliminarGym}>Eliminar</button>
              <button className="btn-ghost" onClick={() => setModalDelGym(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
