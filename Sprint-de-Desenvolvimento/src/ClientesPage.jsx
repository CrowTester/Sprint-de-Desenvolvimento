import { useState, useEffect, useCallback } from 'react'
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/api'
import Toast from '../components/Toast'

const EMPTY_FORM = { nome: '', email: '', telefone: '' }

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function ClienteModal({ cliente, onSave, onClose }) {
  const [form, setForm] = useState(cliente || EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const isEditing = !!cliente?.id

  function validate() {
    const e = {}
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório'
    if (!form.email.trim()) e.email = 'Email é obrigatório'
    else if (!validarEmail(form.email)) e.email = 'Email inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    try {
      if (isEditing) {
        await updateCliente(cliente.id, form)
      } else {
        await createCliente(form)
      }
      onSave(isEditing ? 'Cliente atualizado!' : 'Cliente cadastrado!')
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
          <span className="modal-title">{isEditing ? 'EDITAR CLIENTE' : 'NOVO CLIENTE'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="gap-16">
          <div className="form-group">
            <label className="form-label">Nome completo *</label>
            <input
              className="input"
              placeholder="Ex: João da Silva"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
            {errors.nome && <span style={{ color: 'var(--danger)', fontSize: '12px', fontFamily: 'Space Mono' }}>✕ {errors.nome}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              className="input"
              placeholder="Ex: joao@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              type="email"
            />
            {errors.email && <span style={{ color: 'var(--danger)', fontSize: '12px', fontFamily: 'Space Mono' }}>✕ {errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input
              className="input"
              placeholder="Ex: (48) 99999-9999"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
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
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'new' | cliente object
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [toast, setToast] = useState(null)
  const [busca, setBusca] = useState('')

  const addToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getClientes()
      setClientes(res.data || [])
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  async function handleDelete(id) {
    try {
      await deleteCliente(id)
      setConfirmDelete(null)
      addToast('Cliente removido.')
      fetchClientes()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  function handleSaved(msg) {
    setModal(null)
    addToast(msg)
    fetchClientes()
  }

  const filtrados = clientes.filter(c =>
    c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    c.email?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">CLIEN<span>TES</span></h1>
          <p className="page-subtitle">// {clientes.length} registros encontrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          + Novo Cliente
        </button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <input
          className="input"
          placeholder="🔍  Buscar por nome ou email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            carregando clientes...
          </div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">◉</div>
            <p>{busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'Space Mono', fontSize: '12px', color: 'var(--text-muted)' }}>#{c.id}</td>
                    <td style={{ fontWeight: 500 }}>{c.nome}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{c.email}</td>
                    <td style={{ fontFamily: 'Space Mono', fontSize: '13px' }}>{c.telefone || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setModal(c)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setConfirmDelete(c)}
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

      {/* Modal novo/editar */}
      {modal && (
        <ClienteModal
          cliente={modal === 'new' ? null : modal}
          onSave={handleSaved}
          onClose={() => setModal(null)}
        />
      )}

      {/* Modal confirmar exclusão */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: 'var(--danger)' }}>CONFIRMAR</span>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <p style={{ marginBottom: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
              Deseja remover o cliente <strong style={{ color: 'var(--text)' }}>{confirmDelete.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete.id)}>Remover</button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="toast-container">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  )
}