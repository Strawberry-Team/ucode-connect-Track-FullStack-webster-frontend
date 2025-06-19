
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { UserProvider } from './context/user-context'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <UserProvider>
    <App />
  </UserProvider>
)
