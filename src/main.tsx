import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import './index.css';
import './lib/i18n';
import App from './App.tsx';
import { queryClient } from './lib/query-client';
import { apiReady } from './lib/axios';

const root = createRoot(document.getElementById('root')!);

apiReady.then(() => {
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}).catch((err) => {
  console.error('API config load failed:', err);
  root.render(
    <StrictMode>
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        Yapılandırma yüklenemedi. config.json veya VITE_API_URL kontrol edin.
      </div>
    </StrictMode>,
  );
});
