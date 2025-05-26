package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

func ConnectDB() (*sql.DB, error) {
	log.Println("Iniciando conexão com o banco...")
	
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "192.168.3.204" // Valor padrão para desenvolvimento
	}
	
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres" // Valor padrão para desenvolvimento
	}
	
	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "adm2000!@" // Valor padrão para desenvolvimento
	}
	
	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "db_fraudbase" // Valor padrão para desenvolvimento
	}
	
	sslmode := os.Getenv("DB_SSLMODE")
	if sslmode == "" {
		sslmode = "disable" // Valor padrão para desenvolvimento
	}

	connStr := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=%s",
		host, user, password, dbname, sslmode)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Printf("Erro ao abrir conexão: %v", err)
		return nil, err
	}

	// Configurações de pool de conexões para alta performance
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(time.Hour) // Conexões expiram após 1 hora

	err = db.Ping()
	if err != nil {
		log.Printf("Erro ao pingar o banco: %v", err)
		return nil, err
	}

	log.Println("Conexão estabelecida com sucesso!")

	// Executar migrações automaticamente
	log.Println("Executando migrações do banco de dados...")
	if err := RunMigrations(db); err != nil {
		log.Printf("Erro ao executar migrações: %v", err)
		return nil, err
	}

	// Atualizar estrutura da tabela usuarios
	if err := UpdateUsersTableStructure(db); err != nil {
		log.Printf("Aviso: Erro ao atualizar estrutura da tabela usuarios: %v", err)
	}

	// Atualizar estrutura da tabela se necessário (para corrigir tamanhos de campos)
	if err := UpdateTableStructure(db); err != nil {
		log.Printf("Aviso: Erro ao atualizar estrutura da tabela: %v", err)
		// Não retornar erro, continuar execução
	}

	// Adicionar índices otimizados para performance
	if err := AddIndexes(db); err != nil {
		log.Printf("Aviso: Erro ao criar índices: %v", err)
		// Não retornar erro, continuar execução
	}

	// Criar views materializadas para dashboard
	if err := CreateMaterializedViews(db); err != nil {
		log.Printf("Aviso: Erro ao criar views materializadas: %v", err)
		// Não retornar erro, continuar execução
	}

	log.Println("Banco de dados configurado e otimizado com sucesso!")
	return db, nil
}
