import React, { useEffect, useState } from "react";
import api from "../services/api"; //  http://localhost:3000

function safeParseData(payload) {

  const d = payload?.data ?? null;
  if (Array.isArray(d) || (d && typeof d === "object")) return d;
  if (typeof d === "string") {
    try {
      return JSON.parse(d);
    } catch (e) {
      console.warn("safeParseData: não foi possível parsear data string:", d);
      return null;
    }
  }
  return null;
}

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [novoProduto, setNovoProduto] = useState({ nome: "", valor: "", quantidade: "" });
  const [idBusca, setIdBusca] = useState("");
  const [produtoBusca, setProdutoBusca] = useState(null);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { carregarProdutos(); }, []);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      console.log("GET /products =>", res.status, res.data);
      const parsed = safeParseData(res.data);
      if (Array.isArray(parsed)) {
        setProdutos(parsed);
      } else if (parsed && typeof parsed === "object" && Array.isArray(parsed.data)) {

        setProdutos(parsed.data);
      } else {

        if (Array.isArray(res.data)) setProdutos(res.data);
        else setProdutos([]);
        console.warn("carregarProdutos: resposta não está no formato esperado, setando lista vazia.");
      }
    } catch (err) {
      console.error("Erro ao carregar produtos:", err.response?.data || err);
      alert("Erro ao carregar produtos — veja console.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoProduto(prev => ({ ...prev, [name]: value }));
  };

  const validarCamposFront = () => {
    if (!novoProduto.nome || !novoProduto.nome.trim()) { alert("Nome é obrigatório."); return false; }
    const valorNum = Number(novoProduto.valor);
    const qtdNum = Number(novoProduto.quantidade);
    if (Number.isNaN(valorNum)) { alert("Valor deve ser um número."); return false; }
    if (!Number.isInteger(qtdNum) || qtdNum < 0) { alert("Quantidade deve ser inteiro >= 0."); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCamposFront()) return;

    const payload = {
      nome: novoProduto.nome,
      valor: Number(novoProduto.valor),
      quantidade: Number(novoProduto.quantidade)
    };

    try {
      if (editando && produtoBusca) {
        const res = await api.put(`/products/${produtoBusca.id}`, payload);
        console.log("PUT /products/:id =>", res.status, res.data);
        alert(res.data?.message || "Produto atualizado com sucesso!");
        setProdutoBusca(res.data?.data ?? { ...produtoBusca, ...payload });
        setEditando(false);
      } else {
        const res = await api.post("/products", payload);
        console.log("POST /products =>", res.status, res.data);
        if (res.status === 201) {
          alert(res.data?.message || "Produto criado com sucesso!");
          // tenta pegar produto criado
          const created = res.data?.data ?? null;
          if (created) {
            setProdutoBusca(created);
            setEditando(true);
          }
        } else {
          alert(res.data?.message || "Resposta inesperada ao criar.");
        }
      }

      setNovoProduto({ nome: "", valor: "", quantidade: "" });
      carregarProdutos();
    } catch (err) {
      console.error("Erro ao salvar produto:", err.response?.data || err);
      const msg = err.response?.data?.message ?? err.message;
      alert(msg || "Erro ao salvar produto! Veja console.");
    }
  };

  const buscarPorId = async () => {
    const raw = String(idBusca || "").trim();
    if (!raw) { alert("Informe um ID."); return; }
    const id = Number(raw);
    if (Number.isNaN(id) || id <= 0) { alert("ID inválido."); return; }

    try {
      const res = await api.get(`/products/${id}`);
      console.log(`GET /products/${id} =>`, res.status, res.data);
      const parsed = safeParseData(res.data);
      const p = parsed ?? res.data?.data ?? res.data;
      if (!p) {
        alert("Resposta inesperada do servidor (sem produto). Veja console.");
        return;
      }
      setProdutoBusca(p);
      setNovoProduto({ nome: String(p.nome), valor: String(p.valor), quantidade: String(p.quantidade) });
      setEditando(true);
    } catch (err) {
      console.error("Erro ao buscar produto por id:", err.response?.data || err);
      const msg = err.response?.data?.message ?? err.message;
      alert(msg || "Produto não encontrado!");
      setProdutoBusca(null);
      setEditando(false);
      setNovoProduto({ nome: "", valor: "", quantidade: "" });
    }
  };

  const iniciarEdicao = (p) => {
    setProdutoBusca(p);
    setNovoProduto({ nome: String(p.nome), valor: String(p.valor), quantidade: String(p.quantidade) });
    setEditando(true);
  };

  const cancelarEdicao = () => {
    setEditando(false);
    setProdutoBusca(null);
    setNovoProduto({ nome: "", valor: "", quantidade: "" });
  };

  const deletarProduto = async (id) => {
    if (!window.confirm("Confirmar exclusão?")) return;
    try {
      const res = await api.delete(`/products/${id}`);
      console.log("DELETE =>", res.status, res.data);
      alert(res.data?.message || "Excluído com sucesso!");
      if (produtoBusca?.id === id) cancelarEdicao();
      carregarProdutos();
    } catch (err) {
      console.error("Erro ao deletar produto:", err.response?.data || err);
      const msg = err.response?.data?.message ?? err.message;
      alert(msg || "Erro ao deletar produto!");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Produtos</h2>
      <div><strong>Status:</strong> {loading ? "Carregando..." : `${produtos.length} produto(s)`}</div>

      <ul>
        {produtos.map(p => (
          <li key={p.id} style={{ marginBottom: 6 }}>
            <strong>{p.id}</strong> - {p.nome} - R$ {p.valor} ({p.quantidade} un.)
            {" "}
            <button onClick={() => iniciarEdicao(p)}>Editar</button>
            {" "}
            <button onClick={() => deletarProduto(p.id)}>Excluir</button>
          </li>
        ))}
      </ul>

      <hr />

      <h3>{editando ? "Editar Produto" : "Adicionar Produto"}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label><br />
          <input name="nome" placeholder="Nome" value={novoProduto.nome} onChange={handleChange} />
        </div>
        <div>
          <label>Valor:</label><br />
          <input name="valor" placeholder="Valor" type="number" step="0.01" value={novoProduto.valor} onChange={handleChange} />
        </div>
        <div>
          <label>Quantidade:</label><br />
          <input name="quantidade" placeholder="Quantidade" type="number" value={novoProduto.quantidade} onChange={handleChange} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">{editando ? "Salvar alterações" : "Adicionar"}</button>
          {editando && <button type="button" onClick={cancelarEdicao}>Cancelar edição</button>}
        </div>
      </form>

      <hr />

      <h3>Buscar Produto por ID</h3>
      <input placeholder="ID do produto" value={idBusca} onChange={e => setIdBusca(e.target.value)} />
      <button onClick={buscarPorId}>Buscar</button>

      {produtoBusca && (
        <div style={{ marginTop: 12, padding: 8, border: "1px solid #ccc" }}>
          <h4>Produto Encontrado:</h4>
          <p><strong>ID:</strong> {produtoBusca.id}</p>
          <p><strong>Nome:</strong> {produtoBusca.nome}</p>
          <p><strong>Valor:</strong> R$ {produtoBusca.valor}</p>
          <p><strong>Quantidade:</strong> {produtoBusca.quantidade}</p>
        </div>
      )}
    </div>
  );
}

export default Produtos;
