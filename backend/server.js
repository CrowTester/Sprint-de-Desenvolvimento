import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ─── BASE DE DADOS EM MEMÓRIA ──────────────────────────────
let clientes = [
  { id: uuidv4(), nome: 'João Silva', email: 'joao@email.com', telefone: '11999999999' },
  { id: uuidv4(), nome: 'Maria Santos', email: 'maria@email.com', telefone: '11988888888' },
  { id: uuidv4(), nome: 'Pedro Costa', email: 'pedro@email.com', telefone: '11977777777' },
];

let pedidos = [
  { id: uuidv4(), clienteId: clientes[0].id, descricao: 'Pedido 1', status: 'pendente', data: new Date().toISOString() },
  { id: uuidv4(), clienteId: clientes[1].id, descricao: 'Pedido 2', status: 'pronto', data: new Date().toISOString() },
  { id: uuidv4(), clienteId: clientes[0].id, descricao: 'Pedido 3', status: 'pendente', data: new Date().toISOString() },
];

// ─── CLIENTES ─────────────────────────────────────────────
// GET /clientes
app.get('/clientes', (req, res) => {
  res.json({ data: clientes });
});

// GET /clientes/:id
app.get('/clientes/:id', (req, res) => {
  const cliente = clientes.find(c => c.id === req.params.id);
  if (!cliente) {
    return res.status(404).json({ message: 'Cliente não encontrado' });
  }
  res.json({ data: cliente });
});

// POST /clientes
app.post('/clientes', (req, res) => {
  const { nome, email, telefone } = req.body;
  if (!nome || !email) {
    return res.status(400).json({ message: 'Nome e email são obrigatórios' });
  }
  const novoCliente = {
    id: uuidv4(),
    nome,
    email,
    telefone: telefone || '',
  };
  clientes.push(novoCliente);
  res.status(201).json({ data: novoCliente });
});

// PUT /clientes/:id
app.put('/clientes/:id', (req, res) => {
  const cliente = clientes.find(c => c.id === req.params.id);
  if (!cliente) {
    return res.status(404).json({ message: 'Cliente não encontrado' });
  }
  const { nome, email, telefone } = req.body;
  if (nome) cliente.nome = nome;
  if (email) cliente.email = email;
  if (telefone !== undefined) cliente.telefone = telefone;
  res.json({ data: cliente });
});

// DELETE /clientes/:id
app.delete('/clientes/:id', (req, res) => {
  const index = clientes.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Cliente não encontrado' });
  }
  const deletado = clientes.splice(index, 1);
  res.json({ data: deletado[0], message: 'Cliente deletado com sucesso' });
});

// ─── PEDIDOS ───────────────────────────────────────────────
// GET /pedidos
app.get('/pedidos', (req, res) => {
  res.json({ data: pedidos });
});

// GET /pedidos/:id
app.get('/pedidos/:id', (req, res) => {
  const pedido = pedidos.find(p => p.id === req.params.id);
  if (!pedido) {
    return res.status(404).json({ message: 'Pedido não encontrado' });
  }
  res.json({ data: pedido });
});

// POST /pedidos
app.post('/pedidos', (req, res) => {
  const { clienteId, descricao, status } = req.body;
  if (!clienteId || !descricao) {
    return res.status(400).json({ message: 'ClienteId e descrição são obrigatórios' });
  }
  const cliente = clientes.find(c => c.id === clienteId);
  if (!cliente) {
    return res.status(404).json({ message: 'Cliente não encontrado' });
  }
  const novoPedido = {
    id: uuidv4(),
    clienteId,
    descricao,
    status: status || 'pendente',
    data: new Date().toISOString(),
  };
  pedidos.push(novoPedido);
  res.status(201).json({ data: novoPedido });
});

// PATCH /pedidos/:id (atualizar status)
app.patch('/pedidos/:id', (req, res) => {
  const pedido = pedidos.find(p => p.id === req.params.id);
  if (!pedido) {
    return res.status(404).json({ message: 'Pedido não encontrado' });
  }
  const { status, descricao } = req.body;
  if (status) pedido.status = status;
  if (descricao) pedido.descricao = descricao;
  res.json({ data: pedido });
});

// DELETE /pedidos/:id
app.delete('/pedidos/:id', (req, res) => {
  const index = pedidos.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Pedido não encontrado' });
  }
  const deletado = pedidos.splice(index, 1);
  res.json({ data: deletado[0], message: 'Pedido deletado com sucesso' });
});

// ─── HEALTH CHECK ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── INICIAR SERVIDOR ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Endpoints disponíveis:`);
  console.log(`   GET  /clientes`);
  console.log(`   GET  /clientes/:id`);
  console.log(`   POST /clientes`);
  console.log(`   PUT  /clientes/:id`);
  console.log(`   DELETE /clientes/:id`);
  console.log(`   GET  /pedidos`);
  console.log(`   GET  /pedidos/:id`);
  console.log(`   POST /pedidos`);
  console.log(`   PATCH /pedidos/:id`);
  console.log(`   DELETE /pedidos/:id`);
  console.log(`   GET  /health`);
});
