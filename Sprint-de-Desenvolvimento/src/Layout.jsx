import { NavLink } from 'react-router-dom'
import './Layout.css'

export default function Layout({ children }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">☕</div>
          <div>
            <div className="brand-name">CAFÉRIA</div>
            <div className="brand-tag">// sistema v1.0</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Módulos</div>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <span className="nav-icon">◈</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/clientes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">◉</span>
            <span>Clientes</span>
          </NavLink>
          <NavLink to="/pedidos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">◎</span>
            <span>Pedidos</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>API conectada</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-inner">
          {children}
        </div>
      </main>
    </div>
  )
}