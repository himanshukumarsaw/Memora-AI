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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shared/:token" element={<ShareView />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/setup" element={<VaultSetup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vault" element={<DocumentVault />} />
            <Route path="/document/:id" element={<DocumentDetail />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1C202D', color: '#EDF2FF', border: '1px solid #262B3A' },
          success: { iconTheme: { primary: '#3ECF8E', secondary: '#1C202D' } },
          error: { iconTheme: { primary: '#F56565', secondary: '#1C202D' } },
        }}
      />
    </AuthProvider>
  );
}

export default App;
