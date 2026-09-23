import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login      from './pages/Login';
import Home       from './pages/Home';
import Clases     from './pages/Clases';
import Eventos    from './pages/Eventos';
import Rutinas    from './pages/Rutinas';
import SuperAdmin from './pages/SuperAdmin';
import Navbar     from './components/Navbar';
import './App.css';

function Footer() {
  return (
    <footer style={{
      background: 'var(--dark)', borderTop: '1px solid var(--border)',
      padding: '16px 24px', textAlign: 'center',
      color: 'var(--muted)', fontSize: '0.82rem',
    }}>
      © {new Date().getFullYear()} <span style={{ color: 'var(--gold)', fontWeight: 700 }}>El Consejo de Atlas</span>
    </footer>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', color:'var(--gold)' }}>Cargando...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

function SuperAdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.rol !== 'superadmin') return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<><Login /><Footer /></>} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/"          element={<Home />} />
              <Route path="/clases"    element={<Clases />} />
              <Route path="/eventos"   element={<Eventos />} />
              <Route path="/rutinas"   element={<Rutinas />} />
              <Route path="/superadmin" element={
                <SuperAdminRoute><SuperAdmin /></SuperAdminRoute>
              } />
            </Routes>
          </div>
          <Footer />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
