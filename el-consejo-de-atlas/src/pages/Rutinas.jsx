import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchRutinas, fetchMisRutinas, crearRutina, actualizarRutina, eliminarRutina,
  fetchEjercicios,
} from '../services/api';
import './Rutinas.css';

// Límites según rol
const LIMITES = {
  cliente_basic:   { rutinas: 6,  ejercicios: 8  },
  cliente_premium: { rutinas: 20, ejercicios: 15 },
  admin:           { rutinas: 10, ejercicios: 10 },
};

function getLimites(user) {
  if (user.rol === 'admin') return LIMITES.admin;
  return user.premium ? LIMITES.cliente_premium : LIMITES.cliente_basic;
}

/* ── TIMER ── */
function RestTimer({ seconds, onDone }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { onDone(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const pct = ((seconds - left) / seconds) * 100;
  return (
    <div className="timer-wrap">
      <svg className="timer-ring" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" className="timer-track" />
        <circle cx="50" cy="50" r="44" className="timer-fill"
          strokeDasharray={`${2 * Math.PI * 44}`}
          strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`} />
      </svg>
      <div className="timer-label">
        <span className="timer-num">{left}</span>
        <span className="timer-sub">seg</span>
      </div>
      <button className="btn-ghost timer-skip" onClick={onDone}>Saltar descanso</button>
    </div>
  );
}

/* ── SESIÓN ACTIVA ── */
function SesionModal({ rutina, onClose }) {
  const ejercicios = rutina.ejercicios || [];
  const [ejIdx,    setEjIdx]    = useState(0);
  const [serieIdx, setSerieIdx] = useState(0);
  const [resting,  setResting]  = useState(false);
  const [done,     setDone]     = useState(false);
  const ej = ejercicios[ejIdx];
  if (!ej) return null;

  const handleSerieDone = () => {
    const hasMoreSeries = serieIdx + 1 < ej.series;
    const hasMoreEj     = ejIdx + 1 < ejercicios.length;
    if (hasMoreSeries || hasMoreEj) setResting(true);
    else setDone(true);
  };

  const handleRestDone = () => {
    setResting(false);
    if (serieIdx + 1 < ej.series) {
      setSerieIdx(s => s + 1);
    } else if (ejIdx + 1 < ejercicios.length) {
      setEjIdx(i => i + 1); setSerieIdx(0);
    } else {
      setDone(true);
    }
  };

  if (done) return (
    <div className="modal-overlay">
      <div className="modal-content sesion-done">
        <div className="sesion-trophy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56"><path d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/></svg>
        </div>
        <h2>Rutina completada</h2>
        <p className="done-sub">Gran trabajo. Descansa y vuelve mañana más fuerte.</p>
        <button className="btn-gold" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content sesion-modal">
        <div className="sesion-header">
          <span className="sesion-rutina-name">{rutina.nombre}</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="sesion-progress-bar">
          {ejercicios.map((e, i) => (
            <div key={i} className={`sesion-prog-seg ${i < ejIdx ? 'done' : i === ejIdx ? 'active' : ''}`} />
          ))}
        </div>
        <p className="sesion-prog-label">Ejercicio {ejIdx + 1} de {ejercicios.length}</p>
        {resting ? (
          <>
            <p className="sesion-rest-title">Descanso</p>
            <RestTimer seconds={ej.descanso || 60} onDone={handleRestDone} />
          </>
        ) : (
          <>
            <h2 className="sesion-ej-name">{ej.nombre}</h2>
            <div className="sesion-ej-meta">
              <div className="sesion-meta-item">
                <span className="meta-val">{serieIdx + 1}</span>
                <span className="meta-key">/ {ej.series} series</span>
              </div>
              <div className="sesion-meta-sep" />
              <div className="sesion-meta-item">
                <span className="meta-val">{ej.reps}</span>
                <span className="meta-key">reps</span>
              </div>
              <div className="sesion-meta-sep" />
              <div className="sesion-meta-item">
                <span className="meta-val">{ej.peso}</span>
                <span className="meta-key">kg</span>
              </div>
            </div>
            <button className="btn-gold sesion-btn" onClick={handleSerieDone}>
              Serie {serieIdx + 1} completada
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const TIPOS_EJ = ['Barra','Mancuernas','Calistenia','Máquina','Cardio'];
const GRUPOS_EJ = ['Pecho','Espalda','Hombros','Bíceps','Tríceps','Piernas','Core','Full Body'];

/* ── FORM CREAR/EDITAR ── */
function RutinaForm({ rutina, user, catalogoEjercicios, onSave, onClose, onAddEjercicio }) {
  const limites = getLimites(user);
  const [nombre,      setNombre]      = useState(rutina?.nombre || '');
  const [descripcion, setDescripcion] = useState(rutina?.descripcion || '');
  const [ejercicios,  setEjercicios]  = useState(rutina?.ejercicios?.length ? rutina.ejercicios : []);
  const [busqueda,    setBusqueda]    = useState('');
  const [tab,         setTab]         = useState('catalogo');
  const [error,       setError]       = useState('');

  // Crear ejercicio nuevo
  const [showNuevoEj,   setShowNuevoEj]   = useState(false);
  const [nuevoEjNombre, setNuevoEjNombre] = useState('');
  const [nuevoEjTipo,   setNuevoEjTipo]   = useState('Calistenia');
  const [nuevoEjGrupo,  setNuevoEjGrupo]  = useState('Full Body');
  const [nuevoEjError,  setNuevoEjError]  = useState('');

  const catalogo = catalogoEjercicios.filter(e =>
    !busqueda || e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const addDesdeCalogo = (ej) => {
    if (ejercicios.length >= limites.ejercicios) return;
    setEjercicios(es => [...es, {
      ejId: ej.id, nombre: ej.nombre, tipo: ej.tipo,
      grupoMuscular: ej.grupoMuscular,
      series: 3, reps: 10, peso: 0, descanso: 60,
    }]);
  };

  const handleCrearEjercicio = async () => {
    if (!nuevoEjNombre.trim()) { setNuevoEjError('El nombre es obligatorio'); return; }
    setNuevoEjError('');
    const nuevo = {
      id: `ej${Date.now()}`,
      nombre: nuevoEjNombre.trim(),
      tipo: nuevoEjTipo,
      grupoMuscular: nuevoEjGrupo,
    };
    await onAddEjercicio(nuevo);
    addDesdeCalogo(nuevo);
    setNuevoEjNombre(''); setShowNuevoEj(false);
  };

  const updateEj = (i, field, val) =>
    setEjercicios(es => es.map((e, idx) => idx === i ? { ...e, [field]: val } : e));

  const removeEj = (i) => setEjercicios(es => es.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return; }
    if (ejercicios.length === 0) { setError('Añade al menos un ejercicio'); return; }
    setError('');
    await onSave({ nombre, descripcion, ejercicios });
  };

  const grupos = [...new Set(catalogoEjercicios.map(e => e.grupoMuscular))];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content form-modal wide-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-top">
          <h2>{rutina ? 'Editar rutina' : 'Nueva rutina'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Nombre *</label>
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Full body lunes" />
        </div>
        <div className="form-group">
          <label>Descripción</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción opcional" rows={2} />
        </div>

        {/* TABS */}
        <div className="rutinas-tabs" style={{ marginBottom: 12 }}>
          <button className={`rtab ${tab === 'catalogo' ? 'active' : ''}`} onClick={() => setTab('catalogo')}>
            Catálogo de ejercicios
          </button>
          <button className={`rtab ${tab === 'ejercicios' ? 'active' : ''}`} onClick={() => setTab('ejercicios')}>
            Mi rutina ({ejercicios.length}/{limites.ejercicios})
          </button>
        </div>

        {/* CATÁLOGO */}
        {tab === 'catalogo' && (
          <div>
            <div className="catalogo-search-row">
              <input className="search-ej-input" placeholder="Buscar ejercicio..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              <button className="btn-ghost small" onClick={() => setShowNuevoEj(v => !v)}>
                {showNuevoEj ? 'Cancelar' : '+ Nuevo'}
              </button>
            </div>

            {/* FORM NUEVO EJERCICIO */}
            {showNuevoEj && (
              <div className="nuevo-ej-form">
                <div className="nuevo-ej-form-title">Crear ejercicio personalizado</div>
                <div className="form-group">
                  <label>Nombre del ejercicio *</label>
                  <input value={nuevoEjNombre} onChange={e => setNuevoEjNombre(e.target.value)} placeholder="Ej: Hip Thrust, Face Pull..." autoFocus />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Tipo de material</label>
                    <select value={nuevoEjTipo} onChange={e => setNuevoEjTipo(e.target.value)}>
                      {TIPOS_EJ.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Grupo muscular</label>
                    <select value={nuevoEjGrupo} onChange={e => setNuevoEjGrupo(e.target.value)}>
                      {GRUPOS_EJ.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                {nuevoEjError && <div className="error-message">{nuevoEjError}</div>}
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn-gold small" onClick={handleCrearEjercicio}>Crear y añadir a rutina</button>
                  <button className="btn-ghost small" onClick={() => { setShowNuevoEj(false); setNuevoEjNombre(''); setNuevoEjError(''); }}>Cancelar</button>
                </div>
              </div>
            )}

            <div className="catalogo-list">
              {grupos.map(grupo => {
                const ejsGrupo = catalogo.filter(e => e.grupoMuscular === grupo);
                if (ejsGrupo.length === 0) return null;
                return (
                  <div key={grupo}>
                    <div className="catalogo-grupo">{grupo}</div>
                    {ejsGrupo.map(ej => {
                      const yaAnado = ejercicios.some(e => e.ejId === ej.id);
                      return (
                        <div key={ej.id} className={`catalogo-item ${yaAnado ? 'added' : ''}`}>
                          <div>
                            <span className="catalogo-nombre">{ej.nombre}</span>
                            <span className="catalogo-tipo">{ej.tipo}</span>
                          </div>
                          <button
                            className={yaAnado ? 'btn-ghost small' : 'btn-gold small'}
                            onClick={() => addDesdeCalogo(ej)}
                            disabled={yaAnado || ejercicios.length >= limites.ejercicios}
                          >
                            {yaAnado ? 'Añadido' : '+'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EJERCICIOS DE LA RUTINA */}
        {tab === 'ejercicios' && (
          <div className="ej-list">
            {ejercicios.length === 0 ? (
              <div className="ej-empty">Añade ejercicios desde el catálogo</div>
            ) : ejercicios.map((ej, i) => (
              <div key={i} className="ej-row">
                <div className="ej-row-header">
                  <span className="ej-num">#{i + 1} {ej.nombre}</span>
                  <button className="btn-icon danger" onClick={() => removeEj(i)}>✕</button>
                </div>
                <div className="ej-meta-grid">
                  {[['series','Series',1,20],['reps','Reps',1,100],['peso','Kg',0,500],['descanso','Descanso (seg)',0,600]].map(([field, label, min, max]) => (
                    <div className="form-group" key={field}>
                      <label>{label}</label>
                      <input type="number" min={min} max={max} value={ej[field]}
                        onChange={e => updateEj(i, field, +e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="form-actions">
          <button className="btn-gold" onClick={handleSubmit}>{rutina ? 'Guardar' : 'Crear rutina'}</button>
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ── CARD ── */
function RutinaCard({ rutina, onPlay, onEdit, onDelete, isOwner, esComunidad }) {
  const [expanded, setExpanded] = useState(false);
  const ejercicios = rutina.ejercicios || [];
  return (
    <div className="rutina-card">
      <div className="rutina-card-top">
        <div>
          <h3 className="rutina-nombre">{rutina.nombre}</h3>
          <p className="rutina-creador">por {rutina.creadoPor}</p>
        </div>
        <div className="rutina-card-actions">
          {isOwner && !esComunidad && (
            <>
              <button className="btn-icon" title="Editar" onClick={() => onEdit(rutina)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button className="btn-icon danger" title="Eliminar" onClick={() => onDelete(rutina.id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </>
          )}
          <button className="btn-play" title="Iniciar" onClick={() => onPlay(rutina)}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
      </div>
      {rutina.descripcion && <p className="rutina-desc">{rutina.descripcion}</p>}
      {ejercicios.length > 0 && (
        <>
          <button className="rutina-toggle" onClick={() => setExpanded(e => !e)}>
            {expanded ? 'Ocultar ejercicios' : `Ver ${ejercicios.length} ejercicio${ejercicios.length !== 1 ? 's' : ''}`}
          </button>
          {expanded && (
            <div className="rutina-ej-list">
              {ejercicios.map((ej, i) => (
                <div key={i} className="rutina-ej-item">
                  <span className="ej-item-name">{ej.nombre}</span>
                  <span className="ej-item-meta">{ej.series}x{ej.reps} · {ej.peso}kg · {ej.descanso}s</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── PÁGINA ── */
export default function Rutinas() {
  const { user } = useAuth();
  const [tab,            setTab]          = useState('comunidad');
  const [comunidad,      setComunidad]    = useState([]);
  const [misRutinas,     setMisRutinas]   = useState([]);
  const [catalogo,       setCatalogo]     = useState([]);
  const [loading,        setLoading]      = useState(true);
  const [error,          setError]        = useState('');
  const [sesionRutina,   setSesionRutina] = useState(null);
  const [formRutina,     setFormRutina]   = useState(null);
  const [showForm,       setShowForm]     = useState(false);

  const limites  = getLimites(user);
  const maxRut   = limites.rutinas;

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [todas, mis, cats] = await Promise.all([
        fetchRutinas(),
        fetchMisRutinas(user.id),
        fetchEjercicios(),
      ]);
      // Comunidad = SOLO las de tipo 'comunidad' (creadas por admins), nunca las propias de otros clientes
      setComunidad(todas.filter(r => r.tipo === 'comunidad'));
      // Mis rutinas = las propias del usuario, que no sean de comunidad
      setMisRutinas(mis.filter(r => r.tipo !== 'comunidad'));
      setCatalogo(cats);
    } catch { setError('Error al cargar rutinas'); }
    finally  { setLoading(false); }
  };

  const handleSave = async (datos) => {
    try {
      if (formRutina && formRutina !== 'new') {
        await actualizarRutina(formRutina.id, datos);
      } else {
        if (misRutinas.length >= maxRut) {
          setError(`Límite de ${maxRut} rutinas alcanzado.`); return;
        }
        await crearRutina({ ...datos, userId: user.id, creadoPor: user.nombre, tipo: 'propia' });
      }
      setShowForm(false); setFormRutina(null);
      await loadAll();
    } catch { setError('Error al guardar la rutina'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta rutina?')) return;
    try { await eliminarRutina(id); await loadAll(); }
    catch { setError('Error al eliminar'); }
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Cargando...</div>;

  return (
    <div className="rutinas-page">
      <h1 className="page-title">Rutinas</h1>
      <p className="page-subtitle">Entrena con rutinas de la comunidad o crea las tuyas</p>
      {error && <div className="error-message">{error}</div>}

      <div className="rutinas-tabs">
        <button className={`rtab ${tab === 'comunidad' ? 'active' : ''}`} onClick={() => setTab('comunidad')}>
          Comunidad
        </button>
        <button className={`rtab ${tab === 'mis' ? 'active' : ''}`} onClick={() => setTab('mis')}>
          Mis rutinas
          {misRutinas.length > 0 && <span className="rtab-badge">{misRutinas.length}</span>}
        </button>
      </div>

      {tab === 'comunidad' && (
        comunidad.length === 0
          ? <div className="empty-state"><p>Aún no hay rutinas en la comunidad.</p></div>
          : <div className="rutinas-grid">
              {comunidad.map(r => (
                <RutinaCard key={r.id} rutina={r} onPlay={setSesionRutina}
                  onEdit={r2 => { setFormRutina(r2); setShowForm(true); }}
                  onDelete={handleDelete}
                  isOwner={r.userId === user.id}
                  esComunidad={r.tipo === 'comunidad'} />
              ))}
            </div>
      )}

      {tab === 'mis' && (
        <>
          <div className="mis-header">
            <span className="mis-count">
              {misRutinas.length}/{maxRut} rutinas
              {!user.premium && user.rol !== 'admin' && (
                <span className="mis-premium-hint"> · <span className="gold-text">Premium</span> para más</span>
              )}
            </span>
            <button className="btn-gold" onClick={() => { setFormRutina('new'); setShowForm(true); }}
              disabled={misRutinas.length >= maxRut}>
              + Nueva rutina
            </button>
          </div>
          {misRutinas.length === 0
            ? <div className="empty-state"><p>Crea tu primera rutina personalizada.</p></div>
            : <div className="rutinas-grid">
                {misRutinas.map(r => (
                  <RutinaCard key={r.id} rutina={r} onPlay={setSesionRutina}
                    onEdit={r2 => { setFormRutina(r2); setShowForm(true); }}
                    onDelete={handleDelete} isOwner esComunidad={false} />
                ))}
              </div>
          }
        </>
      )}

      {sesionRutina && <SesionModal rutina={sesionRutina} onClose={() => setSesionRutina(null)} />}
      {showForm && (
        <RutinaForm
          rutina={formRutina !== 'new' ? formRutina : null}
          user={user}
          catalogoEjercicios={catalogo}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setFormRutina(null); }}
          onAddEjercicio={async (nuevoEj) => {
            try {
              const res = await fetch(`http://${import.meta.env.VITE_API_HOST || 'localhost'}:3003/ejercicios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoEj),
              });
              if (res.ok) {
                const cats = await (await fetch(`http://${import.meta.env.VITE_API_HOST || 'localhost'}:3003/ejercicios`)).json();
                setCatalogo(cats);
              }
            } catch { console.error('Error al crear ejercicio'); }
          }}
        />
      )}
    </div>
  );
}
