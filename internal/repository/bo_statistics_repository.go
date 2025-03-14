package repository

import (
	"database/sql"
	"fmt"
)

// BOData representa uma estrutura simplificada para retornar dados de BO
type BOData struct {
	NumeroBO string `json:"numero_do_bo"`
}

// BOStatisticsRepository é o repositório para estatísticas de BOs
type BOStatisticsRepository struct {
	db *sql.DB
}

// NewBOStatisticsRepository cria uma nova instância do repositório
func NewBOStatisticsRepository(db *sql.DB) *BOStatisticsRepository {
	return &BOStatisticsRepository{
		db: db,
	}
}

// BuscarBOMaisNovo retorna o BO mais recente considerando o formato número/ano
func (r *BOStatisticsRepository) BuscarBOMaisNovo() (*BOData, error) {
	// Query para encontrar o BO mais recente, ordenando por ano e número
	query := `
	WITH parsed_bo AS (
		SELECT 
			numero_do_bo,
			-- Extrair o ano (assumindo formato XXXX/YYYY ou XXXX/YYYY-X)
			CAST(SUBSTRING(numero_do_bo FROM POSITION('/' IN numero_do_bo) + 1 FOR 4) AS INTEGER) AS ano,
			-- Extrair o número (assumindo que está no início)
			CAST(SUBSTRING(numero_do_bo FROM 1 FOR POSITION('/' IN numero_do_bo) - 1) AS INTEGER) AS numero
		FROM tabela_estelionato
		WHERE 
			numero_do_bo ~ E'^\\d+/\\d{4}(-[A-Z])?$' -- Validar formato
	)
	SELECT numero_do_bo
	FROM parsed_bo
	ORDER BY ano DESC, numero DESC
	LIMIT 1;
	`
	
	bo := &BOData{}
	err := r.db.QueryRow(query).Scan(&bo.NumeroBO)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Nenhum BO encontrado
		}
		return nil, fmt.Errorf("erro ao consultar BO mais recente: %v", err)
	}
	
	return bo, nil
}

// BuscarBOMaisAntigo retorna o BO mais antigo registrado considerando o formato número/ano
func (r *BOStatisticsRepository) BuscarBOMaisAntigo() (*BOData, error) {
	// Query modificada para ordenar corretamente pelo ano e depois pelo número
	query := `
	WITH parsed_bo AS (
		SELECT 
			numero_do_bo,
			-- Extrair o ano (assumindo formato XXXX/YYYY ou XXXX/YYYY-X)
			CAST(SUBSTRING(numero_do_bo FROM POSITION('/' IN numero_do_bo) + 1 FOR 4) AS INTEGER) AS ano,
			-- Extrair o número (assumindo que está no início)
			CAST(SUBSTRING(numero_do_bo FROM 1 FOR POSITION('/' IN numero_do_bo) - 1) AS INTEGER) AS numero
		FROM tabela_estelionato
		WHERE 
			numero_do_bo ~ E'^\\d+/\\d{4}(-[A-Z])?$' -- Validar formato
	)
	SELECT numero_do_bo
	FROM parsed_bo
	ORDER BY ano ASC, numero ASC
	LIMIT 1;
	`
	
	bo := &BOData{}
	err := r.db.QueryRow(query).Scan(&bo.NumeroBO)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Nenhum BO encontrado
		}
		return nil, fmt.Errorf("erro ao consultar BO mais antigo: %v", err)
	}
	
	return bo, nil
}