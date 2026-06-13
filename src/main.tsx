import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { RestaurantProvider } from './data/store.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RestaurantProvider>
      <App />
    </RestaurantProvider>
  </StrictMode>,
);
