import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LiveCCTV from "./pages/LiveCCTV";
import Report from "./pages/Report";
import Login from "./pages/Login";
import Register from "./pages/Register";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/live-cctv" element={<ProtectedRoute><LiveCCTV /></ProtectedRoute>} />
        <Route path="/laporan" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;