import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchClases, fetchGymById, fetchGyms,
  inscribirseClase, desinscribirseClase,
  crearClase, actualizarClase, eliminarClase,
} from '../services/api';
import './Clases.css';

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const FORM0 = { nombre:'', monitor:'', descripcion:'', duracion:60, plazas:20, dia:'', hora:'' };

const IconUser = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>;
const IconClock = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconCalendar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>;
const IconUsers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>;

export default function Clases() {
  const { user } = useAuth();
  const [clases,      setClases]      = useState([]);
  const [gymsMap,     setGymsMap]     = useState({}); // id → objeto gym
  const [gymActivo,   setGymActivo]   = useState(null); // id del gym seleccionado
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [formData,    setFormData]    = useState(FORM0);

  // Todos los gyms en los que está el usuario
  const misGymsIds = user.rol === 'admin'
    ? [user.gymId].filter(Boolean)
    : [...new Set([...(user.gymsInscritos || []), user.gymId].filter(Boolean))];

  useEffect(() => { loadClases(); }, []);

  const loadClases = async () => {
    try {
      const [data, gymsData] = await Promise.all([fetchClases(), fetchGyms()]);
      setClases(data);
      const map = {};
      gymsData.forEach(g => { map[g.id] = g; });
      setGymsMap(map);
      // Seleccionar el primer gym por defecto
      if (!gymActivo && misGymsIds.length > 0) setGymActivo(misGymsIds[0]);
    } catch { setError('Error al cargar clases'); }
    finally  { setLoading(false); }
  };

  const handleInscribir    = async (id) => { await inscribirseClase(id, user.id);    await loadClases(); };
  const handleDesinscribir = async (id) => { await desinscribirseClase(id, user.id); await loadClases(); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.monitor.trim()) { setError('Nombre y monitor son obligatorios'); return; }
    try {
      if (editingId) await actualizarClase(editingId, formData);
      else           await crearClase({ ...formData, gymId: user.gymId });
      resetForm(); await loadClases();
    } catch { setError('Error al guardar clase'); }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta clase?')) return;
    try { await eliminarClase(id); await loadClases(); }
    catch { setError('Error al eliminar'); }
  };

  const resetForm = () => { setFormData(FORM0); setEditingId(null); setShowForm(false); setError(''); };
  const openEdit  = (c) => {
    setEditingId(c.id);
    setFormData({ nombre:c.nombre, monitor:c.monitor, descripcion:c.descripcion||'', duracion:c.duracion, plazas:c.plazas, dia:c.dia||'', hora:c.hora||'' });
    setShowForm(true);
  };

  if (loading) return <div style={{ padding:60, textAlign:'center', color:'var(--muted)' }}>Cargando...</div>;

  if (misGymsIds.length === 0) return (
    <div className="no-gym-state">
      <div className="no-gym-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="64" height="64">
          <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
        </svg>
      </div>
      <h3>Sin gimnasio asignado</h3>
      <p>Para ver las clases debes estar matriculado en un gimnasio.</p>
      <Link to="/" className="btn-gold">Ir al inicio</Link>
    </div>
  );

  const gymSeleccionado  = gymsMap[gymActivo];
  const clasesDelGym     = clases.filter(c => c.gymId === gymActivo);
  const esAdminDeEsteGym = user.rol === 'admin' && user.gymId === gymActivo;

  return (
    <div className="clases-page">

      {/* CABECERA */}
      <div className="clases-header">
        <div>
          <h1 className="clases-title">Clases</h1>
          {gymSeleccionado && <p className="clases-sub">Clases disponibles en <strong>{gymSeleccionado.nombre}</strong> · {gymSeleccionado.ciudad}</p>}
        </div>
        {esAdminDeEsteGym && (
          <button className="btn-gold" onClick={() => setShowForm(true)}>+ Nueva clase</button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* SELECTOR DE GYM (solo si está en más de uno) */}
      {misGymsIds.length > 1 && (
        <div className="gym-selector">
          {misGymsIds.map(gid => (
            <button
              key={gid}
              className={`gym-sel-btn ${gymActivo === gid ? 'active' : ''}`}
              onClick={() => setGymActivo(gid)}
            >
              {gymsMap[gid]?.nombre || gid}
            </button>
          ))}
        </div>
      )}

      {/* ADMIN NOTICE */}
      {esAdminDeEsteGym && (
        <div className="admin-notice">
          <span className="admin-notice-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/>
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </span>
          Panel de administrador · {gymSeleccionado?.nombre}
        </div>
      )}

      {/* GRID CLASES */}
      {clasesDelGym.length === 0 ? (
        <div className="clases-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="56" height="56" style={{ color:'var(--muted)', margin:'0 auto 16px' }}>
            <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
          </svg>
          <p>No hay clases programadas en {gymSeleccionado?.nombre}.</p>
          {esAdminDeEsteGym && <button className="btn-gold" onClick={() => setShowForm(true)}>Crear primera clase</button>}
        </div>
      ) : (
        <div className="clases-grid">
          {clasesDelGym.map(c => {
            const libre    = c.plazas - c.inscritos.length;
            const inscrito = c.inscritos.includes(user.id);
            const lleno    = libre <= 0;
            return (
              <div key={c.id} className={`clase-card ${inscrito ? 'inscrito' : ''}`}>
                <div className="clase-card-top">
                  <h3 className="clase-nombre">{c.nombre}</h3>
                  <span className={`plaza-badge ${lleno ? 'lleno' : inscrito ? 'inscrito-badge' : 'libre'}`}>
                    {inscrito ? 'Inscrito' : lleno ? 'Sin plazas' : `${libre} libre${libre !== 1 ? 's' : ''}`}
                  </span>
                </div>
                <div className="clase-meta">
                  <span className="clase-meta-item"><IconUser />{c.monitor}</span>
                  {c.dia && <span className="clase-meta-item"><IconCalendar />{c.dia}{c.hora ? ` · ${c.hora}` : ''}</span>}
                  <span className="clase-meta-item"><IconClock />{c.duracion} min</span>
                  <span className="clase-meta-item"><IconUsers />{c.inscritos.length}/{c.plazas}</span>
                </div>
                {c.descripcion && <p className="clase-desc">{c.descripcion}</p>}
                <div className="clase-ocupacion">
                  <div className="clase-ocupacion-bar">
                    <div className="clase-ocupacion-fill" style={{ width:`${Math.min((c.inscritos.length/c.plazas)*100,100)}%`, background: lleno ? 'var(--danger)' : 'var(--gold-gradient)' }} />
                  </div>
                  <span className="clase-ocupacion-pct">{Math.round((c.inscritos.length/c.plazas)*100)}%</span>
                </div>
                <div className="clase-actions">
                  {inscrito ? (
                    <button className="btn-danger small" onClick={() => handleDesinscribir(c.id)}>Cancelar plaza</button>
                  ) : !lleno ? (
                    <button className="btn-reservar" onClick={() => handleInscribir(c.id)}>Reservar plaza</button>
                  ) : (
                    <button className="btn-ghost small" disabled>Sin plazas</button>
                  )}
                  {esAdminDeEsteGym && (
                    <div className="clase-admin-actions">
                      <button className="btn-icon-sm" title="Editar" onClick={() => openEdit(c)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button className="btn-icon-sm danger" title="Eliminar" onClick={() => handleEliminar(c.id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL FORM */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && resetForm()}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h2>{editingId ? 'Editar clase' : 'Nueva clase'}</h2>
              <button className="btn-icon" onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label>Nombre *</label>
                <input value={formData.nombre} onChange={e => setFormData({...formData, nombre:e.target.value})} placeholder="Ej: Spinning" />
              </div>
              <div className="form-group">
                <label>Monitor *</label>
                <input value={formData.monitor} onChange={e => setFormData({...formData, monitor:e.target.value})} placeholder="Nombre del monitor" />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea rows={2} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion:e.target.value})} placeholder="Descripción breve" />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Duración (min)</label>
                  <input type="number" min={15} step={5} value={formData.duracion} onChange={e => setFormData({...formData, duracion:+e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Plazas</label>
                  <input type="number" min={1} value={formData.plazas} onChange={e => setFormData({...formData, plazas:+e.target.value})} />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Día</label>
                  <select value={formData.dia} onChange={e => setFormData({...formData, dia:e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <input type="time" value={formData.hora} onChange={e => setFormData({...formData, hora:e.target.value})} />
                </div>
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="form-actions">
                <button type="submit" className="btn-gold">{editingId ? 'Guardar cambios' : 'Crear clase'}</button>
                <button type="button" className="btn-ghost" onClick={resetForm}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

