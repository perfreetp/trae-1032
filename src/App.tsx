import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Channel from './pages/Channel';
import Process from './pages/Process';
import Review from './pages/Review';
import Standards from './pages/Standards';
import Rectify from './pages/Rectify';
import Analysis from './pages/Analysis';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/channel" element={<Channel />} />
          <Route path="/process" element={<Process />} />
          <Route path="/review" element={<Review />} />
          <Route path="/standards" element={<Standards />} />
          <Route path="/rectify" element={<Rectify />} />
          <Route path="/analysis" element={<Analysis />} />
        </Routes>
      </Layout>
    </Router>
  );
}
