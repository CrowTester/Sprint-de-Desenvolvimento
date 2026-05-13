import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 8000,
})

// Interceptor para erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.message || error.message || 'Erro desconhecido'
    return Promise.reject(new Error(msg))
  }
)

// ─── CLIENTES ─────────────────────────────────────
export const getClientes = () => api.get('/clientes')

export const getClienteById = (id) => api.get(`/clientes/${id}`)

export const createCliente = (data) => api.post('/clientes', data)

export const updateCliente = (id, data) => api.put(`/clientes/${id}`, data)

export const deleteCliente = (id) => api.delete(`/clientes/${id}`)

// ─── PEDIDOS ──────────────────────────────────────
export const getPedidos = (params = {}) => api.get('/pedidos', { params })

export const getPedidoById = (id) => api.get(`/pedidos/${id}`)

export const createPedido = (data) => api.post('/pedidos', data)

export const updatePedidoStatus = (id, status) =>
  api.patch(`/pedidos/${id}`, { status })

export const deletePedido = (id) => api.delete(`/pedidos/${id}`)

export default api