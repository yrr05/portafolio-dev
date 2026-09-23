import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchGyms, fetchGymById, fetchUsuarioById,
  matricularEnGym, cancelarMatricula,
  fetchClases, upgradeUsuarioPremium, downgradeUsuarioPremium, fetchUsuariosByGym,
} from '../services/api';
import './Home.css';

export default function Home() {
  const { user, updateUser } = useAuth();
  const [gyms,         setGyms]         = useState([]);
  const [misGyms,      setMisGyms]      = useState([]);   // objetos gym completos
  const [clases,       setClases]       = useState([]);
  const [usuariosGym,  setUsuariosGym]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [upgradingId,  setUpgradingId]  = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gymsData, clasesData] = await Promise.all([fetchGyms(), fetchClases()]);
      setGyms(gymsData);
      setClases(clasesData);

      // gyms en los que está inscrito
      const inscritosIds = user.gymsInscritos || (user.gymId ? [user.gymId] : []);
      const misGymsData  = gymsData.filter(g => inscritosIds.includes(g.id));
      setMisGyms(misGymsData);

      if (user.rol === 'admin' && user.gymId) {
        const us = await fetchUsuariosByGym(user.gymId);
        setUsuariosGym(us.filter(u => u.id !== user.id));
      }
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleMatricular = async (gymId) => {
    setError('');
    try {
      const updated = await matricularEnGym(user.id, gymId);
      updateUser(updated);
      await loadData();
    } catch { setError('Error al matricularse'); }
  };

  const handleCancelarMatricula = async (gymId) => {
    if (!confirm('¿Cancelar matrícula en este gimnasio?')) return;
    try {
      const updated = await cancelarMatricula(user.id, gymId);
      updateUser(updated);
      await loadData();
    } catch { setError('Error al cancelar matrícula'); }
  };

  const handleTogglePremium = async (targetUser) => {
    setUpgradingId(targetUser.id);
    try {
      if (targetUser.premium) await downgradeUsuarioPremium(targetUser.id);
      else                     await upgradeUsuarioPremium(targetUser.id);
      const us = await fetchUsuariosByGym(user.gymId);
      setUsuariosGym(us.filter(u => u.id !== user.id));
    } catch { setError('Error al cambiar plan'); }
    finally  { setUpgradingId(null); }
  };

  const handleUpgradeSelf   = async () => { try { updateUser(await upgradeUsuarioPremium(user.id));   } catch { setError('Error'); } };
  const handleDowngradeSelf = async () => { try { updateUser(await downgradeUsuarioPremium(user.id)); } catch { setError('Error'); } };

  const clasesActivas = clases.filter(c => c.inscritos?.includes(user.id));
  const gymsNoInscritos = gyms.filter(g => !(user.gymsInscritos || []).includes(g.id));

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Cargando...</div>;

  return (
    <div className="home-page">

      {/* ── HERO con logo de fondo ── */}
      <section className="hero-section">
        <div className="hero-logo-bg">
          <img src="/logoProyecto.jpg" alt="" />
        </div>
        <div className="hero-content">
          <p className="hero-eyebrow">PLATAFORMA FITNESS DE ÉLITE</p>
          <h1 className="hero-title">
            Desarrolla tu<br />
            <span className="hero-gold">máximo potencial</span>
          </h1>
          <p className="hero-sub">Entrenamiento, rutinas y eventos. Todo en un solo lugar.</p>
          <div className="hero-actions">
            <Link to="/rutinas" className="btn-gold">Explorar Rutinas</Link>
            <Link to="/clases"  className="btn-ghost">Ver Clases</Link>
          </div>
        </div>
      </section>

      {error && <div className="error-message" style={{ margin: '0 auto', maxWidth: 900 }}>{error}</div>}

      {/* ── CLASES RESERVADAS ── */}
      {clasesActivas.length > 0 && (
        <section className="section-wrap">
          <h2 className="section-title">Tus clases reservadas</h2>
          <div className="avisos-list">
            {clasesActivas.map(c => (
              <div key={c.id} className="aviso-clase">
                <span>Tienes reservada <strong>{c.nombre}</strong>{c.dia ? ` · ${c.dia}` : ''}{c.hora ? ` a las ${c.hora}` : ''}</span>
                <Link to="/clases" className="aviso-link">Ver clases</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MIS GIMNASIOS (cliente) ── */}
      {user.rol !== 'admin' && (
        <section className="section-wrap">
          <h2 className="section-title">Mis gimnasios</h2>

          {misGyms.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Aún no estás matriculado en ningún gimnasio.</p>
          ) : (
            <div className="gyms-grid">
              {misGyms.map(g => (
                <div key={g.id} className="gym-card enrolled">
                  <div className="gym-card-top">
                    <div className="gym-name">{g.nombre}</div>
                    <span className="gym-enrolled-badge">Matriculado</span>
                  </div>
                  <div className="gym-city">{g.ciudad}</div>
                  <div className="gym-card-actions">
                    <Link to="/clases"  className="btn-ghost small">Ver clases</Link>
                    <Link to="/eventos" className="btn-ghost small">Ver eventos</Link>
                    <button className="btn-danger small" onClick={() => handleCancelarMatricula(g.id)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {gymsNoInscritos.length > 0 && (
            <>
              <h3 className="section-sub-title" style={{ marginTop: 24 }}>Otros gimnasios disponibles</h3>
              <div className="gyms-grid">
                {gymsNoInscritos.map(g => (
                  <div key={g.id} className="gym-card">
                    <div className="gym-name">{g.nombre}</div>
                    <div className="gym-city">{g.ciudad}</div>
                    <button className="btn-gold" onClick={() => handleMatricular(g.id)}>
                      Matricularme
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* ── PANEL ADMIN ── */}
      {user.rol === 'admin' && user.gymId && (
        <section className="section-wrap admin-home-section">
          <div className="admin-gym-header">
            <div>
              <div className="admin-gym-name">{gyms.find(g => g.id === user.gymId)?.nombre}</div>
              <div className="admin-gym-sub">Panel de administrador · {gyms.find(g => g.id === user.gymId)?.ciudad}</div>
            </div>
            <div className="admin-gym-actions">
              <Link to="/clases"  className="btn-gold">Gestionar clases</Link>
              <Link to="/eventos" className="btn-blue">Gestionar eventos</Link>
            </div>
          </div>

          <div className="enrolled-panel">
            <div className="enrolled-header">
              <h3 className="enrolled-title">Usuarios matriculados</h3>
              <p className="enrolled-sub">{usuariosGym.length} usuario{usuariosGym.length !== 1 ? 's' : ''}</p>
            </div>
            {usuariosGym.length === 0 ? (
              <div className="enrolled-empty">Aún no hay usuarios matriculados.</div>
            ) : (
              <table className="enrolled-table">
                <thead>
                  <tr>
                    <th>Nombre</th><th>Email</th><th>DNI/NIE</th><th>Plan</th><th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosGym.map(u => (
                    <tr key={u.id}>
                      <td className="td-name">{u.nombre} {u.apellidos}</td>
                      <td className="td-muted">{u.email}</td>
                      <td className="td-muted">{u.dni || '—'}</td>
                      <td>
                        <span className={`plan-badge ${u.premium ? 'premium' : 'basic'}`}>
                          {u.premium ? 'Premium' : 'Básico'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={u.premium ? 'btn-danger small' : 'btn-upgrade small'}
                          onClick={() => handleTogglePremium(u)}
                          disabled={upgradingId === u.id}
                        >
                          {upgradingId === u.id ? '...' : u.premium ? 'Quitar Premium' : 'Upgrade Premium'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {/* ── PLAN (cliente) ── */}
      {user.rol !== 'admin' && (
        <section className="section-wrap">
          <div className="plan-card">
            <div className="plan-info">
              <div className="plan-label">Tu plan actual</div>
              <div className={`plan-name ${user.premium ? 'gold' : ''}`}>
                {user.premium ? 'Premium' : 'Básico'}
              </div>
              <p className="plan-desc">
                {user.premium
                  ? 'Tienes acceso a todas las funciones premium de Atlas.'
                  : 'Hazte Premium para desbloquear contenido exclusivo.'}
              </p>
            </div>
            <div className="plan-action">
              {user.premium
                ? <button className="btn-ghost" onClick={handleDowngradeSelf}>Cancelar Premium</button>
                : <button className="btn-gold"  onClick={handleUpgradeSelf}>Hacerme Premium</button>}
            </div>
          </div>
        </section>
      )}

      {/* ── MÓDULOS ── */}
      <section className="section-wrap">
        <h2 className="section-title">¿Qué quieres hacer?</h2>
        <div className="features-grid">
          <Link to="/rutinas" className="feature-card">
            <div className="feature-icon-svg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg></div>
            <h3 className="feature-title">Rutinas</h3>
            <p className="feature-desc">Planifica y gestiona tus entrenamientos con rutinas de la comunidad o las tuyas propias.</p>
            <span className="feature-link">Explorar rutinas</span>
          </Link>
          <Link to="/clases" className="feature-card">
            <div className="feature-icon-svg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg></div>
            <h3 className="feature-title">Clases</h3>
            <p className="feature-desc">Reserva tu plaza en clases colectivas de tu gimnasio fácilmente.</p>
            <span className="feature-link">Ver clases</span>
          </Link>
          <Link to="/eventos" className="feature-card">
            <div className="feature-icon-svg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/></svg></div>
            <h3 className="feature-title">Eventos</h3>
            <p className="feature-desc">Participa en actividades, competiciones y eventos de toda la red Atlas.</p>
            <span className="feature-link">Ver eventos</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
