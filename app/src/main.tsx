import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/noto-sans-thai/400.css';
import '@fontsource/noto-sans-thai/600.css';
import '@fontsource/noto-sans-thai/700.css';
import './styles/tokens.css';
import './styles/app.css';
import App from './App';

createRoot(document.getElementById('root') as HTMLElement).render(<StrictMode><App store={window.localStorage} /></StrictMode>);
