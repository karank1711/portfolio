import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from '@/App.jsx';
import { PortfolioProvider } from '@/context/PortfolioContext.jsx';
import { ThemeProvider } from '@/context/ThemeContext.jsx';
import '@/styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <PortfolioProvider>
            <App />
          </PortfolioProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
