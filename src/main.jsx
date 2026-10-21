import React from 'react';
import { createRoot } from 'react-dom/client';
import PortfolioApp from './pages/PortfolioApp.jsx';
import AdminApp from './pages/AdminApp.jsx';
import './tailwind.css';
import './styles.css';
import './admin.css';
import './extra.css';

const isAdmin = window.location.pathname.startsWith('/admin-panel');
createRoot(document.getElementById('root')).render(isAdmin ? <AdminApp /> : <PortfolioApp />);
