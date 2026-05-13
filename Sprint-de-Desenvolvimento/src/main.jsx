import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ClientesPage from './pages/ClientesPage'
import PedidosPage from './pages/PedidosPage'
import './styles/global.css'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App