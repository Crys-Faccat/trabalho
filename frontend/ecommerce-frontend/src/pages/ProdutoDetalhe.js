import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function ProdutoDetalhe() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);

useEffect(() => {
  api.get(`/products/${id}`).then((res) => setProduto(res.data.data));
}, [id]);


  if (!produto) return <p>Carregando...</p>;

  return (
    <div>
      <h2>{produto.nome}</h2>
      <p>ID: {produto.id}</p>
    </div>
  );
}

export default ProdutoDetalhe;
