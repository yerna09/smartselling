import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Accounts from './pages/Accounts';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/accounts" element={<Accounts />} />
      {/* Otras rutas aquí si existen */}
    </Routes>
  </Router>
);

export default App;
