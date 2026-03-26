import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import { RouterProvider } from 'react-router-dom';
import { router } from "./routes/router.jsx";
import { AuthContextProvider } from './features/authentication/components/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
      
    </>
  </StrictMode>,
);
