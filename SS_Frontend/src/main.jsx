import { StrictMode } from 'react'
import './index.css'
import App from './App.jsx'
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from './Context/StoreContext.jsx';
import { AuthProvider } from './Context/AuthContext.jsx';
import { GoogleOAuthProvider } from "@react-oauth/google";


ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
  <BrowserRouter>
  <AuthProvider>
  <StoreProvider>
    
  
  <App />
</StoreProvider>
</AuthProvider>
  </BrowserRouter>
  </GoogleOAuthProvider>
);
