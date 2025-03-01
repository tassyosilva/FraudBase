package repository

import (
	"database/sql"
	"log"
)

// Estruturas para armazenar os dados das consultas
type SexoStats struct {
	Sexo       string `json:"sexo"`
	Quantidade int    `json:"quantidade"`
}

type FaixaEtariaStats struct {
	FaixaEtaria string `json:"faixa_etaria"`
	Quantidade  int    `json:"quantidade"`
}

type CountStats struct {
	Quantidade int `json:"quantidade"`
}

// DashboardRepository manipula consultas de estatísticas para o dashboard
type DashboardRepository struct {
	db *sql.DB
}

// NewDashboardRepository cria um novo repositório para o dashboard
func NewDashboardRepository(db *sql.DB) *DashboardRepository {
	return &DashboardRepository{db: db}
}

// GetVitimasPorSexo retorna estatísticas de vítimas por sexo
func (r *DashboardRepository) GetVitimasPorSexo() ([]SexoStats, error) {
	query := `
		SELECT 
			'Feminino' AS sexo,
			COUNT(*) AS quantidade
		FROM 
			tabela_estelionato
		WHERE 
			tipo_envolvido IN ('Comunicante, Vítima', 'Vítima') 
			AND sexo_envolvido = 'Feminino'
		UNION ALL
		SELECT 
			'Masculino' AS sexo,
			COUNT(*) AS quantidade
		FROM 
			tabela_estelionato
		WHERE 
			tipo_envolvido IN ('Comunicante, Vítima', 'Vítima') 
			AND sexo_envolvido = 'Masculino'
		ORDER BY 
			quantidade DESC;
	`

	rows, err := r.db.Query(query)
	if err != nil {
		log.Printf("Erro ao consultar vítimas por sexo: %v", err)
		return nil, err
	}
	defer rows.Close()

	var stats []SexoStats
	for rows.Next() {
		var stat SexoStats
		if err := rows.Scan(&stat.Sexo, &stat.Quantidade); err != nil {
			log.Printf("Erro ao processar resultado: %v", err)
			return nil, err
		}
		stats = append(stats, stat)
	}

	return stats, nil
}

// GetVitimasPorFaixaEtaria retorna estatísticas de vítimas por faixa etária
func (r *DashboardRepository) GetVitimasPorFaixaEtaria() ([]FaixaEtariaStats, error) {
	query := `
		SELECT
			CASE 
				WHEN idade <= 20 THEN 'Menores ou igual a 20 anos'
				WHEN idade > 20 AND idade <= 40 THEN 'De 21 a 40 anos'
				WHEN idade > 40 AND idade <= 60 THEN 'De 41 a 60 anos'
				ELSE 'Maiores de 60 anos'
			END AS faixa_etaria,
			COUNT(*) AS quantidade
		FROM (
			SELECT 
				EXTRACT(YEAR FROM AGE(CURRENT_DATE, TO_DATE(nascimento, 'DD/MM/YYYY'))) AS idade
			FROM 
				tabela_estelionato
			WHERE 
				tipo_envolvido IN ('Comunicante, Vítima', 'Vítima')
		) AS subquery
		GROUP BY 
			faixa_etaria
		ORDER BY 
			quantidade DESC;
	`

	rows, err := r.db.Query(query)
	if err != nil {
		log.Printf("Erro ao consultar vítimas por faixa etária: %v", err)
		return nil, err
	}
	defer rows.Close()

	var stats []FaixaEtariaStats
	for rows.Next() {
		var stat FaixaEtariaStats
		if err := rows.Scan(&stat.FaixaEtaria, &stat.Quantidade); err != nil {
			log.Printf("Erro ao processar resultado: %v", err)
			return nil, err
		}
		stats = append(stats, stat)
	}

	return stats, nil
}

// GetQuantidadeBOs retorna a quantidade de BOs registrados
func (r *DashboardRepository) GetQuantidadeBOs() (CountStats, error) {
	query := `
		SELECT 
			COUNT(DISTINCT numero_do_bo) AS quantidade_distinta
		FROM 
			tabela_estelionato;
	`

	var stats CountStats
	err := r.db.QueryRow(query).Scan(&stats.Quantidade)
	if err != nil {
		log.Printf("Erro ao consultar quantidade de BOs: %v", err)
		return CountStats{}, err
	}

	return stats, nil
}

// GetQuantidadeInfratores retorna a quantidade total de infratores
func (r *DashboardRepository) GetQuantidadeInfratores() (CountStats, error) {
	query := `
		SELECT 
			COUNT(*) AS quantidade
		FROM 
			tabela_estelionato
		WHERE 
			tipo_envolvido = 'Suposto Autor/infrator';
	`

	var stats CountStats
	err := r.db.QueryRow(query).Scan(&stats.Quantidade)
	if err != nil {
		log.Printf("Erro ao consultar quantidade de infratores: %v", err)
		return CountStats{}, err
	}

	return stats, nil
}

// GetQuantidadeVitimas retorna a quantidade total de vítimas
func (r *DashboardRepository) GetQuantidadeVitimas() (CountStats, error) {
	query := `
		SELECT 
			COUNT(*) AS quantidade
		FROM 
			tabela_estelionato
		WHERE 
			tipo_envolvido IN ('Comunicante, Vítima', 'Vítima');
	`

	var stats CountStats
	err := r.db.QueryRow(query).Scan(&stats.Quantidade)
	if err != nil {
		log.Printf("Erro ao consultar quantidade de vítimas: %v", err)
		return CountStats{}, err
	}

	return stats, nil
}
