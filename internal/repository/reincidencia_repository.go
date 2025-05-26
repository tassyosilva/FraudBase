package repository

import (
	"database/sql"
	"log"
)

// ReincidenciaRepository gerencia operações de banco de dados relacionadas à reincidência
type ReincidenciaRepository struct {
	db *sql.DB
}

// NewReincidenciaRepository cria um novo repositório de reincidência
func NewReincidenciaRepository(db *sql.DB) *ReincidenciaRepository {
	return &ReincidenciaRepository{db: db}
}

// ReincidenciaCPFStats representa estatísticas de reincidência por CPF
type ReincidenciaCPFStats struct {
	CPF          string `json:"cpf"`
	NomeCompleto string `json:"nomecompleto"`
	NumerosBOs   string `json:"numeros_do_bo"`
	Quantidade   int    `json:"quantidade"`
}

// GetReincidenciaPorCPF retorna estatísticas de reincidência de infratores por CPF (versão otimizada)
func (r *ReincidenciaRepository) GetReincidenciaPorCPF(page int, limit int) ([]ReincidenciaCPFStats, int, error) {
	// Query otimizada usando window functions e índices específicos
	query := `
	WITH reincidencia_cpf AS (
		SELECT 
			cpf,
			COUNT(*) as quantidade,
			ARRAY_AGG(numero_do_bo ORDER BY numero_do_bo) as numeros_bo,
			MAX(nomecompleto) as nome_completo
		FROM tabela_estelionato
		WHERE tipo_envolvido = 'Suposto Autor/infrator'
		  AND cpf IS NOT NULL 
		  AND cpf != ''
		GROUP BY cpf
		HAVING COUNT(*) > 1
	)
	SELECT 
		cpf,
		nome_completo,
		ARRAY_TO_STRING(numeros_bo, ', ') as numeros_do_bo,
		quantidade
	FROM reincidencia_cpf
	ORDER BY quantidade DESC, cpf
	OFFSET $1 LIMIT $2;`

	// Query de contagem otimizada
	countQuery := `
	SELECT COUNT(*)
	FROM (
		SELECT cpf
		FROM tabela_estelionato
		WHERE tipo_envolvido = 'Suposto Autor/infrator'
		  AND cpf IS NOT NULL 
		  AND cpf != ''
		GROUP BY cpf
		HAVING COUNT(*) > 1
	) as contagem;`

	offset := (page - 1) * limit

	// Executar consulta de contagem
	var totalCount int
	err := r.db.QueryRow(countQuery).Scan(&totalCount)
	if err != nil {
		log.Printf("Erro ao contar total de reincidências por CPF: %v", err)
		return nil, 0, err
	}

	// Executar consulta paginada
	rows, err := r.db.Query(query, offset, limit)
	if err != nil {
		log.Printf("Erro ao consultar reincidência por CPF: %v", err)
		return nil, 0, err
	}
	defer rows.Close()

	var stats []ReincidenciaCPFStats
	for rows.Next() {
		var stat ReincidenciaCPFStats
		if err := rows.Scan(&stat.CPF, &stat.NomeCompleto, &stat.NumerosBOs, &stat.Quantidade); err != nil {
			log.Printf("Erro ao processar resultado: %v", err)
			return nil, 0, err
		}
		stats = append(stats, stat)
	}

	return stats, totalCount, nil
}
