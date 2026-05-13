import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getClientes, getPedidos } from '../services/api'

export default function Home() {
  const [stats, setStats] = useState({ clientes: 0, pedidos: 0, pendentes: 0, prontos: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [cRes, pRes] = await Promise.all([getClientes(), getPedidos()])
        const pedidos = pRes.data || []
        setStats({
          clientes: (cRes.data || []).length,
          pedidos: pedidos.length,
          pendentes: pedidos.filter(p => p.status === 'pendente').length,
          prontos: pedidos.filter(p => p.status === 'pronto').length,
        })
      } catch {
        // API may not be running in dev; show zeros
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Clientes cadastrados', value: stats.clientes, icon: '◉', link: '/clientes', color: 'var(--green)' },
    { label: 'Total de pedidos', value: stats.pedidos, icon: '◎', link: '/pedidos', color: 'var(--green)' },
    { label: 'Pedidos pendentes', value: stats.pendentes, icon: '◈', link: '/pedidos', color: 'var(--warning)' },
    { label: 'Prontos p/ entrega', value: stats.prontos, icon: '◍', link: '/pedidos', color: '#a0ff00' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">DASH<span>BOARD</span></h1>
          <p className="page-subtitle">// visão geral do sistema</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          carregando dados...
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {cards.map((card, i) => (
              <Link to={card.link} key={i} className="stat-card" style={{ '--accent': card.color }}>
                <div className="stat-icon">{card.icon}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
                <div className="stat-arrow">→</div>
              </Link>
            ))}
          </div>

          <div className="home-grid">
            <div className="card">
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '22px', color: 'var(--green)', marginBottom: '16px' }}>
                ACESSO RÁPIDO
              </h3>
              <div className="quick-links">
                <Link to="/clientes" className="quick-link">
                  <span>Gerenciar Clientes</span>
                  <span className="ql-arrow">→</span>
                </Link>
                <Link to="/pedidos" className="quick-link">
                  <span>Gerenciar Pedidos</span>
                  <span className="ql-arrow">→</span>
                </Link>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '22px', color: 'var(--green)', marginBottom: '16px' }}>
                FLUXO DE STATUS
              </h3>
              <div className="status-flow">
                {['pendente', 'em_preparo', 'pronto', 'entregue'].map((s, i, arr) => (
                  <div key={s} className="status-flow-item">
                    <span className={`badge badge-${s}`}>{s.replace('_', ' ')}</span>
                    {i < arr.length - 1 && <span className="flow-arrow">→</span>}
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}>
                // pedido cancelado pode ocorrer em qualquer etapa
              </p>
            </div>
          </div>
        </>
      )}

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 24px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
          display: block;
          border-top: 3px solid var(--accent);
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          border-color: var(--accent);
        }
        .stat-icon {
          font-size: 20px;
          color: var(--accent);
          margin-bottom: 12px;
          opacity: 0.8;
        }
        .stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 48px;
          color: var(--text);
          line-height: 1;
          margin-bottom: 4px;
        }
        .stat-label {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }
        .stat-arrow {
          position: absolute;
          bottom: 20px;
          right: 20px;
          color: var(--accent);
          font-size: 18px;
          opacity: 0;
          transition: opacity 0.2s, transform 0.2s;
        }
        .stat-card:hover .stat-arrow {
          opacity: 1;
          transform: translateX(4px);
        }
        .home-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 700px) { .home-grid { grid-template-columns: 1fr; } }
        .quick-links { display: flex; flex-direction: column; gap: 8px; }
        .quick-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          background: var(--black);
          border: 1px solid var(--border);
          color: var(--text);
          text-decoration: none;
          font-size: 14px;
          transition: all 0.2s;
        }
        .quick-link:hover {
          border-color: var(--green);
          color: var(--green);
        }
        .ql-arrow { color: var(--green); }
        .status-flow {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .status-flow-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .flow-arrow {
          color: var(--text-muted);
          font-size: 12px;
        }
      `}</style>
    </div>
  )
}