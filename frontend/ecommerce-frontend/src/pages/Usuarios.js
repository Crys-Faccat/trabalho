import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [novoUsuario, setNovoUsuario] = useState({ nome: "", senha: "", tipo: "" });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = () => {
    api.get("/users")
      .then(res => setUsuarios(res.data.data))
      .catch(err => console.error(err));
  };

  const adicionarUsuario = (e) => {
    e.preventDefault();
    api.post("/users", novoUsuario)
      .then(() => {
        setNovoUsuario({ nome: "", senha: "", tipo: "" });
        carregarUsuarios();
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h2>Usuários</h2>

      <ul>
        {usuarios.map(u => (
          <li key={u.id}>
            <Link to={`/usuarios/${u.id}`}>{u.nome}</Link>
          </li>
        ))}
      </ul>

      <h3>Adicionar Usuário</h3>
      <form onSubmit={adicionarUsuario}>
        <input
          placeholder="Nome"
          value={novoUsuario.nome}
          onChange={e => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
        />
        <input
          placeholder="Senha"
          type="password"
          value={novoUsuario.senha}
          onChange={e => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
        />
        <input
          placeholder="Tipo"
          value={novoUsuario.tipo}
          onChange={e => setNovoUsuario({ ...novoUsuario, tipo: e.target.value })}
        />
        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
}

export default Usuarios;