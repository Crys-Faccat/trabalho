Entrar na pasta do projeto:
cd caminho\para\ecommerce-api

Instalar dependências:
npm install

Rodar:
npm start


Endpoints

Raiz
GET / → lista endpoints disponíveis

Produtos
GET /products → listar produtos (filtros: q, nome, minValor, maxValor, minQtd, maxQtd)
GET /products/:id → obter produto por id
POST /products → criar produto
PUT /products/:id → atualizar produto
DELETE /products/:id → excluir produto

Usuários
GET /users → listar usuários
GET /users/:id → obter usuário por id
POST /users → criar usuário
PUT /users/:id → atualizar usuário
DELETE /users/:id → excluir usuário