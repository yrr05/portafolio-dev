import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchGymById } from '../services/api';
import './Navbar.css';

const AVATAR_COLORS = [
  '#C9A84C','#2E86AB','#A23B72','#F18F01','#C73E1D',
  '#3B1F2B','#44BBA4','#E94F37','#393E41','#6B4226',
];
const getAvatarColor = (nombre = '') => AVATAR_COLORS[nombre.charCodeAt(0) % AVATAR_COLORS.length];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const [gymNombre,  setGymNombre]  = useState('');
  const dropRef = useRef(null);

  useEffect(() => {
    if (user?.gymId) fetchGymById(user.gymId).then(g => setGymNombre(g.nombre)).catch(() => {});
  }, [user?.gymId]);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  const avatarColor = getAvatarColor(user?.nombre);
  const initiales   = `${user?.nombre?.[0] || ''}${user?.apellidos?.[0] || ''}`.toUpperCase();
  const isSuperAdmin = user?.rol === 'superadmin';

  const planLabel = isSuperAdmin ? 'Superadmin' : user?.rol === 'admin' ? 'Admin' : user?.premium ? 'Premium' : 'Básico';
  const planClass = isSuperAdmin ? 'superadmin' : user?.rol === 'admin' ? 'admin' : user?.premium ? 'premium' : 'basic';

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="logo">ATLAS</Link>

        <div className="nav-links">
          {!isSuperAdmin && (
            <>
              <Link to="/"        className={`nav-link ${isActive('/')        ? 'active' : ''}`}>Inicio</Link>
              <Link to="/rutinas" className={`nav-link ${isActive('/rutinas') ? 'active' : ''}`}>Rutinas</Link>
              <Link to="/clases"  className={`nav-link ${isActive('/clases')  ? 'active' : ''}`}>Clases</Link>
              <Link to="/eventos" className={`nav-link ${isActive('/eventos') ? 'active' : ''}`}>Eventos</Link>
            </>
          )}
          {isSuperAdmin && (
            <Link to="/superadmin" className={`nav-link ${isActive('/superadmin') ? 'active' : ''}`}>
              Panel de Control
            </Link>
          )}
        </div>

        <div className="nav-user-zone" ref={dropRef}>
          <button
            className={`nav-avatar-btn ${isSuperAdmin ? 'super' : ''}`}
            onClick={() => setDropOpen(o => !o)}
            style={{ background: isSuperAdmin ? 'linear-gradient(135deg, #C9A84C, #e2b96a)' : avatarColor }}
            title={user?.nombre}
          >
            {isSuperAdmin
              ? <svg viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
              : initiales
            }
          </button>

          {dropOpen && (
            <div className="nav-dropdown">
              <div className="drop-header">
                <div className="drop-avatar" style={{ background: isSuperAdmin ? 'linear-gradient(135deg,#C9A84C,#e2b96a)' : avatarColor }}>
                  {isSuperAdmin
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
                    : initiales
                  }
                </div>
                <div className="drop-info">
                  <div className="drop-name">{user?.nombre} {user?.apellidos}</div>
                  <div className="drop-email">{user?.email}</div>
                  <span className={`drop-plan ${planClass}`}>{planLabel}</span>
                </div>
              </div>

              <div className="drop-divider" />

              {!isSuperAdmin && (
                <>
                  <div className="drop-section-title">Información</div>
                  {user?.dni  && <div className="drop-row"><span>DNI/NIE</span><span>{user.dni}</span></div>}
                  {user?.iban && <div className="drop-row"><span>IBAN</span><span className="drop-iban">{user.iban}</span></div>}
                  {gymNombre  && (
                    <>
                      <div className="drop-divider" />
                      <div className="drop-section-title">Gimnasio actual</div>
                      <div className="drop-row"><span>{gymNombre}</span></div>
                    </>
                  )}
                  <div className="drop-divider" />
                </>
              )}

              {isSuperAdmin && (
                <>
                  <Link to="/superadmin" className="drop-panel-link" onClick={() => setDropOpen(false)}>
                    Ir al Panel de Control
                  </Link>
                  <div className="drop-divider" />
                </>
              )}

              <button className="drop-logout" onClick={handleLogout}>Cerrar sesión</button>
            </div>
          )}
        </div>

        <button className="hamburger" onClick={() => setMobileOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </div>

      {mobileOpen && (
        <div className="nav-mobile">
          {!isSuperAdmin && (
            <>
              <Link to="/"        onClick={() => setMobileOpen(false)}>Inicio</Link>
              <Link to="/rutinas" onClick={() => setMobileOpen(false)}>Rutinas</Link>
              <Link to="/clases"  onClick={() => setMobileOpen(false)}>Clases</Link>
              <Link to="/eventos" onClick={() => setMobileOpen(false)}>Eventos</Link>
            </>
          )}
          {isSuperAdmin && (
            <Link to="/superadmin" onClick={() => setMobileOpen(false)}>Panel de Control</Link>
          )}
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      )}
    </nav>
  );
}
