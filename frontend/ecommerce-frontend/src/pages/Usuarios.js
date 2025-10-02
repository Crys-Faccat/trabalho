// src/pages/Usuarios.js
import React, { useEffect, useState } from "react";
import api from "../services/api"; // verifique baseURL: http://localhost:3000

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [novoUsuario, setNovoUsuario] = useState({ nome: "", senha: "", tipo: "" });
  const [idBusca, setIdBusca] = useState("");
  const [usuarioBusca, setUsuarioBusca] = useState(null);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { carregarUsuarios(); }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      console.log("GET /users =>", res.status, res.data);
      const data = res.data?.data ?? [];
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err.response?.data || err);
      alert("Erro ao carregar usuários. Veja console.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoUsuario(prev => ({ ...prev, [name]: value }));
  };

  const validarCamposFront = () => {
    if (!novoUsuario.nome || !novoUsuario.nome.trim()) { alert("Nome é obrigatório."); return false; }
    if (!novoUsuario.senha || !novoUsuario.senha.trim()) { alert("Senha é obrigatória."); return false; }
    if (!novoUsuario.tipo || !novoUsuario.tipo.trim()) { alert("Tipo é obrigatório (ex.: admin, cliente)."); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCamposFront()) return;

    const payload = {
      nome: String(novoUsuario.nome).trim(),
      senha: String(novoUsuario.senha),
      tipo: String(novoUsuario.tipo).trim()
    };

    try {
      if (editando && usuarioBusca) {
        const res = await api.put(`/users/${usuarioBusca.id}`, payload);
        console.log("PUT /users/:id =>", res.status, res.data);
        alert(res.data?.message || "Usuário atualizado com sucesso!");
        setUsuarioBusca(res.data?.data ?? { ...usuarioBusca, ...payload });
        setEditando(false);
      } else {
        const res = await api.post("/users", payload);
        console.log("POST /users =>", res.status, res.data);
        if (res.status === 201) {
          alert(res.data?.message || "Usuário criado com sucesso!");
          const created = res.data?.data ?? null;
          if (created) {
            setUsuarioBusca(created);
            setEditando(true);
          }
        } else {
          alert(res.data?.message || "Resposta inesperada ao criar usuário.");
        }
      }

      setNovoUsuario({ nome: "", senha: "", tipo: "" });
      carregarUsuarios();
    } catch (err) {
      console.error("Erro ao salvar usuário:", err.response?.data || err);
      const msg = err.response?.data?.message ?? err.message;
      alert(msg || "Erro ao salvar usuário! Veja console.");
    }
  };

  const buscarPorId = async () => {
    const raw = String(idBusca || "").trim();
    if (!raw) { alert("Informe um ID para busca."); return; }
    const id = Number(raw);
    if (Number.isNaN(id) || id <= 0) { alert("ID inválido."); return; }

    try {
      const res = await api.get(`/users/${id}`);
      console.log(`GET /users/${id} =>`, res.status, res.data);
      const u = res.data?.data ?? null;
      if (!u) {
        alert("Resposta inesperada (sem usuário). Veja console.");
        return;
      }
      setUsuarioBusca(u);
      setNovoUsuario({ nome: String(u.nome), senha: String(u.senha), tipo: String(u.tipo) });
      setEditando(true);
    } catch (err) {
      console.error("Erro ao buscar usuário por id:", err.response?.data || err);
      const msg = err.response?.data?.message ?? err.message;
      alert(msg || "Usuário não encontrado!");
      setUsuarioBusca(null);
      setEditando(false);
      setNovoUsuario({ nome: "", senha: "", tipo: "" });
    }
  };

  const iniciarEdicao = (u) => {
    setUsuarioBusca(u);
    setNovoUsuario({ nome: String(u.nome), senha: String(u.senha), tipo: String(u.tipo) });
    setEditando(true);
  };

  const cancelarEdicao = () => {
    setEditando(false);
    setUsuarioBusca(null);
    setNovoUsuario({ nome: "", senha: "", tipo: "" });
  };

  const deletarUsuario = async (id) => {
    if (!window.confirm("Deseja realmente excluir este usuário?")) return;
    try {
      const res = await api.delete(`/users/${id}`);
      console.log("DELETE /users/:id =>", res.status, res.data);
      alert(res.data?.message || "Usuário excluído com sucesso!");
      if (usuarioBusca?.id === id) cancelarEdicao();
      carregarUsuarios();
    } catch (err) {
      console.error("Erro ao deletar usuário:", err.response?.data || err);
      const msg = err.response?.data?.message ?? err.message;
      alert(msg || "Erro ao deletar usuário!");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Usuários</h2>
      <div><strong>Status:</strong> {loading ? "Carregando..." : `${usuarios.length} usuário(s)`}</div>

      <ul>
        {usuarios.map(u => (
          <li key={u.id} style={{ marginBottom: 6 }}>
            <strong>{u.id}</strong> - {u.nome} - ({u.tipo}){" "}
            <button onClick={() => iniciarEdicao(u)}>Editar</button>{" "}
            <button onClick={() => deletarUsuario(u.id)}>Excluir</button>
          </li>
        ))}
      </ul>

      <hr />

      <h3>{editando ? "Editar Usuário" : "Adicionar Usuário"}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label><br />
          <input name="nome" placeholder="Nome" value={novoUsuario.nome} onChange={handleChange} />
        </div>
        <div>
          <label>Senha:</label><br />
          <input name="senha" placeholder="Senha" type="password" value={novoUsuario.senha} onChange={handleChange} />
        </div>
        <div>
          <label>Tipo:</label><br />
          <input name="tipo" placeholder='Tipo (ex.: "admin" ou "cliente")' value={novoUsuario.tipo} onChange={handleChange} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">{editando ? "Salvar alterações" : "Adicionar"}</button>{" "}
          {editando && <button type="button" onClick={cancelarEdicao}>Cancelar edição</button>}
        </div>
      </form>

      <hr />

      <h3>Buscar Usuário por ID</h3>
      <input placeholder="ID do usuário" value={idBusca} onChange={e => setIdBusca(e.target.value)} />
      <button onClick={buscarPorId}>Buscar</button>

      {usuarioBusca && (
        <div style={{ marginTop: 12, padding: 8, border: "1px solid #ccc" }}>
          <h4>Usuário Encontrado:</h4>
          <p><strong>ID:</strong> {usuarioBusca.id}</p>
          <p><strong>Nome:</strong> {usuarioBusca.nome}</p>
          <p><strong>Tipo:</strong> {usuarioBusca.tipo}</p>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
