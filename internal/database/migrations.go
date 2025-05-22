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

	log.Println("Migrações concluídas com sucesso!")
	return nil
}

// createUsersTable cria a tabela de usuários
func createUsersTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS usuarios (
		id SERIAL PRIMARY KEY,
		login VARCHAR(100) UNIQUE NOT NULL,
		nome VARCHAR(200) NOT NULL,
		cpf VARCHAR(14) NOT NULL,
		matricula VARCHAR(50),
		telefone VARCHAR(20),
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

// createEstelianatoTable cria a tabela principal de estelionato com tamanhos corrigidos
func createEstelianatoTable(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS tabela_estelionato (
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
			nome VARCHAR(300),  -- Aumentado para 300
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
	query := `
	INSERT INTO usuarios (login, nome, cpf, matricula, telefone, unidade_policial, email, senha, is_admin)
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

// AddIndexes adiciona índices para melhorar performance
func AddIndexes(db *sql.DB) error {
	indexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_tabela_estelionato_cpf ON tabela_estelionato(cpf);",
		"CREATE INDEX IF NOT EXISTS idx_tabela_estelionato_telefone ON tabela_estelionato(telefone_envolvido);",
		"CREATE INDEX IF NOT EXISTS idx_tabela_estelionato_numero_bo ON tabela_estelionato(numero_do_bo);",
		"CREATE INDEX IF NOT EXISTS idx_tabela_estelionato_tipo_envolvido ON tabela_estelionato(tipo_envolvido);",
		"CREATE INDEX IF NOT EXISTS idx_tabela_estelionato_nomecompleto ON tabela_estelionato(nomecompleto);",
		"CREATE INDEX IF NOT EXISTS idx_usuarios_login ON usuarios(login);",
		"CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);",
	}

	for _, indexQuery := range indexes {
		_, err := db.Exec(indexQuery)
		if err != nil {
			log.Printf("Aviso: Erro ao criar índice: %v", err)
			// Não retornar erro, pois índices são opcionais
		}
	}

	log.Println("Índices criados/verificados com sucesso")
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