import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Landing    from "./pages/Landing";
import Register   from "./pages/Register";
import Login      from "./pages/Login";
import Dashboard  from "./pages/Dashboard";
import MenuEditor from "./pages/MenuEditor";

// Protected route: redirect στο /login αν δεν υπάρχει owner
function ProtectedRoute({ children }) {
  const { owner, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span className="spinner" style={{ width:32, height:32 }} />
    </div>
  );
  return owner ? children : <Navigate to="/login" replace />;
}

// Public route: αν είσαι ήδη logged in, πήγαινε στο dashboard
function PublicRoute({ children }) {
  const { owner, loading } = useAuth();
  if (loading) return null;
  return owner ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    // basename: /admin/ — αντιστοιχεί στο S3 path
    <BrowserRouter basename={import.meta.env.PROD ? "/admin" : "/"}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/register" element={
            <PublicRoute><Register /></PublicRoute>
          } />

          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          <Route path="/menu-editor" element={
            <ProtectedRoute><MenuEditor /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
