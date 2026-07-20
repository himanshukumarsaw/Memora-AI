import { useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import UploadModal from '../modals/UploadModal';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading Memora AI...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopNavbar onUploadClick={() => setUploadOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Outlet context={{ openUpload: () => setUploadOpen(true) }} />
        </main>
      </div>
      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={() => window.location.reload()} />
    </div>
  );
};

export default ProtectedRoute;
