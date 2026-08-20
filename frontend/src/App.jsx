import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

import LandingPage          from './pages/LandingPage';
import LoginPage            from './pages/LoginPage';
import RegisterPage         from './pages/RegisterPage';
import DashboardPage        from './pages/DashboardPage';
import ProfilePage          from './pages/ProfilePage';
import AcademicPage         from './pages/AcademicPage';
import PlacementPage        from './pages/PlacementPage';
import SkillsPage           from './pages/SkillsPage';
import WhatIfPage           from './pages/WhatIfPage';
import CareerPage           from './pages/CareerPage';
import CareerGapPage        from './pages/CareerGapPage';
import RoadmapPage          from './pages/RoadmapPage';
import EvolutionPage        from './pages/EvolutionPage';
import XAIPage              from './pages/XAIPage';
import RecommendationsPage  from './pages/RecommendationsPage';


// Authenticated pages wrap children in the sidebar layout
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes (require login) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><DashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout><ProfilePage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/academic" element={
            <ProtectedRoute>
              <AppLayout><AcademicPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/placement" element={
            <ProtectedRoute>
              <AppLayout><PlacementPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/skills" element={
            <ProtectedRoute>
              <AppLayout><SkillsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/whatif" element={
            <ProtectedRoute>
              <AppLayout><WhatIfPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/career" element={
            <ProtectedRoute>
              <AppLayout><CareerPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/career-gap" element={
            <ProtectedRoute>
              <AppLayout><CareerGapPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/roadmap" element={
            <ProtectedRoute>
              <AppLayout><RoadmapPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/evolution" element={
            <ProtectedRoute>
              <AppLayout><EvolutionPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/xai" element={
            <ProtectedRoute>
              <AppLayout><XAIPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/recommendations" element={
            <ProtectedRoute>
              <AppLayout><RecommendationsPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
