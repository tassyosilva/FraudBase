# FraudBase - STATUS DO PROJETO

Repositório: https://github.com/tassyosilva/FraudBase

## Implementação Atual
- Sistema de login com autenticação PostgreSQL
- Implementação de autenticação JWT para APIs:
  - Endpoint de login que verifica credenciais no PostgreSQL e retorna token JWT
  - Middleware que protege rotas da API verificando token JWT
  - Separação de rotas públicas e protegidas
  - Middleware de controle de acesso para rotas administrativas
- Credenciais admin atuais: admin/admin
- Layout do Dashboard com tema escuro MUI
- Rotas protegidas com armazenamento de sessão
- Configuração CORS para desenvolvimento local
- Conexão com banco de dados (192.168.1.106, usuário: postgres, senha: 123456)
- Navegação entre páginas Dashboard e Configurações
- Cadastro de usuários implementado
- Listagem de usuários implementada
- Menu lateral fixo para navegação constante
- Funcionalidade de logout implementada corretamente
- Formulário de cadastro de envolvidos implementado e totalmente integrado ao backend

## Componentes Criados
- SignIn (com validação de formulário e autenticação no banco)
- Dashboard (com drawer permanente e ícones dourados)
  - Responsável pela estrutura principal do layout da aplicação
  - Implementa o drawer lateral fixo e a barra de navegação superior
  - Define a área de conteúdo principal da aplicação
  - Gerencia o layout responsivo usando MUI Box e Container
  - Aplica os estilos e temas consistentes em toda a aplicação
- Layout (componente intermediário entre a estrutura e o conteúdo)
  - Atua como camada sobre o Dashboard
  - Gerencia os itens de menu e submenu
  - Implementa a navegação usando useNavigate do React Router
  - Controla a expansão/colapso dos submenus
  - Renderiza os ícones e textos para cada item de menu
- PrivateRoute (protegendo rotas autenticadas)
- Settings (componente com tabs para navegação entre cadastro e gerenciamento de usuários)
- UserRegister (formulário para cadastro de novos usuários com validação de campos)
- UsersList (listagem de usuários com opções de edição e exclusão)
- CadastroEnvolvidos (formulário organizado em seções usando Accordion)
  - Implementa formatação automática para CPF (123.456.789-00)
  - Implementa formatação automática para telefone (95)99139-9001
  - Organiza os dados em seções lógicas (Dados do Envolvido, Dados do Fato, etc.)
  - Campos select dinâmicos integrados com dados do banco (Nacionalidade, Município, etc.)
  - Conversão automática de formato de datas (YYYY-MM-DD para DD/MM/YYYY)
  - Integração completa com backend para salvar dados na tabela_estelionato

## Estrutura do Banco de Dados
- Banco: estelionato
- Tabelas:
  - usuarios: id, login, nome, cpf, matricula, telefone, unidade_policial, email, senha, is_admin
  - tabela_estelionato: "id","numero_do_bo","tipo_envolvido","nomecompleto","cpf","nomedamae","nascimento","nacionalidade","naturalidade","uf_envolvido","sexo_envolvido","telefone_envolvido","data_fato","cep_fato","latitude_fato","longitude_fato","logradouro_fato","numerocasa_fato","bairro_fato","municipio_fato","pais_fato","delegacia_responsavel","situacao","natureza","relato_historico","instituicao_bancaria","endereco_ip","valor","pix_utilizado","numero_conta_bancaria","numero_boleto","processo_banco","numero_agencia_bancaria","cartao","terminal","tipo_pagamento","orgao_concessionaria","veiculo","terminal_conexao","erb","operacao_policial","numero_laudo_pericial"
  - bancos: "codigo","ispb","cnpj","nome_completo","nome_reduzido","url"
  - delegacias: "id","nome"
  - municipios_e_estados: "codigo_municipio_ibge","municipio","uf"
  - paises: "codigo_pais_ison3","codigo_pais_isoa3","nome_pais"

- Como os handlers estão estruturados no projeto:
  1. Os handlers são organizados em structs que recebem repositórios como dependências
  2. Operações de banco de dados são encapsuladas em repositórios (internal/repository)
  3. O padrão de resposta HTTP inclui cabeçalhos Content-Type e codificação JSON
  4. Há tratamento de erros com mensagens apropriadas e códigos HTTP

## Estrutura do Backend
- Handlers: auth.go (tratamento de login), user_handler.go (gerenciamento de usuários), delegacia_handler.go, pais_handler.go, envolvido_handler.go
- Repository: user_repository.go, delegacia_repository.go, pais_repository.go, estelionato_repository.go
- Database: config.go (conexão PostgreSQL)
- Models: user.go (estrutura do usuário)
- Main: middleware CORS e configuração de rotas
- Auth: jwt.go (geração e validação de tokens JWT)
- Middleware: auth.go (proteção de rotas com JWT)

## Arquitetura do Frontend
- Estrutura de Layout em camadas:
  - Dashboard.tsx: Componente base que define a estrutura visual da aplicação
    - Implementa AppBar (barra superior)
    - Implementa Drawer (menu lateral fixo)
    - Define o Container para conteúdo principal
  - Layout.tsx: Gerencia itens de navegação e interação
    - Recebe Dashboard como componente pai
    - Popula o menu lateral com itens específicos
    - Gerencia navegação entre rotas

## Última Implementação
- Adicionada autenticação JWT para APIs:
  - Endpoint de login que retorna token JWT
  - Middleware de proteção para rotas da API
  - Separação entre rotas públicas e rotas que necessitam de autenticação
- Finalizado formulário de cadastro de envolvidos com todas as validações
- Implementada integração do formulário com a tabela tabela_estelionato no backend
- Adicionados campos select com carregamento dinâmico de dados do banco
- Implementada formatação de datas para o padrão brasileiro (DD/MM/YYYY)
- Criados novos repositórios e handlers para suporte às funcionalidades implementadas
- Estabelecido padrão de estrutura para handlers e repositórios

## Implementação em Andamento
- Página de consulta no banco de dados dos envolvidos cadastrados

## Estrutura de Diretórios Atual
/projeto-go
  /internal
    /auth
      └── jwt.go
    /database
      └── config.go
    /handlers
      ├── auth.go
      ├── banco_handler.go
      ├── dashboard.go
      ├── delegacia_handler.go
      ├── envolvido_handler.go
      ├── middlewares.go
      ├── municipio_handler.go
      ├── pais_handler.go
      └── user_handler.go
    /middleware
      └── auth.go
    /models
      ├── fraud.go
      └── user.go
    /repository
      ├── banco_repository.go
      ├── delegacia_repository.go
      ├── estelionato_repository.go
      ├── municipio_repository.go
      ├── pais_repository.go
      └── user_repository.go
  /web
    /frontend
      ├── src
        ├── assets
        ├── components
          ├── Dashboard.tsx
          ├── Layout.tsx
          ├── listItems.tsx
          ├── PrivateRoute.tsx
          ├── Settings.tsx
          ├── SignIn.tsx
          ├── UserRegister.tsx
          ├── UsersList.tsx
          ├── EditUserModal.tsx     
          └── CadastroEnvolvidos.tsx
        ├── styles
        ├── theme
          └── darkTheme.ts
        ├── types
          └── User.ts
        ├── App.tsx
        └── main.tsx

## Próximos Passos
- Criar página de consulta de envolvidos cadastrados
- Implementar listagem dos envolvidos cadastrados
- Adicionar funcionalidades de edição e exclusão de envolvidos
- Implementar alteração de senha para usuários
- Criar validações de permissões admin
- Desenvolver recursos de análise e gráficos para o dashboard
