import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Home from './pages/Home.jsx';
import Scan from './pages/Scan.jsx';
import History from './pages/History.jsx';
import About from './pages/About.jsx';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="w-full px-6 py-8 sm:px-10 lg:px-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}
