# Backend - API de Pedidos

Servidor Node.js/Express com API para gerenciar clientes e pedidos.

## 🚀 Instalação

```bash
npm install
```

## ▶️ Como Rodar

**Desenvolvimento (com hot-reload):**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

O servidor rodará em `http://localhost:3000`

## 📋 Endpoints

### Clientes

- `GET /clientes` - Listar todos os clientes
- `GET /clientes/:id` - Obter um cliente específico
- `POST /clientes` - Criar novo cliente
  ```json
  {
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "11999999999"
  }
  ```
- `PUT /clientes/:id` - Atualizar cliente
- `DELETE /clientes/:id` - Deletar cliente

### Pedidos

- `GET /pedidos` - Listar todos os pedidos
- `GET /pedidos/:id` - Obter um pedido específico
- `POST /pedidos` - Criar novo pedido
  ```json
  {
    "clienteId": "uuid",
    "descricao": "Descrição do pedido",
    "status": "pendente"
  }
  ```
- `PATCH /pedidos/:id` - Atualizar pedido (status, descrição)
- `DELETE /pedidos/:id` - Deletar pedido

### Health

- `GET /health` - Verificar status do servidor

## 💾 Dados

Os dados são armazenados **em memória** durante a execução. Ao reiniciar o servidor, os dados serão resetados com dados padrão.

Para persistência, considere usar um banco de dados como MongoDB ou PostgreSQL.

## 🔧 Dependências

- **express** - Framework web
- **cors** - Suporte CORS para frontend
- **uuid** - Geração de IDs únicos
