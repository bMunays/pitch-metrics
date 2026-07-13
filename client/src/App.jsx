import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewMatch from './pages/NewMatch';
import LiveMatch from './pages/LiveMatch';
import MatchAnalytics from './pages/MatchAnalytics'; // <-- IMPORT THE NEW PAGE

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1 bg-light">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/new-match" element={<NewMatch />} />
              <Route path="/live-match/:id" element={<LiveMatch />} />
              
              {/* Add the Analytics Route */}
              <Route path="/analytics/:id" element={<MatchAnalytics />} />
              
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;