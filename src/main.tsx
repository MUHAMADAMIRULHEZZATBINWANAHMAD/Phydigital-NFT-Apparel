import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThirdwebProvider } from "thirdweb/react"; // <-- Import Provider
import App from './App'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* Just the plain provider */}
    <ThirdwebProvider>
      <App />
    </ThirdwebProvider>
  </React.StrictMode>,
)