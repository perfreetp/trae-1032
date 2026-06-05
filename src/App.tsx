import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Channel from './pages/Channel';
import Process from './pages/Process';
import Review from './pages/Review';
import Standards from './pages/Standards';
import Rectify from './pages/Rectify';
import Analysis from './pages/Analysis';
import Audit from './pages/Audit';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['service', 'reviewer', 'manager']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/channel"
            element={
              <ProtectedRoute allowedRoles={['service', 'manager']}>
                <Channel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/process"
            element={
              <ProtectedRoute allowedRoles={['service', 'manager']}>
                <Process />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review"
            element={
              <ProtectedRoute allowedRoles={['reviewer', 'manager']}>
                <Review />
              </ProtectedRoute>
            }
          />
          <Route
            path="/standards"
            element={
              <ProtectedRoute allowedRoles={['service', 'reviewer', 'manager']}>
                <Standards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rectify"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <Rectify />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <Analysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <Audit />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
