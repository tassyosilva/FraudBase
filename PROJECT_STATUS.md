# FraudBase - STATUS DO PROJETO

## Implementação Atual
- Sistema de login com autenticação PostgreSQL
- Layout do Dashboard com tema escuro MUI
- Rotas protegidas com armazenamento de sessão
- Configuração CORS para desenvolvimento local
- Conexão com banco de dados (192.168.1.106, usuário: postgres, senha: 123456)
- Navegação entre páginas Dashboard e Configurações
- Cadastro de usuários implementado
- Listagem de usuários implementada
- Menu lateral fixo para navegação constante

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

## Estrutura do Banco de Dados
- Banco: estelionato
- Tabela: usuarios
  - Campos: id, login, nome, cpf, matricula, telefone, unidade_policial, email, senha, is_admin
- Credenciais admin atuais: admin/admin

## Estrutura do Backend
- Handlers: auth.go (tratamento de login), user_handler.go (gerenciamento de usuários)
- Repository: user_repository.go (operações no banco)
- Database: config.go (conexão PostgreSQL)
- Models: user.go (estrutura do usuário)
- Main: middleware CORS e configuração de rotas

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
- Implementado cadastro de usuários com validações
- Adicionado seleção de tipo de usuário (admin/padrão)
- Implementada criptografia de senha com bcrypt
- Adicionadas validações de campos únicos (email, login)
- Integração completa frontend-backend para cadastro
- Mensagens de erro/sucesso no frontend
- Correção da autenticação para senhas criptografadas
- Implementado listagem de usuários na página de configurações
- Criado endpoints para listar todos os usuários do sistema
- Convertido menu lateral deslizante para menu fixo
- Atualizado tema para fundo em tom branco gelo

## Implementação em Andamento
- Funcionalidade de edição e exclusão de usuários
- Próximas features: gerenciar permissões e alterar senha

## Estrutura de Diretórios Atual
/projeto-go
  /internal
    /database
      └── config.go
    /handlers
      ├── auth.go
      ├── dashboard.go
      └── user_handler.go
    /models
      ├── fraud.go
      └── user.go
    /repository
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
          └── UsersList.tsx
        ├── styles
        ├── theme
          └── darkTheme.ts
        ├── types
          └── User.ts
        ├── App.tsx
        └── main.tsx

## Próximos Passos
- Implementar funcionalidade de editar usuário
- Implementar funcionalidade de deletar usuário
- Adicionar confirmação para operações de exclusão
- Implementar alteração de senha
- Criar validações de permissões admin
- Implementar logout
- Desenvolver recursos de análise e gráficos para o dashboard
