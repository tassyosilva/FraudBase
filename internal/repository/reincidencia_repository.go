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

// GetReincidenciaPorCPF retorna estatísticas de reincidência de infratores por CPF
func (r *ReincidenciaRepository) GetReincidenciaPorCPF(page int, limit int) ([]ReincidenciaCPFStats, int, error) {
	// Consulta paginada com OFFSET e LIMIT
	query := `
        SELECT 
            t.cpf, 
            MAX(t.nomecompleto) AS nomecompleto, 
            STRING_AGG(t.numero_do_bo, ', ') AS numeros_do_bo, 
            contagem.quantidade
        FROM 
            tabela_estelionato t
        JOIN (
            SELECT 
                cpf, 
                COUNT(*) AS quantidade
            FROM 
                tabela_estelionato
            WHERE 
                tipo_envolvido = 'Suposto Autor/infrator'
                AND cpf IS NOT NULL
                AND cpf != ''
            GROUP BY 
                cpf
            HAVING 
                COUNT(*) > 1
        ) contagem 
        ON t.cpf = contagem.cpf
        WHERE 
            t.tipo_envolvido = 'Suposto Autor/infrator'
            AND t.cpf IS NOT NULL
            AND t.cpf != ''
        GROUP BY 
            t.cpf, contagem.quantidade
        ORDER BY 
            contagem.quantidade DESC
        OFFSET $1
        LIMIT $2;
    `

	// Consulta para contar o total de registros
	countQuery := `
        SELECT 
            COUNT(*)
        FROM (
            SELECT 
                t.cpf
            FROM 
                tabela_estelionato t
            JOIN (
                SELECT 
                    cpf, 
                    COUNT(*) AS quantidade
                FROM 
                    tabela_estelionato
                WHERE 
                    tipo_envolvido = 'Suposto Autor/infrator'
                    AND cpf IS NOT NULL
                    AND cpf != ''
                GROUP BY 
                    cpf
                HAVING 
                    COUNT(*) > 1
            ) contagem 
            ON t.cpf = contagem.cpf
            WHERE 
                t.tipo_envolvido = 'Suposto Autor/infrator'
                AND t.cpf IS NOT NULL
                AND t.cpf != ''
            GROUP BY 
                t.cpf, contagem.quantidade
        ) AS total_count;
    `

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
