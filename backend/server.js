// Express E-commerce API (Produtos & Usuários)
// Requisitos atendidos:
// - CRUD de Produtos e Usuários
// - Busca/listagem com filtros para Produtos
// - Feito com Express


const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const cors = require("cors");
app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET","POST","PUT","DELETE"]
}));

app.use(express.json());

// --- Dados em memória (apenas para fins didáticos) ---
let productSeq = 1;
let userSeq = 1;

/** @type {{id:number, nome:string, valor:number, quantidade:number}[]} */
let produtos = [
  { id: productSeq++, nome: 'Teclado Mecânico', valor: 350.00, quantidade: 12 },
  { id: productSeq++, nome: 'Mouse Gamer', valor: 199.90, quantidade: 25 },
  { id: productSeq++, nome: 'Headset USB', valor: 279.50, quantidade: 8 },
];

/** @type {{id:number, nome:string, senha:string, tipo:string}[]} */
let usuarios = [
  { id: userSeq++, nome: 'Admin', senha: 'admin123', tipo: 'admin' },
  { id: userSeq++, nome: 'Cliente Exemplo', senha: '123456', tipo: 'cliente' },
];

function isNumber(n) { return typeof n === 'number' && !Number.isNaN(n); }
function toNumberOrNull(v) {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
function notEmptyString(s) { return typeof s === 'string' && s.trim().length > 0; }

function sendNotFound(res, entity = 'Recurso') {
  return res.status(404).json({ message: `${entity} não encontrado(a).` });
}

// Listar com filtros: /products?nome=mouse&minValor=100&maxValor=300&minQtd=5&maxQtd=50&q=gamer
app.get('/products', (req, res) => {
  const { nome, minValor, maxValor, minQtd, maxQtd, q } = req.query;
  let lista = [...produtos];

  if (notEmptyString(q)) {
    const t = q.toLowerCase();
    lista = lista.filter(p =>
      p.nome.toLowerCase().includes(t) ||
      String(p.valor).includes(t) ||
      String(p.quantidade).includes(t)
    );
  }

  if (notEmptyString(nome)) {
    const n = nome.toLowerCase();
    lista = lista.filter(p => p.nome.toLowerCase().includes(n));
  }

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

// Obter um produto por ID
app.get('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const p = produtos.find(x => x.id === id);
  if (!p) return sendNotFound(res, 'Produto');
  res.json({ data: p });
});

// Criar novo produto
app.post('/products', (req, res) => {
  const { nome, valor, quantidade } = req.body || {};

  if (!notEmptyString(nome)) {
    return res.status(400).json({ message: 'Campo "nome" é obrigatório e deve ser texto.' });
  }
  if (!isNumber(valor)) {
    return res.status(400).json({ message: 'Campo "valor" é obrigatório e deve ser número.' });
  }
  if (!Number.isInteger(quantidade) || quantidade < 0) {
    return res.status(400).json({ message: 'Campo "quantidade" é obrigatório e deve ser inteiro >= 0.' });
  }

  const novo = { id: productSeq++, nome: String(nome), valor: Number(valor), quantidade: Number(quantidade) };
  produtos.push(novo);
  res.status(201).json({ message: 'Produto criado com sucesso.', data: novo });
});

// Atualizar produto existente (substituição parcial)
app.put('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = produtos.findIndex(x => x.id === id);
  if (idx === -1) return sendNotFound(res, 'Produto');

  const { nome, valor, quantidade } = req.body || {};

  if (nome !== undefined && !notEmptyString(nome)) {
    return res.status(400).json({ message: 'Se enviado, "nome" deve ser texto não vazio.' });
  }
  if (valor !== undefined && !isNumber(valor)) {
    return res.status(400).json({ message: 'Se enviado, "valor" deve ser número.' });
  }
  if (quantidade !== undefined && (!Number.isInteger(quantidade) || quantidade < 0)) {
    return res.status(400).json({ message: 'Se enviado, "quantidade" deve ser inteiro >= 0.' });
  }

  const antigo = produtos[idx];
  const atualizado = {
    ...antigo,
    ...(nome !== undefined ? { nome: String(nome) } : {}),
    ...(valor !== undefined ? { valor: Number(valor) } : {}),
    ...(quantidade !== undefined ? { quantidade: Number(quantidade) } : {}),
  };
  produtos[idx] = atualizado;

  res.json({ message: 'Produto atualizado com sucesso.', data: atualizado });
});

// Excluir produto
app.delete('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = produtos.findIndex(x => x.id === id);
  if (idx === -1) return sendNotFound(res, 'Produto');
  const removido = produtos.splice(idx, 1)[0];
  res.json({ message: 'Produto excluído com sucesso.', data: removido });
});

// Listar usuários
app.get('/users', (req, res) => {
  res.json({ data: usuarios, total: usuarios.length });
});

// Obter um usuário por ID
app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const u = usuarios.find(x => x.id === id);
  if (!u) return sendNotFound(res, 'Usuário');
  res.json({ data: u });
});

// Criar usuário
app.post('/users', (req, res) => {
  const { nome, senha, tipo } = req.body || {};

  if (!notEmptyString(nome)) {
    return res.status(400).json({ message: 'Campo "nome" é obrigatório e deve ser texto.' });
  }
  if (!notEmptyString(senha)) {
    return res.status(400).json({ message: 'Campo "senha" é obrigatório.' });
  }
  if (!notEmptyString(tipo)) {
    return res.status(400).json({ message: 'Campo "tipo" é obrigatório (ex.: "admin", "cliente").' });
  }

  const novo = { id: userSeq++, nome: String(nome), senha: String(senha), tipo: String(tipo) };
  usuarios.push(novo);
  res.status(201).json({ message: 'Usuário criado com sucesso.', data: novo });
});

// Atualizar usuário
app.put('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = usuarios.findIndex(x => x.id === id);
  if (idx === -1) return sendNotFound(res, 'Usuário');

  const { nome, senha, tipo } = req.body || {};

  if (nome !== undefined && !notEmptyString(nome)) {
    return res.status(400).json({ message: 'Se enviado, "nome" deve ser texto não vazio.' });
  }
  if (senha !== undefined && !notEmptyString(senha)) {
    return res.status(400).json({ message: 'Se enviado, "senha" deve ser texto não vazio.' });
  }
  if (tipo !== undefined && !notEmptyString(tipo)) {
    return res.status(400).json({ message: 'Se enviado, "tipo" deve ser texto não vazio.' });
  }
  const cors = require("cors");


  const antigo = usuarios[idx];
  const atualizado = {
    ...antigo,
    ...(nome !== undefined ? { nome: String(nome) } : {}),
    ...(senha !== undefined ? { senha: String(senha) } : {}),
    ...(tipo !== undefined ? { tipo: String(tipo) } : {}),
  };
  usuarios[idx] = atualizado;

  res.json({ message: 'Usuário atualizado com sucesso.', data: atualizado });
});

// Excluir usuário
app.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = usuarios.findIndex(x => x.id === id);
  if (idx === -1) return sendNotFound(res, 'Usuário');
  const removido = usuarios.splice(idx, 1)[0];
  res.json({ message: 'Usuário excluído com sucesso.', data: removido });
});

app.get('/', (req, res) => {
  res.json({
    message: 'API E-commerce (Produtos & Usuários) — Express',
    endpoints: {
      produtos: {
        listar: 'GET /products (query: q, nome, minValor, maxValor, minQtd, maxQtd)',
        obter: 'GET /products/:id',
        criar: 'POST /products',
        atualizar: 'PUT /products/:id',
        excluir: 'DELETE /products/:id',
      },
      usuarios: {
        listar: 'GET /users',
        obter: 'GET /users/:id',
        criar: 'POST /users',
        atualizar: 'PUT /users/:id',
        excluir: 'DELETE /users/:id',
      },
    },
  });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

