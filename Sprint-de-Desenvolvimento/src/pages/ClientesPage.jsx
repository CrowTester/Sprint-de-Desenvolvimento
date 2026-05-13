import { useState, useEffect, useCallback } from "react";
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../services/Api.js";
import Toast from "../components/Toast.jsx";
import "../Pages.css";

const EMPTY_FORM = { nome: "", email: "", telefone: "" };

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function ClienteModal({ cliente, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!cliente?.id;

  // FIX: sincroniza quando cliente muda
  useEffect(() => {
    setForm(cliente || EMPTY_FORM);
  }, [cliente]);

  function validate() {
    const e = {};

    if (!form.nome?.trim()) e.nome = "Nome é obrigatório";
    if (!form.email?.trim()) e.email = "Email é obrigatório";
    else if (!validarEmail(form.email)) e.email = "Email inválido";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await updateCliente(cliente.id, form);
      } else {
        await createCliente(form);
      }

      onSave(isEditing ? "Cliente atualizado!" : "Cliente cadastrado!");
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEditing ? "Editar Cliente" : "Novo Cliente"}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="gap-16">
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input
              className="input"
              placeholder="Nome do cliente"
              value={form.nome}
              onChange={(e) =>
                setForm({ ...form, nome: e.target.value })
              }
            />
            {errors.nome && <span style={{ color: "var(--danger)", fontSize: "12px", fontFamily: "Space Mono" }}>✕ {errors.nome}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              className="input"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
            {errors.email && <span style={{ color: "var(--danger)", fontSize: "12px", fontFamily: "Space Mono" }}>✕ {errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input
              className="input"
              placeholder="(11) 99999-9999"
              value={form.telefone}
              onChange={(e) =>
                setForm({ ...form, telefone: e.target.value })
              }
            />
          </div>

          {errors.api && <div className="error-message">{errors.api}</div>}

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [busca, setBusca] = useState("");

  const addToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getClientes();
      setClientes(res.data?.data ?? []);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  async function handleDelete(id) {
    try {
      await deleteCliente(id);
      setConfirmDelete(null);
      addToast("Cliente removido");
      fetchClientes();
    } catch (err) {
      addToast(err.message, "error");
    }
  }

  function handleSaved(msg) {
    setModal(null);
    addToast(msg);
    fetchClientes();
  }

  const filtrados = clientes.filter((c) => {
    const nome = c.nome ?? "";
    const email = c.email ?? "";

    return (
      nome.toLowerCase().includes(busca.toLowerCase()) ||
      email.toLowerCase().includes(busca.toLowerCase())
    );
  });

  return (
    <div>
      <div className="clientes-header">
        <h1>👥 Clientes</h1>
        <button className="btn btn-primary" onClick={() => setModal("new")}>
          ➕ Novo Cliente
        </button>
      </div>

      <div className="search-container">
        <input
          className="input"
          placeholder="🔍 Buscar por nome ou email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-state">Carregando clientes...</div>
      ) : filtrados.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="items-container">
          {filtrados.map((c) => (
            <div key={c.id} className="cliente-item">
              <div className="cliente-info">
                <p><strong>Nome:</strong> {c.nome}</p>
                <p><strong>Email:</strong> {c.email}</p>
                {c.telefone && <p><strong>Telefone:</strong> {c.telefone}</p>}
              </div>
              <div className="cliente-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => setModal(c)}>
                  Editar
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(c)}>
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ClienteModal
          cliente={modal === "new" ? null : modal}
          onSave={handleSaved}
          onClose={() => setModal(null)}
        />
      )}

      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <span className="modal-title">⚠️ Confirmar Exclusão</span>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <p style={{ marginBottom: "20px", color: "var(--text-muted)" }}>
              Tem certeza que deseja remover o cliente <strong>{confirmDelete.nome}</strong>?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(confirmDelete.id)}
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}