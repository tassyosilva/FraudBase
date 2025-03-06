# FraudBase
- Sistema para cruzamento de dados de envolvidos em fraudes eletrônicas.
- `Este software não é livre para uso, você pode visualizar o código do projeto, mas deve estar atento à licença de uso restrito do software.` [Licença de uso restrito.](https://github.com/tassyosilva/FraudBase/blob/main/LICENSE)

### Sobre o Projeto
- FraudBase é uma aplicação web completa para cadastro, consulta e análise de ocorrências relacionadas a estelionatos e fraudes ocorridos em âmbito virtual. O sistema permite o gerenciamento de informações detalhadas sobre envolvidos, ocorrências e o cruzamento de dados com o objetivo de verificar a reincidência de infratores nos referidos crimes.

### Requisitos para o Deploy do sistema
- O sistema utiliza PostgreSQL como banco de dados. Siga os passos abaixo para configurar:

- Instale o PostgreSQL em sua máquina ou utilize um servidor existente.

- Crie um novo banco de dados no usuário de sua preferência.
- Via pgAdmin:
```bash
CREATE DATABASE fraudbase 
WITH ENCODING 'UTF8' 
LC_COLLATE='pt_BR.UTF-8' 
LC_CTYPE='pt_BR.UTF-8'
TEMPLATE template0;
```
- Via terminal psql:
```bash
CREATE DATABASE fraudbase WITH ENCODING 'UTF8' LC_COLLATE='pt_BR.UTF-8' LC_CTYPE='pt_BR.UTF-8' TEMPLATE template0;
```
- Faça o download do arquivo de backup disponível [aqui](bd_fraudbase) e restaure no banco de dados que foi criado.

### Modo de Produção

- *CONFIGURAÇÕES MÍNIMAS DO SERVIDOR:* Recomenda-se o sistema operacional Ubuntu Server 22.04 ou superior e no mínimo 2 (dois) núcleos dedicados CPU, 2GB de memória RAM e 10GB de armazenamento para os sistemas. Para grandes volumes de usuários, recomenda-se o dobro da configuração mínima exigida.

- Para executar o sistema em ambiente de produção, utilize o Docker Compose:

1. Certifique-se que o Docker e Docker Compose estão instalados em seu servidor.
2. Clone este repositório:
```bash
git clone https://github.com/tassyosilva/FraudBase.git
```
3. Acesse a pasta do Repositório:
```bash
cd "FraudBase"
```
4. Abra o arquivo `docker-compose.yml`com o nano, configure as variáveis do seu banco de dados e salve.
5. Você pode inserir sua logomarca alterando o arquivo na pasta `web/frontend/src/assets/logo.png`
6. Execute o comando:
```bash
docker compose up -d
```
7. Após a finalização, o sistema estará disponível em `http://localhost:8000`. Usuário: `admin`, Senha: `admin`.
8. Para acesso externo a aplicação pelo ip do servidor (ex.: http://ipdoservidor:8000), ou no caso de proxy reverso para o servidor, é necessário adicionar a nova origem na lista de origens permitidas no arquivo `main.go`.
9. Para implementar alterações no arquivo main.go e em outros arquivos, é necessário construir uma nova build, ou seja, recomenda-se deletar as imagens criadas (fraudbase-backend e fraudbase-frontend) e subir novamente com o compose.

### Modo de Desenvolvimento
- Para executar o sistema em ambiente de desenvolvimento:

1. **Backend (Go)**:
   - Certifique-se que o Go está instalado (versão 1.23.6+)
   - Dentro da pasta raiz do FraudBase, instale as dependências:
```bash
go mod download
```
   - Execute o servidor backend de desenvolvimento:
```bash
go run main.go
```

2. **Frontend (React TypeScript)**:
   - Certifique-se que o Node.js está instalado (versão 18.20.5+)
   - Navegue até a pasta `web/frontend/`
   - Instale as dependências:

```bash
npm install
```

   - Execute o servidor frontend de desenvolvimento:

```bash
npm run dev
```
   - A aplicação estará disponível para acesso em `http://localhost:5173`. Usuário: `admin`, Senha: `admin`.
   - Para acesso externo a aplicação pelo ip do servidor (ex.: http://ipdoservidor:5173), ou no caso de proxy reverso para o servidor, é necessário adicionar a nova origem na lista de origens permitidas no arquivo `main.go`.