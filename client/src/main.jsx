import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')).render(
  <>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#14111c",
          color: "#e5e7eb",
          border: "1px solid rgba(255,255,255,0.08)",
        },
      }}
    />
    <App />
  </>
)
