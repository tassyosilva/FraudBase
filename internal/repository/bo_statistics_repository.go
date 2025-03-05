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

// BuscarUltimosCincoBOs retorna os 5 BOs mais recentes
func (r *BOStatisticsRepository) BuscarUltimosCincoBOs() ([]BOData, error) {
	var resultados []BOData

	query := `
		SELECT numero_do_bo
		FROM tabela_estelionato
		ORDER BY numero_do_bo DESC
		LIMIT 5
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("erro ao consultar últimos BOs: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var bo BOData

		err := rows.Scan(&bo.NumeroBO)
		if err != nil {
			return nil, fmt.Errorf("erro ao ler dados do BO: %v", err)
		}

		resultados = append(resultados, bo)
	}

	return resultados, nil
}

// BuscarBOMaisAntigo retorna o BO mais antigo registrado
func (r *BOStatisticsRepository) BuscarBOMaisAntigo() (*BOData, error) {
	query := `
		SELECT numero_do_bo
		FROM tabela_estelionato
		ORDER BY numero_do_bo ASC
		LIMIT 1
	`

	var bo BOData

	err := r.db.QueryRow(query).Scan(&bo.NumeroBO)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Nenhum BO encontrado
		}
		return nil, fmt.Errorf("erro ao consultar BO mais antigo: %v", err)
	}

	return &bo, nil
}
