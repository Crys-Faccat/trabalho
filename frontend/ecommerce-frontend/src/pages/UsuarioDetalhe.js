import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function UsuarioDetalhe() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    api.get(`/users/${id}`).then((res) => setUsuario(res.data.data));
  }, [id]); 

  if (!usuario) return <p>Carregando...</p>;

  return (
    <div>
      <h2>{usuario.nome}</h2>
      <p>Tipo: {usuario.tipo}</p>
    </div>
  );
}

export default UsuarioDetalhe;
