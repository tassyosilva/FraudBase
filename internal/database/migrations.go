package database

import (
	"database/sql"
	"log"
	"golang.org/x/crypto/bcrypt"
)

// RunMigrations executa todas as migrações necessárias
func RunMigrations(db *sql.DB) error {
	log.Println("Iniciando migrações do banco de dados...")

	// Criar tabela de usuários
	if err := createUsersTable(db); err != nil {
		return err
	}

	// Atualizar estrutura da tabela de usuários (adicionar novos campos)
	if err := UpdateUsersTableStructure(db); err != nil {
		return err
	}

	// Criar tabela principal de estelionato
	if err := createEstelianatoTable(db); err != nil {
		return err
	}

	// Criar tabelas auxiliares (vazias)
	if err := createAuxiliaryTables(db); err != nil {
		return err
	}

	// Inserir usuário administrador padrão
	if err := insertDefaultAdmin(db); err != nil {
		return err
	}

	// Atualizar estrutura da tabela se necessário
	if err := UpdateTableStructure(db); err != nil {
		return err
	}

	// Adicionar índices otimizados
	if err := AddIndexes(db); err != nil {
		return err
	}

	// Criar views materializadas
	if err := CreateMaterializedViews(db); err != nil {
		return err
	}

	log.Println("Migrações concluídas com sucesso!")
	return nil
}

// createUsersTable cria a tabela de usuários
func createUsersTable(db *sql.DB) error {
	query := `CREATE TABLE IF NOT EXISTS usuarios (
		id SERIAL PRIMARY KEY,
		login VARCHAR(100) UNIQUE NOT NULL,
		nome VARCHAR(200) NOT NULL,
		cpf VARCHAR(14) NOT NULL,
		matricula VARCHAR(50),
		telefone VARCHAR(20),
		cidade VARCHAR(100),
		estado VARCHAR(50),
		unidade_policial VARCHAR(200),
		email VARCHAR(200) UNIQUE NOT NULL,
		senha TEXT NOT NULL,
		is_admin BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	_, err := db.Exec(query)
	if err != nil {
		log.Printf("Erro ao criar tabela usuarios: %v", err)
		return err
	}

	log.Println("Tabela 'usuarios' criada/verificada com sucesso")
	return nil
}

// UpdateUsersTableStructure adiciona os novos campos à tabela existente
func UpdateUsersTableStructure(db *sql.DB) error {
	log.Println("Atualizando estrutura da tabela usuarios...")

	alterations := []string{
		"ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);",
		"ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estado VARCHAR(50);",
	}

	for _, alteration := range alterations {
		_, err := db.Exec(alteration)
		if err != nil {
			log.Printf("Aviso: Alteração ignorada (possivelmente já aplicada): %v", err)
		}
	}

	log.Println("Estrutura da tabela usuarios atualizada")
	return nil
}

// createEstelianatoTable cria a tabela principal de estelionato com tamanhos corrigidos
func createEstelianatoTable(db *sql.DB) error {
	query := `CREATE TABLE IF NOT EXISTS tabela_estelionato (
		id SERIAL PRIMARY KEY,
		numero_do_bo VARCHAR(50),
		tipo_envolvido VARCHAR(100),
		nomecompleto VARCHAR(200),
		cpf VARCHAR(14),
		nomedamae VARCHAR(200),
		nascimento VARCHAR(50),
		nacionalidade VARCHAR(100),
		naturalidade VARCHAR(100),
		uf_envolvido VARCHAR(100),
		sexo_envolvido VARCHAR(50),
		telefone_envolvido VARCHAR(50),
		data_fato VARCHAR(50),
		cep_fato VARCHAR(10),
		latitude_fato VARCHAR(50),
		longitude_fato VARCHAR(50),
		logradouro_fato VARCHAR(1000),
		numerocasa_fato VARCHAR(50),
		bairro_fato VARCHAR(150),
		municipio_fato VARCHAR(100),
		pais_fato VARCHAR(100),
		delegacia_responsavel VARCHAR(300),
		situacao VARCHAR(50),
		natureza TEXT,
		relato_historico TEXT,
		instituicao_bancaria VARCHAR(200),
		endereco_ip VARCHAR(50),
		valor VARCHAR(100),
		pix_utilizado VARCHAR(200),
		numero_conta_bancaria VARCHAR(50),
		numero_boleto VARCHAR(100),
		processo_banco VARCHAR(100),
		numero_agencia_bancaria VARCHAR(100),
		cartao VARCHAR(50),
		terminal VARCHAR(100),
		tipo_pagamento VARCHAR(100),
		orgao_concessionaria VARCHAR(200),
		veiculo VARCHAR(200),
		terminal_conexao VARCHAR(100),
		erb VARCHAR(1000),
		operacao_policial VARCHAR(200),
		numero_laudo_pericial VARCHAR(100),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	_, err := db.Exec(query)
	if err != nil {
		log.Printf("Erro ao criar tabela tabela_estelionato: %v", err)
		return err
	}

	log.Println("Tabela 'tabela_estelionato' criada/verificada com sucesso")
	return nil
}

// createAuxiliaryTables cria as tabelas auxiliares (vazias, para compatibilidade)
func createAuxiliaryTables(db *sql.DB) error {
	tables := []string{
		`CREATE TABLE IF NOT EXISTS bancos (
			id SERIAL PRIMARY KEY,
			nome_completo VARCHAR(200),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS delegacias (
			id SERIAL PRIMARY KEY,
			nome VARCHAR(300), -- Aumentado para 300
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS municipios_e_estados (
			id SERIAL PRIMARY KEY,
			municipio VARCHAR(100),
			uf VARCHAR(10),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS paises (
			id SERIAL PRIMARY KEY,
			nome_pais VARCHAR(100),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
	}

	for _, query := range tables {
		_, err := db.Exec(query)
		if err != nil {
			log.Printf("Erro ao criar tabela auxiliar: %v", err)
			return err
		}
	}

	log.Println("Tabelas auxiliares criadas/verificadas com sucesso")
	return nil
}

// insertDefaultAdmin insere o usuário administrador padrão se não existir
func insertDefaultAdmin(db *sql.DB) error {
	// Verificar se já existe um usuário admin
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM usuarios WHERE login = $1", "admin").Scan(&count)
	if err != nil {
		return err
	}

	// Se já existe, não fazer nada
	if count > 0 {
		log.Println("Usuário administrador já existe")
		return nil
	}

	// Gerar hash da senha padrão
	password := "admin123" // Senha padrão que deve ser alterada após primeiro login
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Inserir usuário administrador
	query := `INSERT INTO usuarios (login, nome, cpf, matricula, telefone, unidade_policial, email, senha, is_admin)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

	_, err = db.Exec(query,
		"admin",
		"Administrador",
		"12345678900",
		"001",
		"",
		"FraudBase",
		"admin@admin.com",
		string(hashedPassword),
		true,
	)

	if err != nil {
		log.Printf("Erro ao inserir usuário administrador: %v", err)
		return err
	}

	log.Println("Usuário administrador padrão criado com sucesso")
	log.Println("Login: admin | Senha: admin123 (ALTERE IMEDIATAMENTE)")
	return nil
}

// AddIndexes adiciona índices otimizados para melhorar performance
func AddIndexes(db *sql.DB) error {
	log.Println("Criando índices otimizados para performance...")

	indexes := []string{
		// Índices básicos existentes
		"CREATE INDEX IF NOT EXISTS idx_tabela_estelionato_cpf ON tabela_estelionato(cpf);",
		"CREATE INDEX IF NOT EXISTS idx_tabela_estelionato_telefone ON tabela_estelionato(telefone_envolvido);",
		"CREATE INDEX IF NOT EXISTS idx_tabela_estelionato_numero_bo ON tabela_estelionato(numero_do_bo);",
		"CREATE INDEX IF NOT EXISTS idx_tabela_estelionato_tipo_envolvido ON tabela_estelionato(tipo_envolvido);",

		// Índices compostos para reincidência por CPF
		"CREATE INDEX IF NOT EXISTS idx_reincidencia_cpf ON tabela_estelionato(cpf, tipo_envolvido) WHERE tipo_envolvido = 'Suposto Autor/infrator' AND cpf IS NOT NULL AND cpf != '';",

		// Índices compostos para reincidência por telefone
		"CREATE INDEX IF NOT EXISTS idx_reincidencia_telefone ON tabela_estelionato(telefone_envolvido, tipo_envolvido) WHERE tipo_envolvido = 'Suposto Autor/infrator' AND telefone_envolvido IS NOT NULL AND telefone_envolvido != '';",

		// Índice para consultas por nome (trigram para busca aproximada)
		"CREATE EXTENSION IF NOT EXISTS pg_trgm;",
		"CREATE INDEX IF NOT EXISTS idx_nomecompleto_trgm ON tabela_estelionato USING gin(nomecompleto gin_trgm_ops);",

		// Índices compostos para consultas complexas
		"CREATE INDEX IF NOT EXISTS idx_consulta_envolvidos ON tabela_estelionato(nomecompleto, cpf, numero_do_bo, telefone_envolvido);",

		// Índices para dashboard (estatísticas)
		"CREATE INDEX IF NOT EXISTS idx_dashboard_vitimas ON tabela_estelionato(tipo_envolvido, sexo_envolvido) WHERE tipo_envolvido IN ('Comunicante, Vítima', 'Vítima');",
		"CREATE INDEX IF NOT EXISTS idx_dashboard_infratores ON tabela_estelionato(tipo_envolvido, delegacia_responsavel) WHERE tipo_envolvido = 'Suposto Autor/infrator';",

		// Índice para ordenação por data/BO
		"CREATE INDEX IF NOT EXISTS idx_data_fato ON tabela_estelionato(data_fato);",
		"CREATE INDEX IF NOT EXISTS idx_created_at ON tabela_estelionato(created_at);",

		// Índices de usuários
		"CREATE INDEX IF NOT EXISTS idx_usuarios_login ON usuarios(login);",
		"CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);",
	}

	for _, indexQuery := range indexes {
		log.Printf("Executando: %s", indexQuery)
		_, err := db.Exec(indexQuery)
		if err != nil {
			log.Printf("Aviso: Erro ao criar índice: %v", err)
			// Continuar mesmo com erro
		}
	}

	log.Println("Índices otimizados criados com sucesso!")
	return nil
}

// CreateMaterializedViews cria views materializadas para dashboard
func CreateMaterializedViews(db *sql.DB) error {
	log.Println("Criando views materializadas para dashboard...")

	views := []string{
		// View para estatísticas de vítimas por sexo
		`CREATE MATERIALIZED VIEW IF NOT EXISTS mv_vitimas_por_sexo AS
		SELECT 
			sexo_envolvido,
			COUNT(*) as quantidade
		FROM tabela_estelionato
		WHERE tipo_envolvido IN ('Comunicante, Vítima', 'Vítima')
		  AND sexo_envolvido IS NOT NULL
		GROUP BY sexo_envolvido;`,

		// View para estatísticas de infratores por delegacia
		`CREATE MATERIALIZED VIEW IF NOT EXISTS mv_infratores_por_delegacia AS
		SELECT 
			delegacia_responsavel,
			COUNT(*) as quantidade
		FROM tabela_estelionato
		WHERE tipo_envolvido = 'Suposto Autor/infrator'
		  AND delegacia_responsavel IS NOT NULL
		  AND delegacia_responsavel != ''
		GROUP BY delegacia_responsavel
		ORDER BY quantidade DESC
		LIMIT 10;`,

		// View para contagens gerais
		`CREATE MATERIALIZED VIEW IF NOT EXISTS mv_contagens_gerais AS
		SELECT 
			COUNT(DISTINCT numero_do_bo) as total_bos,
			COUNT(CASE WHEN tipo_envolvido = 'Suposto Autor/infrator' THEN 1 END) as total_infratores,
			COUNT(CASE WHEN tipo_envolvido IN ('Comunicante, Vítima', 'Vítima') THEN 1 END) as total_vitimas
		FROM tabela_estelionato;`,
	}

	for _, viewQuery := range views {
		_, err := db.Exec(viewQuery)
		if err != nil {
			log.Printf("Erro ao criar view materializada: %v", err)
		}
	}

	// Criar índices nas views
	indexesViews := []string{
		"CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_vitimas_sexo ON mv_vitimas_por_sexo(sexo_envolvido);",
		"CREATE INDEX IF NOT EXISTS idx_mv_delegacias_qtd ON mv_infratores_por_delegacia(quantidade DESC);",
	}

	for _, indexQuery := range indexesViews {
		_, err := db.Exec(indexQuery)
		if err != nil {
			log.Printf("Erro ao criar índice da view: %v", err)
		}
	}

	log.Println("Views materializadas criadas com sucesso!")
	return nil
}

// RefreshMaterializedViews atualiza as views materializadas
func RefreshMaterializedViews(db *sql.DB) error {
	views := []string{
		"REFRESH MATERIALIZED VIEW mv_vitimas_por_sexo;",
		"REFRESH MATERIALIZED VIEW mv_infratores_por_delegacia;",
		"REFRESH MATERIALIZED VIEW mv_contagens_gerais;",
	}

	for _, refreshQuery := range views {
		_, err := db.Exec(refreshQuery)
		if err != nil {
			log.Printf("Erro ao atualizar view materializada: %v", err)
		}
	}

	return nil
}

// UpdateTableStructure atualiza a estrutura da tabela se necessário
func UpdateTableStructure(db *sql.DB) error {
	log.Println("Verificando se é necessário atualizar estrutura da tabela...")

	// Alterações para corrigir tamanhos de campos se a tabela já existe
	alterations := []string{
		"ALTER TABLE tabela_estelionato ALTER COLUMN telefone_envolvido TYPE VARCHAR(50);",
		"ALTER TABLE tabela_estelionato ALTER COLUMN logradouro_fato TYPE VARCHAR(500);",
		"ALTER TABLE tabela_estelionato ALTER COLUMN delegacia_responsavel TYPE VARCHAR(300);",
		"ALTER TABLE tabela_estelionato ALTER COLUMN natureza TYPE TEXT;",
	}

	for _, alteration := range alterations {
		_, err := db.Exec(alteration)
		if err != nil {
			// Ignorar erros de alteração (pode ser que a coluna já tenha o tipo correto)
			log.Printf("Aviso: Alteração ignorada (possivelmente já aplicada): %v", err)
		}
	}

	log.Println("Verificação de estrutura concluída")
	return nil
}
