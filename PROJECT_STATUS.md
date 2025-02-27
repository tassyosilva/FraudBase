# FraudBase - STATUS DO PROJETO

Repositório: https://github.com/tassyosilva/FraudBase

## Implementação Atual
- Sistema de login com autenticação PostgreSQL
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
- Início da implementação do formulário de cadastro de envolvidos

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
  - Estruturado para interagir com a tabela tabela_estelionato

## Estrutura do Banco de Dados
- Banco: estelionato
- Tabelas:
  - usuarios: id, login, nome, cpf, matricula, telefone, unidade_policial, email, senha, is_admin
  - tabela_estelionato: "id","numero_do_bo","tipo_envolvido","nomecompleto","cpf","nomedamae","nascimento","nacionalidade","naturalidade","uf_envolvido","sexo_envolvido","telefone_envolvido","data_fato","cep_fato","latitude_fato","longitude_fato","logradouro_fato","numerocasa_fato","bairro_fato","municipio_fato","pais_fato","delegacia_responsavel","situacao","natureza","relato_historico","instituicao_bancaria","endereco_ip","valor","pix_utilizado","numero_conta_bancaria","numero_boleto","processo_banco","numero_agencia_bancaria","cartao","terminal","tipo_pagamento","orgao_concessionaria","veiculo","terminal_conexao","erb","operacao_policial","numero_laudo_pericial"
  - bancos: "codigo","ispb","cnpj","nome_completo","nome_reduzido","url"
  - delegacias: "id","nome"
  - municipios_e_estados: "codigo_municipio_ibge","municipio","uf"
  - paises: "codigo_pais_ison3","codigo_pais_isoa3","nome_pais"


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
- Corrigido problema de logout que não encerrava completamente a sessão
- Iniciado desenvolvimento do formulário de cadastro de envolvidos
- Implementado layout organizado com Accordion para o formulário
- Adicionada formatação automática para campos CPF e telefone
- Estruturado o formulário para interação com a tabela tabela_estelionato
- Adicionado validações básicas para o formulário

## Implementação em Andamento
- Formulário de cadastro de envolvidos
- Integração com backend para tabela tabela_estelionato

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
- Finalizar formulário de cadastro de envolvidos com validações adicionais
- Criar modelos e repositories no backend para tabela tabela_estelionato
- Implementar API REST para cadastro de envolvidos no backend
- Integrar o formulário frontend com o backend
- Implementar listagem dos envolvidos cadastrados
- Adicionar funcionalidades de edição e exclusão de envolvidos
- Implementar alteração de senha para usuários
- Criar validações de permissões admin
- Desenvolver recursos de análise e gráficos para o dashboard
