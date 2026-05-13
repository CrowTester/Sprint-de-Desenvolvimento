import { useState, useEffect, useCallback } from "react";
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../services/Api.js";
import Toast from "../components/Toast.jsx";

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
        <h3>{isEditing ? "Editar Cliente" : "Novo Cliente"}</h3>

        <input
          placeholder="Nome"
          value={form.nome}
          onChange={(e) =>
            setForm({ ...form, nome: e.target.value })
          }
        />
        {errors.nome && <p>{errors.nome}</p>}

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />
        {errors.email && <p>{errors.email}</p>}

        <input
          placeholder="Telefone"
          value={form.telefone}
          onChange={(e) =>
            setForm({ ...form, telefone: e.target.value })
          }
        />

        {errors.api && <p>{errors.api}</p>}

        <button onClick={onClose}>Cancelar</button>
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </button>
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
      <h1>Clientes</h1>

      <button onClick={() => setModal("new")}>
        Novo Cliente
      </button>

      <input
        placeholder="Buscar..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {loading ? (
        <p>Carregando...</p>
      ) : (
        filtrados.map((c) => (
          <div key={c.id}>
            <p>{c.nome}</p>
            <p>{c.email}</p>

            <button onClick={() => setModal(c)}>
              Editar
            </button>

            <button onClick={() => setConfirmDelete(c)}>
              Remover
            </button>
          </div>
        ))
      )}

      {modal && (
        <ClienteModal
          cliente={modal === "new" ? null : modal}
          onSave={handleSaved}
          onClose={() => setModal(null)}
        />
      )}

      {confirmDelete && (
        <div>
          <p>Confirmar exclusão?</p>
          <button onClick={() => setConfirmDelete(null)}>
            Cancelar
          </button>
          <button
            onClick={() => handleDelete(confirmDelete.id)}
          >
            Remover
          </button>
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