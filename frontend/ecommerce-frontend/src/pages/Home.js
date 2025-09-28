import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Bem-vindo ao sistema</h1>
      <nav>
        <ul>
          <li><Link to="/produtos">Ver Produtos</Link></li>
          <li><Link to="/usuarios">Ver Usuários</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default Home;
