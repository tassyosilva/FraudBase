package repository

import (
	"database/sql"
	"log"
)

// ReincidenciaCelularRepository gerencia operações de banco de dados relacionadas à reincidência por celular
type ReincidenciaCelularRepository struct {
	db *sql.DB
}

// NewReincidenciaCelularRepository cria um novo repositório de reincidência por celular
func NewReincidenciaCelularRepository(db *sql.DB) *ReincidenciaCelularRepository {
	return &ReincidenciaCelularRepository{db: db}
}

// ReincidenciaCelularStats representa estatísticas de reincidência por celular
type ReincidenciaCelularStats struct {
	Telefone     string `json:"telefone"`
	NomeCompleto string `json:"nomecompleto"`
	NumerosBOs   string `json:"numeros_do_bo"`
	Quantidade   int    `json:"quantidade"`
}

// GetReincidenciaPorCelular retorna estatísticas de reincidência de infratores por celular (versão otimizada)
func (r *ReincidenciaCelularRepository) GetReincidenciaPorCelular(page int, limit int) ([]*ReincidenciaCelularStats, int, error) {
	// Query otimizada usando window functions
	query := `
	WITH reincidencia_telefone AS (
		SELECT 
			telefone_envolvido,
			COUNT(*) as quantidade,
			ARRAY_AGG(numero_do_bo ORDER BY numero_do_bo) as numeros_bo,
			MAX(nomecompleto) as nome_completo
		FROM tabela_estelionato
		WHERE tipo_envolvido = 'Suposto Autor/infrator'
		  AND telefone_envolvido IS NOT NULL 
		  AND telefone_envolvido != ''
		GROUP BY telefone_envolvido
		HAVING COUNT(*) > 1
	)
	SELECT 
		telefone_envolvido,
		nome_completo,
		ARRAY_TO_STRING(numeros_bo, ', ') as numeros_do_bo,
		quantidade
	FROM reincidencia_telefone
	ORDER BY quantidade DESC, telefone_envolvido
	OFFSET $1 LIMIT $2;`

	// Query de contagem otimizada
	countQuery := `
	SELECT COUNT(*)
	FROM (
		SELECT telefone_envolvido
		FROM tabela_estelionato
		WHERE tipo_envolvido = 'Suposto Autor/infrator'
		  AND telefone_envolvido IS NOT NULL 
		  AND telefone_envolvido != ''
		GROUP BY telefone_envolvido
		HAVING COUNT(*) > 1
	) as contagem;`

	offset := (page - 1) * limit

	// Executar consulta de contagem
	var totalCount int
	err := r.db.QueryRow(countQuery).Scan(&totalCount)
	if err != nil {
		log.Printf("Erro ao contar total de reincidências por celular: %v", err)
		return nil, 0, err
	}

	// Executar consulta paginada
	rows, err := r.db.Query(query, offset, limit)
	if err != nil {
		log.Printf("Erro ao consultar reincidência por celular: %v", err)
		return nil, 0, err
	}
	defer rows.Close()

	var stats []*ReincidenciaCelularStats
	for rows.Next() {
		stat := &ReincidenciaCelularStats{}
		if err := rows.Scan(&stat.Telefone, &stat.NomeCompleto, &stat.NumerosBOs, &stat.Quantidade); err != nil {
			log.Printf("Erro ao processar resultado: %v", err)
			return nil, 0, err
		}
		stats = append(stats, stat)
	}

	return stats, totalCount, nil
}
