import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PermissaoProvider } from './context/PermissaoContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Funcionarios from './pages/Funcionarios';
import Dividas from './pages/Dividas';
import Obras from './pages/Obras';
import Caixa from './pages/Caixa';
import Receber from './pages/Receber';
import AutomacaoPdf from './pages/AutomacaoPdf';
import MinhaConta from './pages/MinhaConta';
import { MainLayout } from './components/MainLayout';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'sonner@2.0.3';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <PermissaoProvider>
        <Router>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/funcionarios" element={<Funcionarios />} />
                      <Route path="/dividas" element={<Dividas />} />
                      <Route path="/obras" element={<Obras />} />
                      <Route path="/caixa" element={<Caixa />} />
                      <Route path="/receber" element={<Receber />} />
                      <Route path="/automacao-pdf" element={<AutomacaoPdf />} />
                      <Route path="/minha-conta" element={<MinhaConta />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </PermissaoProvider>
    </AuthProvider>
  );
}
