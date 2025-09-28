import React, { useEffect, useState } from "react";
import api from "../services/api";

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [novoProduto, setNovoProduto] = useState({ nome: "", valor: "", quantidade: "" });

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    const res = await api.get("/products");
    setProdutos(res.data.data);
  };

  const handleChange = e => {
    setNovoProduto({ ...novoProduto, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post("/products", {
        nome: novoProduto.nome,
        valor: Number(novoProduto.valor),
        quantidade: Number(novoProduto.quantidade)
      });
      setNovoProduto({ nome: "", valor: "", quantidade: "" });
      carregarProdutos();
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar produto!");
    }
  };

  return (
    <div>
      <h2>Produtos</h2>
      <ul>
        {produtos.map(p => <li key={p.id}>{p.nome} - R$ {p.valor} ({p.quantidade} un.)</li>)}
      </ul>

      <h3>Adicionar Produto</h3>
      <form onSubmit={handleSubmit}>
        <input name="nome" placeholder="Nome" value={novoProduto.nome} onChange={handleChange} />
        <input name="valor" placeholder="Valor" type="number" value={novoProduto.valor} onChange={handleChange} />
        <input name="quantidade" placeholder="Quantidade" type="number" value={novoProduto.quantidade} onChange={handleChange} />
        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
}

export default Produtos;