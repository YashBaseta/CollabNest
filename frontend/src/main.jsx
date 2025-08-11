
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from "../src/context/AuthContext.jsx"
import SocketProvider from '../src/context/SocketProvider.jsx'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AuthProvider>
    <SocketProvider >
      <App />
    </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
  
)
