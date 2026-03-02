import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UnitPreferencesProvider } from './context/UnitPreferencesContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DiveMap from './pages/DiveMap';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminDiveSites from './pages/AdminDiveSites';
import DiveSites from './pages/DiveSites';
import DiveSiteDetail from './pages/DiveSiteDetail';
import SavedLocations from './pages/SavedLocations';
import HowItWorks from './pages/HowItWorks';
import SafetyScoring from './pages/SafetyScoring';
import Faq from './pages/Faq';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Disclaimer from './pages/Disclaimer';
import { Shield } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center ocean-gradient-light">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
          <p className="text-abyss-500 text-sm font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RoleProtectedRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center ocean-gradient-light">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
          <p className="text-abyss-500 text-sm font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = user?.roles.some((r) => roles.includes(r)) ?? false;
  if (!hasRequiredRole) {
    return (
      <div className="flex-1 flex items-center justify-center ocean-gradient-light">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-coral-500" />
          </div>
          <h2 className="text-xl font-bold text-abyss-900">{t('admin.accessDenied')}</h2>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function NonAdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('Admin') ?? false;
  if (isAdmin) return <Navigate to="/map" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="safety-scoring" element={<SafetyScoring />} />
        <Route path="faq" element={<Faq />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="disclaimer" element={<Disclaimer />} />
        <Route
          path="map"
          element={
            <ProtectedRoute>
              <DiveMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="dive-sites"
          element={
            <ProtectedRoute>
              <DiveSites />
            </ProtectedRoute>
          }
        />
        <Route
          path="dive-sites/:id"
          element={
            <ProtectedRoute>
              <DiveSiteDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="saved-locations"
          element={
            <ProtectedRoute>
              <NonAdminRoute>
                <SavedLocations />
              </NonAdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <RoleProtectedRoute roles={["Admin"]}>
              <AdminUsers />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="admin/dive-sites"
          element={
            <RoleProtectedRoute roles={["Admin"]}>
              <AdminDiveSites />
            </RoleProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UnitPreferencesProvider>
          <AppRoutes />
        </UnitPreferencesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
