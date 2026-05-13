import { useState, useEffect, useCallback } from 'react'
import {
    getPedidos, getClientes, createPedido,
    updatePedidoStatus, deletePedido
} from '../services/Api.js'
import Toast from '../components/Toast.jsx'
import '../Pages.css'

const STATUS_LIST = ['pendente', 'em_preparo', 'pronto', 'entregue', 'cancelado']

const STATUS_LABELS = {
    pendente: 'Pendente',
    em_preparo: 'Em Preparo',
    pronto: 'Pronto',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
}

function NovoPedidoModal({ clientes, onSave, onClose }) {
    const [form, setForm] = useState({ cliente_id: '', descricao: '', total: '', status: 'pendente' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    function validate() {
        const e = {}
        if (!form.cliente_id) e.cliente_id = 'Selecione um cliente'
        if (!form.descricao.trim()) e.descricao = 'Descrição é obrigatória'
        if (!form.total || isNaN(Number(form.total)) || Number(form.total) <= 0)
            e.total = 'Valor inválido'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit() {
        if (!validate()) return
        setLoading(true)
        try {
            await createPedido({ ...form, total: parseFloat(form.total) })
            onSave('Pedido criado!')
        } catch (err) {
            setErrors({ api: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <span className="modal-title">NOVO PEDIDO</span>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="gap-16">
                    <div className="form-group">
                        <label className="form-label">Cliente *</label>
                        <select
                            className="select"
                            value={form.cliente_id}
                            onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
                        >
                            <option value="">— Selecione um cliente —</option>
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>{c.nome} ({c.email})</option>
                            ))}
                        </select>
                        {errors.cliente_id && <span style={{ color: 'var(--danger)', fontSize: '12px', fontFamily: 'Space Mono' }}>✕ {errors.cliente_id}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descrição do pedido *</label>
                        <input
                            className="input"
                            placeholder="Ex: 1x Café Expresso, 2x Pão de Queijo"
                            value={form.descricao}
                            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                        />
                        {errors.descricao && <span style={{ color: 'var(--danger)', fontSize: '12px', fontFamily: 'Space Mono' }}>✕ {errors.descricao}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Valor total (R$) *</label>
                        <input
                            className="input"
                            placeholder="Ex: 18.50"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.total}
                            onChange={(e) => setForm({ ...form, total: e.target.value })}
                        />
                        {errors.total && <span style={{ color: 'var(--danger)', fontSize: '12px', fontFamily: 'Space Mono' }}>✕ {errors.total}</span>}
                    </div>

                    {errors.api && (
                        <div style={{
                            padding: '12px 16px',
                            background: 'var(--danger-dim)',
                            border: '1px solid var(--danger)',
                            color: 'var(--danger)',
                            fontFamily: 'Space Mono',
                            fontSize: '12px',
                        }}>
                            ✕ {errors.api}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Pedido'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatusModal({ pedido, onSave, onClose }) {
    const [status, setStatus] = useState(pedido.status)
    const [loading, setLoading] = useState(false)

    async function handleSubmit() {
        setLoading(true)
        try {
            await updatePedidoStatus(pedido.id, status)
            onSave('Status atualizado!')
        } catch (err) {
            onClose()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <span className="modal-title">STATUS DO PEDIDO</span>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <p style={{ marginBottom: '20px', fontFamily: 'Space Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
          // pedido #{pedido.id}
                </p>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label">Novo status</label>
                    <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        {STATUS_LIST.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Salvando...' : 'Atualizar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function PedidosPage() {
    const [pedidos, setPedidos] = useState([])
    const [clientes, setClientes] = useState([])
    const [loading, setLoading] = useState(true)
    const [filtroStatus, setFiltroStatus] = useState('')
    const [modalNovo, setModalNovo] = useState(false)
    const [modalStatus, setModalStatus] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [toast, setToast] = useState(null)

    const addToast = (message, type = 'success') => setToast({ message, type })

    const fetchAll = useCallback(async () => {
        setLoading(true)
        try {
            const params = filtroStatus ? { status: filtroStatus } : {}
            const [pRes, cRes] = await Promise.all([getPedidos(params), getClientes()])
            setPedidos(pRes.data?.data || [])
            setClientes(cRes.data?.data || [])
        } catch (err) {
            addToast(err.message, 'error')
        } finally {
            setLoading(false)
        }
    }, [filtroStatus])

    useEffect(() => {
        fetchAll()
    }, [fetchAll])

    async function handleDelete(id) {
        try {
            await deletePedido(id)
            setConfirmDelete(null)
            addToast('Pedido removido.')
            fetchAll()
        } catch (err) {
            addToast(err.message, 'error')
        }
    }

    function handleSaved(msg) {
        setModalNovo(false)
        setModalStatus(null)
        addToast(msg)
        fetchAll()
    }

    function getNomeCliente(cliente_id) {
        const c = clientes.find(c => c.id == cliente_id)
        return c ? c.nome : `#${cliente_id}`
    }

    function formatCurrency(val) {
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    const contadores = STATUS_LIST.reduce((acc, s) => {
        acc[s] = pedidos.filter(p => p.status === s).length
        return acc
    }, {})

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">PEDI<span>DOS</span></h1>
                    <p className="page-subtitle">// {pedidos.length} pedidos {filtroStatus ? `com status "${filtroStatus}"` : 'no total'}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModalNovo(true)}>
                    + Novo Pedido
                </button>
            </div>

            {/* Status pills filter */}
            <div className="status-filter-bar">
                <button
                    className={`filter-pill ${filtroStatus === '' ? 'active' : ''}`}
                    onClick={() => setFiltroStatus('')}
                >
                    Todos
                    <span className="pill-count">{pedidos.length}</span>
                </button>
                {STATUS_LIST.map(s => (
                    <button
                        key={s}
                        className={`filter-pill ${filtroStatus === s ? 'active' : ''}`}
                        onClick={() => setFiltroStatus(s === filtroStatus ? '' : s)}
                    >
                        {STATUS_LABELS[s]}
                        <span className="pill-count">{contadores[s] || 0}</span>
                    </button>
                ))}
            </div>

            <div className="card" style={{ padding: 0 }}>
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        carregando pedidos...
                    </div>
                ) : pedidos.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">◎</div>
                        <p>{filtroStatus ? `Nenhum pedido com status "${filtroStatus}"` : 'Nenhum pedido cadastrado'}</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Descrição</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.map((p, index) => (
                                    <tr key={p.id} style={{ '--row-index': index }}>
                                        <td style={{ fontFamily: 'Space Mono', fontSize: '12px', color: 'var(--text-muted)' }}>#{p.id}</td>
                                        <td style={{ fontWeight: 500 }}>{getNomeCliente(p.cliente_id)}</td>
                                        <td style={{ color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {p.descricao}
                                        </td>
                                        <td style={{ fontFamily: 'Space Mono', fontSize: '13px', color: 'var(--green)', fontWeight: 700 }}>
                                            {formatCurrency(p.total)}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${p.status}`}>{STATUS_LABELS[p.status]}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => setModalStatus(p)}
                                                >
                                                    Status
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => setConfirmDelete(p)}
                                                >
                                                    Remover
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            {modalNovo && (
                <NovoPedidoModal
                    clientes={clientes}
                    onSave={handleSaved}
                    onClose={() => setModalNovo(false)}
                />
            )}

            {modalStatus && (
                <StatusModal
                    pedido={modalStatus}
                    onSave={handleSaved}
                    onClose={() => setModalStatus(null)}
                />
            )}

            {confirmDelete && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
                    <div className="modal" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <span className="modal-title" style={{ color: 'var(--danger)' }}>CONFIRMAR</span>
                            <button className="modal-close" onClick={() => setConfirmDelete(null)}>×</button>
                        </div>
                        <p style={{ marginBottom: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                            Remover pedido <strong style={{ color: 'var(--text)' }}>#{confirmDelete.id}</strong>? Esta ação não pode ser desfeita.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete.id)}>Remover</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="toast-container">
                {toast && (
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                )}
            </div>

            <style>{`
        .status-filter-bar {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .filter-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-pill:hover {
          border-color: var(--green);
          color: var(--text);
        }
        .filter-pill.active {
          background: var(--green);
          color: var(--black);
          border-color: var(--green);
          font-weight: 700;
        }
        .pill-count {
          background: rgba(0,0,0,0.2);
          border-radius: 999px;
          padding: 1px 7px;
          font-size: 10px;
        }
        .filter-pill.active .pill-count {
          background: rgba(0,0,0,0.25);
        }
      `}</style>
        </div>
    )
}