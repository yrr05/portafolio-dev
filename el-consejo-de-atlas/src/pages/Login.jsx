import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario, registrarUsuario, validarDNI, validarIBAN } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('demo@atlas.com');
  const [loginPass,  setLoginPass]  = useState('demo123');
  const [loginError, setLoginError] = useState('');

  const [regNombre,   setRegNombre]   = useState('');
  const [regApellidos,setRegApellidos]= useState('');
  const [regEmail,    setRegEmail]    = useState('');
  const [regDNI,      setRegDNI]      = useState('');
  const [regIBAN,     setRegIBAN]     = useState('');
  const [regPass,     setRegPass]     = useState('');
  const [regPass2,    setRegPass2]    = useState('');
  const [regError,    setRegError]    = useState('');

  if (user) { navigate('/'); return null; }

  const handleLogin = async (e) => {
    e.preventDefault(); setLoginError('');
    if (!loginEmail.trim() || !loginPass.trim()) { setLoginError('Rellena todos los campos.'); return; }
    setLoading(true);
    try {
      const u = await loginUsuario(loginEmail.trim(), loginPass);
      if (!u) setLoginError('Credenciales incorrectas.');
      else { login(u); navigate(u.rol === 'superadmin' ? '/superadmin' : '/'); }
    } catch { setLoginError('Error al conectar con el servidor.'); }
    finally  { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setRegError('');
    if (!regNombre.trim() || !regEmail.trim() || !regDNI.trim() || !regIBAN.trim() || !regPass.trim()) {
      setRegError('Todos los campos son obligatorios.'); return;
    }
    if (!validarDNI(regDNI))  { setRegError('DNI/NIE inválido. Formato: 8 dígitos + letra (ej: 12345678Z).'); return; }
    if (!validarIBAN(regIBAN)){ setRegError('IBAN inválido. Debe empezar por 2 letras y seguir con 22 dígitos.'); return; }
    if (regPass.length < 6)   { setRegError('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (regPass !== regPass2) { setRegError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      const res = await registrarUsuario(regNombre.trim(), regApellidos.trim(), regEmail.trim(), regPass, regDNI, regIBAN);
      if (res.error) setRegError(res.error);
      else { login(res.user); navigate('/'); }
    } catch { setRegError('Error al registrar usuario.'); }
    finally  { setLoading(false); }
  };

  return (
    <div className="login-page">
      {/* Panel izquierdo — imagen/branding */}
      <div className="login-branding">
        <img src="/logoProyecto.jpg" alt="Atlas logo" className="login-brand-img" />
        <h2 className="login-brand-title">El Consejo de Atlas</h2>
        <p className="login-brand-sub">La plataforma de élite para gimnasios y entrenadores</p>
        <div className="login-brand-features">
          <div className="login-feature"><span className="lf-dot" />Gestión de clases y eventos</div>
          <div className="login-feature"><span className="lf-dot" />Rutinas personalizadas</div>
          <div className="login-feature"><span className="lf-dot" />Red de gimnasios premium</div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="login-form-panel">
        <div className="login-container">
          <div className="login-header">
            <span className="login-logo-text">ATLAS</span>
            <p className="login-tagline">Red de Gimnasios</p>
          </div>

          <div className="login-tabs">
            <button className={`tab ${activeTab === 'login'    ? 'active' : ''}`} onClick={() => setActiveTab('login')}>Acceso</button>
            <button className={`tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>Registro</button>
          </div>

          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="tu@email.com" disabled={loading} />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••••" disabled={loading} />
              </div>
              {loginError && <div className="error-message">{loginError}</div>}
              <button type="submit" className="btn-gold login-submit" disabled={loading}>
                {loading ? 'Conectando...' : 'Acceder'}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="login-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Nombre</label>
                  <input type="text" value={regNombre} onChange={e => setRegNombre(e.target.value)} placeholder="Tu nombre" disabled={loading} />
                </div>
                <div className="form-group">
                  <label>Apellidos</label>
                  <input type="text" value={regApellidos} onChange={e => setRegApellidos(e.target.value)} placeholder="Opcional" disabled={loading} />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="tu@email.com" disabled={loading} />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>DNI/NIE</label>
                  <input type="text" value={regDNI} onChange={e => setRegDNI(e.target.value.toUpperCase())} placeholder="12345678Z" disabled={loading} />
                </div>
                <div className="form-group">
                  <label>IBAN</label>
                  <input type="text" value={regIBAN} onChange={e => setRegIBAN(e.target.value.toUpperCase())} placeholder="ES00..." disabled={loading} />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Contraseña</label>
                  <input type="password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Mín. 6 car." disabled={loading} />
                </div>
                <div className="form-group">
                  <label>Repetir</label>
                  <input type="password" value={regPass2} onChange={e => setRegPass2(e.target.value)} placeholder="••••••" disabled={loading} />
                </div>
              </div>
              {regError && <div className="error-message">{regError}</div>}
              <button type="submit" className="btn-gold login-submit" disabled={loading}>
                {loading ? 'Registrando...' : 'Crear cuenta'}
              </button>
            </form>
          )}

          <div className="login-info">
            Demo: <strong>demo@atlas.com</strong> / <strong>demo123</strong>
            <br />Superadmin: <strong>atlas@atlas.com</strong> / <strong>atlas2026</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
