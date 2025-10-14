//import React from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import TextbookPage from './pages/TextbookPage';

function App() {
  return (
    <Router >
    <Routes>
    <Route path="/" element={<LoginPage/>}/>
    <Route path="/textbooks" element={<TextbookPage/>}/>
    <Route path="*" element={<Navigate to="/" replace />}/>
    </Routes>
    </Router>
  );
}

export default App;
