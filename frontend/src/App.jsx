import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VaultSetup from './pages/VaultSetup';
import Dashboard from './pages/Dashboard';
import DocumentVault from './pages/DocumentVault';
import DocumentDetail from './pages/DocumentDetail';
import AIChat from './pages/AIChat';
import Reminders from './pages/Reminders';
import Profile from './pages/Profile';
import ShareView from './pages/ShareView';
import ResumeGenerator from './pages/ResumeGenerator';
import FormAutofill from './pages/FormAutofill';
import SharingManager from './pages/SharingManager';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import EmergencyMedical from './pages/EmergencyMedical';
import PublicEmergencyView from './pages/PublicEmergencyView';
import DigitalLifeTimeline from './pages/DigitalLifeTimeline';
import KnowledgeGraph from './pages/KnowledgeGraph';
import OpportunityHub from './pages/OpportunityHub';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/share/:token" element={<ShareView />} />
          <Route path="/shared/:token" element={<ShareView />} />
          <Route path="/emergency/view/:qrToken" element={<PublicEmergencyView />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/setup" element={<VaultSetup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vault" element={<DocumentVault />} />
            <Route path="/document/:id" element={<DocumentDetail />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/emergency" element={<EmergencyMedical />} />
            <Route path="/timeline" element={<DigitalLifeTimeline />} />
            <Route path="/graph" element={<KnowledgeGraph />} />
            <Route path="/opportunities" element={<OpportunityHub />} />
            <Route path="/resume" element={<ResumeGenerator />} />
            <Route path="/autofill" element={<FormAutofill />} />
            <Route path="/sharing" element={<SharingManager />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1E293B', color: '#F1F5F9', border: '1px solid #334155' },
          success: { iconTheme: { primary: '#22C55E', secondary: '#1E293B' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#1E293B' } },
        }}
      />
    </AuthProvider>
  );
}

export default App;
