import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './FamilyApp';
import './bootstrap';

const container = document.getElementById('app');
createRoot(container).render(<App />);
