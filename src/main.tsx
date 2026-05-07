import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RecordsProvider } from './context/RecordsContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RecordsProvider>
        <App />
      </RecordsProvider>
    </ErrorBoundary>
  </StrictMode>,
);
