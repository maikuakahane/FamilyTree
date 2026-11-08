import { createRoot } from 'react-dom/client';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import database, { loadFromFile } from './database';
import App from './App.jsx';
import './index.css';

async function init() {
    try {
        await loadFromFile();
    } catch (e) {
        console.error('Failed to load from file, starting fresh:', e);
    }

    createRoot(document.getElementById('root')).render(
        <DatabaseProvider database={database}>
            <App />
        </DatabaseProvider>,
    );
}

init();