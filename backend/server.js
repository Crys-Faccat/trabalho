// server.js
const express = require('express');
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET","POST","PUT","DELETE"]
}));
app.use(express.json());

// --- Dados em memória ---
let productSeq = 1;
let userSeq = 1;

let produtos = [
  { id: productSeq++, nome: 'Teclado Mecânico', valor: 350.00, quantidade: 12 },
  { id: productSeq++, nome: 'Mouse Gamer', valor: 199.90, quantidade: 25 },
  { id: productSeq++, nome: 'Headset USB', valor: 279.50, quantidade: 8 },
];

let usuarios = [
  { id: userSeq++, nome: 'Admin', senha: 'admin123', tipo: 'admin' },
  { id: userSeq++, nome: 'Cliente Exemplo', senha: '123456', tipo: 'cliente' },
];

// --- Funções auxiliares ---
function notEmptyString(s) { return typeof s === 'string' && s.trim().length > 0; }
function toNumberOrNull(v) {
  // aceita números e strings numéricas
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}
function isIntegerNonNegative(v) {
  const n = toNumberOrNull(v);
  return Number.isInteger(n) && n >= 0;
}
function sendNotFound(res, entity = 'Recurso') {
  return res.status(404).json({ message: `${entity} não encontrado(a).` });
}
function sendBadRequest(res, message) {
  return res.status(400).json({ message });
}

// --- Produtos ---
app.get('/products', (req, res) => {
  const { nome, minValor, maxValor, minQtd, maxQtd, q } = req.query;
  let lista = [...produtos];

  if (notEmptyString(q)) {
    const t = q.toLowerCase();
    lista = lista.filter(p =>
      String(p.nome).toLowerCase().includes(t) ||
      String(p.valor).includes(t) ||
      String(p.quantidade).includes(t)
    );
  }

  if (notEmptyString(nome)) lista = lista.filter(p => p.nome.toLowerCase().includes(nome.toLowerCase()));

  const minV = toNumberOrNull(minValor);
  const maxV = toNumberOrNull(maxValor);
  const minQ = toNumberOrNull(minQtd);
  const maxQ = toNumberOrNull(maxQtd);

  if (minV !== null) lista = lista.filter(p => p.valor >= minV);
  if (maxV !== null) lista = lista.filter(p => p.valor <= maxV);
  if (minQ !== null) lista = lista.filter(p => p.quantidade >= minQ);
  if (maxQ !== null) lista = lista.filter(p => p.quantidade <= maxQ);

  res.json({ data: lista, total: lista.length });
});

app.get('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendBadRequest(res, 'ID inválido.');
  const p = produtos.find(x => x.id === id);
  if (!p) return sendNotFound(res, 'Produto');
  res.json({ data: p });
});

// Criar novo produto (aceita numbers ou strings numéricas)
app.post('/products', (req, res) => {
  const { nome, valor, quantidade } = req.body || {};

  if (!notEmptyString(nome)) return sendBadRequest(res, 'Campo "nome" é obrigatório e deve ser texto.');
  const valorNum = toNumberOrNull(valor);
  if (valorNum === null) return sendBadRequest(res, 'Campo "valor" é obrigatório e deve ser número.');
  const qtdNum = toNumberOrNull(quantidade);
  if (!Number.isInteger(qtdNum) || qtdNum < 0) return sendBadRequest(res, 'Campo "quantidade" é obrigatório e deve ser inteiro >= 0.');

  const novo = { id: productSeq++, nome: String(nome).trim(), valor: Number(valorNum), quantidade: Number(qtdNum) };
  produtos.push(novo);
  res.status(201).json({ message: 'Produto criado com sucesso.', data: novo });
});

// Atualizar produto (parcial) - aceita strings numéricas
app.put('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendBadRequest(res, 'ID inválido.');
  const idx = produtos.findIndex(x => x.id === id);
  if (idx === -1) return sendNotFound(res, 'Produto');

  const { nome, valor, quantidade } = req.body || {};

  if (nome !== undefined && !notEmptyString(nome)) return sendBadRequest(res, 'Se enviado, "nome" deve ser texto não vazio.');
  if (valor !== undefined) {
    const v = toNumberOrNull(valor);
    if (v === null) return sendBadRequest(res, 'Se enviado, "valor" deve ser número.');
  }
  if (quantidade !== undefined) {
    const q = toNumberOrNull(quantidade);
    if (!Number.isInteger(q) || q < 0) return sendBadRequest(res, 'Se enviado, "quantidade" deve ser inteiro >= 0.');
  }

  const antigo = produtos[idx];
  const atualizado = {
    ...antigo,
    ...(nome !== undefined ? { nome: String(nome).trim() } : {}),
    ...(valor !== undefined ? { valor: Number(valor) } : {}),
    ...(quantidade !== undefined ? { quantidade: Number(quantidade) } : {}),
  };
  produtos[idx] = atualizado;
  res.json({ message: 'Produto atualizado com sucesso.', data: atualizado });
});

app.delete('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendBadRequest(res, 'ID inválido.');
  const idx = produtos.findIndex(x => x.id === id);
  if (idx === -1) return sendNotFound(res, 'Produto');
  const removido = produtos.splice(idx, 1)[0];
  res.json({ message: 'Produto excluído com sucesso.', data: removido });
});

// --- Usuários ---
app.get('/users', (req, res) => res.json({ data: usuarios, total: usuarios.length }));

app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendBadRequest(res, 'ID inválido.');
  const u = usuarios.find(x => x.id === id);
  if (!u) return sendNotFound(res, 'Usuário');
  res.json({ data: u });
});

// Criar usuário (valida strings)
app.post('/users', (req, res) => {
  const { nome, senha, tipo } = req.body || {};
  if (!notEmptyString(nome)) return sendBadRequest(res, 'Campo "nome" é obrigatório e deve ser texto.');
  if (!notEmptyString(senha)) return sendBadRequest(res, 'Campo "senha" é obrigatório.');
  if (!notEmptyString(tipo)) return sendBadRequest(res, 'Campo "tipo" é obrigatório (ex.: "admin", "cliente").');

  const novo = { id: userSeq++, nome: String(nome).trim(), senha: String(senha), tipo: String(tipo).trim() };
  usuarios.push(novo);
  res.status(201).json({ message: 'Usuário criado com sucesso.', data: novo });
});

// Atualizar usuário (parcial)
app.put('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendBadRequest(res, 'ID inválido.');
  const idx = usuarios.findIndex(x => x.id === id);
  if (idx === -1) return sendNotFound(res, 'Usuário');

  const { nome, senha, tipo } = req.body || {};
  if (nome !== undefined && !notEmptyString(nome)) return sendBadRequest(res, 'Se enviado, "nome" deve ser texto não vazio.');
  if (senha !== undefined && !notEmptyString(senha)) return sendBadRequest(res, 'Se enviado, "senha" deve ser texto não vazio.');
  if (tipo !== undefined && !notEmptyString(tipo)) return sendBadRequest(res, 'Se enviado, "tipo" deve ser texto não vazio.');

  const antigo = usuarios[idx];
  const atualizado = {
    ...antigo,
    ...(nome !== undefined ? { nome: String(nome).trim() } : {}),
    ...(senha !== undefined ? { senha: String(senha) } : {}),
    ...(tipo !== undefined ? { tipo: String(tipo).trim() } : {}),
  };
  usuarios[idx] = atualizado;
  res.json({ message: 'Usuário atualizado com sucesso.', data: atualizado });
});

app.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendBadRequest(res, 'ID inválido.');
  const idx = usuarios.findIndex(x => x.id === id);
  if (idx === -1) return sendNotFound(res, 'Usuário');
  const removido = usuarios.splice(idx, 1)[0];
  res.json({ message: 'Usuário excluído com sucesso.', data: removido });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'API E-commerce (Produtos & Usuários) — Express (versão robusta)',
    endpoints: {
      produtos: { listar: 'GET /products', obter: 'GET /products/:id', criar: 'POST /products', atualizar: 'PUT /products/:id', excluir: 'DELETE /products/:id' },
      usuarios: { listar: 'GET /users', obter: 'GET /users/:id', criar: 'POST /users', atualizar: 'PUT /users/:id', excluir: 'DELETE /users/:id' }
    }
  });
});

app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
