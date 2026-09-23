import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchEventos, fetchGyms, fetchGymById,
  crearEvento, eliminarEvento,
  inscribirseEvento, desinscribirseEvento,
} from '../services/api';
import './Eventos.css';

const FORM_VACIO = {
  nombre: '', descripcion: '', monitores: '',
  duracion: 60, fecha: '', plazas: 50, sinLimite: false,
};

export default function Eventos() {
  const { user } = useAuth();
  const [eventos,   setEventos]   = useState([]);
  const [gyms,      setGyms]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(FORM_VACIO);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [evData, gymsData] = await Promise.all([fetchEventos(), fetchGyms()]);
      setEventos(evData);
      setGyms(gymsData);
    } catch { setError('Error al cargar eventos'); }
    finally  { setLoading(false); }
  };

  const getGymNombre = (gymId) => gyms.find(g => g.id === gymId)?.nombre || 'Atlas';

  const handleInscribir = async (id) => {
    try {
      const res = await inscribirseEvento(id, user.id);
      if (res?.error) { setError(res.error); return; }
      await loadData();
    } catch { setError('Error al inscribirse'); }
  };

  const handleDesinscribir = async (id) => {
    try {
      await desinscribirseEvento(id, user.id);
      await loadData();
    } catch { setError('Error al desinscribirse'); }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este evento?')) return;
    try { await eliminarEvento(id); await loadData(); }
    catch { setError('Error al eliminar'); }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.fecha || !form.monitores.trim()) {
      setError('Nombre, monitores y fecha son obligatorios.'); return;
    }
    setSaving(true); setError('');
    try {
      const gymObj = gyms.find(g => g.id === user.gymId);
      await crearEvento({
        ...form,
        duracion: +form.duracion,
        plazas:   form.sinLimite ? 0 : +form.plazas,
        gymId:     user.gymId,
        gymNombre: gymObj?.nombre || '',
        creadoPor: user.id,
      });
      setForm(FORM_VACIO);
      setShowForm(false);
      await loadData();
    } catch { setError('Error al crear evento'); }
    finally   { setSaving(false); }
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Cargando...</div>;

  // Todos pueden ver todos los eventos
  const eventosOrdenados = [...eventos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  return (
    <div className="eventos-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Eventos</h1>
          <p className="page-subtitle">Actividades y competiciones de la red Atlas</p>
        </div>
        {user.rol === 'admin' && (
          <button className="btn-gold" onClick={() => setShowForm(true)}>Nuevo evento</button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* ── FORM CREAR (solo admin) ── */}
      {showForm && user.rol === 'admin' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h2>Nuevo evento</h2>
              <button className="btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleCrear}>
              <div className="form-group">
                <label>Nombre del evento *</label>
                <input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} placeholder="Ej: Maratón de Verano" />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea rows={3} value={form.descripcion} onChange={e => setForm(f => ({...f, descripcion: e.target.value}))} placeholder="Descripción del evento..." />
              </div>
              <div className="form-group">
                <label>Monitores / Ponentes *</label>
                <input value={form.monitores} onChange={e => setForm(f => ({...f, monitores: e.target.value}))} placeholder="Ej: Carlos Ruiz, Laura Vega" />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Fecha *</label>
                  <input type="date" value={form.fecha} onChange={e => setForm(f => ({...f, fecha: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Duración (min)</label>
                  <input type="number" min={15} value={form.duracion} onChange={e => setForm(f => ({...f, duracion: e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.sinLimite} onChange={e => setForm(f => ({...f, sinLimite: e.target.checked}))} />
                  Sin límite de plazas
                </label>
              </div>
              {!form.sinLimite && (
                <div className="form-group">
                  <label>Plazas disponibles</label>
                  <input type="number" min={1} value={form.plazas} onChange={e => setForm(f => ({...f, plazas: e.target.value}))} />
                </div>
              )}
              {error && <div className="error-message">{error}</div>}
              <div className="form-actions">
                <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Guardando...' : 'Crear evento'}</button>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LISTADO ── */}
      {eventosOrdenados.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-svg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48"><path d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/></svg></div>
          <p>No hay eventos disponibles.</p>
        </div>
      ) : (
        <div className="eventos-grid">
          {eventosOrdenados.map(e => {
            const libre    = e.sinLimite ? null : e.plazas - e.inscritos.length;
            const lleno    = !e.sinLimite && libre <= 0;
            const inscrito = e.inscritos.includes(user.id);
            const esAdmin  = user.rol === 'admin' && user.gymId === e.gymId;

            return (
              <div key={e.id} className="card evento-card">
                <div className="evento-gym-tag">{e.gymNombre || getGymNombre(e.gymId)}</div>

                <div className="evento-card-header">
                  <h3 className="evento-nombre">{e.nombre}</h3>
                  {!e.sinLimite && (
                    <span className={`plazas-badge ${lleno ? 'lleno' : 'disponible'}`}>
                      {lleno ? 'Sin plazas' : `${libre} plaza${libre !== 1 ? 's' : ''}`}
                    </span>
                  )}
                  {e.sinLimite && <span className="plazas-badge disponible">Plazas libres</span>}
                </div>

                <div className="evento-meta">
                  <span>{new Date(e.fecha).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })}</span>
                  {e.duracion > 0 && <span>{e.duracion} min</span>}
                </div>

                {e.monitores && (
                  <div className="evento-monitores">Monitores: <strong>{e.monitores}</strong></div>
                )}

                {e.descripcion && <div className="evento-desc">{e.descripcion}</div>}

                <div className="card-chips">
                  <span className="chip neutral">{e.inscritos.length} inscritos{!e.sinLimite ? `/${e.plazas}` : ''}</span>
                  {inscrito && <span className="chip green">Inscrito</span>}
                </div>

                <div className="evento-actions">
                  {inscrito ? (
                    <button className="btn-danger small" onClick={() => handleDesinscribir(e.id)}>Cancelar inscripción</button>
                  ) : !lleno ? (
                    <button className="btn-gold small" onClick={() => handleInscribir(e.id)}>Inscribirse</button>
                  ) : null}
                  {esAdmin && (
                    <button className="btn-danger small" onClick={() => handleEliminar(e.id)}>Eliminar</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
