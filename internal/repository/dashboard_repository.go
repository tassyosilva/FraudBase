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

// InfratoresPorDelegaciaStats representa estatísticas de infratores por delegacia
type InfratoresPorDelegaciaStats struct {
	DelegaciaResponsavel string `json:"delegacia_responsavel"`
	Quantidade           int    `json:"quantidade"`
}

// DashboardRepository manipula consultas de estatísticas para o dashboard
type DashboardRepository struct {
	db *sql.DB
}

// NewDashboardRepository cria um novo repositório para o dashboard
func NewDashboardRepository(db *sql.DB) *DashboardRepository {
	return &DashboardRepository{db: db}
}

// GetVitimasPorSexo usando view materializada (versão otimizada)
func (r *DashboardRepository) GetVitimasPorSexo() ([]SexoStats, error) {
	query := `SELECT sexo_envolvido as sexo, quantidade FROM mv_vitimas_por_sexo ORDER BY quantidade DESC;`
	
	rows, err := r.db.Query(query)
	if err != nil {
		log.Printf("Erro ao consultar vítimas por sexo: %v", err)
		// Fallback para query tradicional se view não existir
		return r.getVitimasPorSexoFallback()
	}
	defer rows.Close()

	var stats []SexoStats
	for rows.Next() {
		var stat SexoStats
		if err := rows.Scan(&stat.Sexo, &stat.Quantidade); err != nil {
			log.Printf("Erro ao processar resultado: %v", err)
			return []SexoStats{}, err
		}
		stats = append(stats, stat)
	}

	if len(stats) == 0 {
		stats = []SexoStats{
			{Sexo: "Masculino", Quantidade: 0},
			{Sexo: "Feminino", Quantidade: 0},
		}
	}

	return stats, nil
}

// Função fallback caso a view não exista
func (r *DashboardRepository) getVitimasPorSexoFallback() ([]SexoStats, error) {
	query := `
		SELECT 
			sexo_envolvido AS sexo,
			COUNT(*) AS quantidade
		FROM tabela_estelionato
		WHERE tipo_envolvido IN ('Comunicante, Vítima', 'Vítima') 
		  AND sexo_envolvido IN ('Masculino', 'Feminino')
		GROUP BY sexo_envolvido
		ORDER BY quantidade DESC;`

	rows, err := r.db.Query(query)
	if err != nil {
		return []SexoStats{}, err
	}
	defer rows.Close()

	var stats []SexoStats
	for rows.Next() {
		var stat SexoStats
		if err := rows.Scan(&stat.Sexo, &stat.Quantidade); err != nil {
			return []SexoStats{}, err
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
		quantidade DESC;`

	rows, err := r.db.Query(query)
	if err != nil {
		log.Printf("Erro ao consultar vítimas por faixa etária: %v", err)
		return []FaixaEtariaStats{}, err
	}
	defer rows.Close()

	var stats []FaixaEtariaStats
	for rows.Next() {
		var stat FaixaEtariaStats
		if err := rows.Scan(&stat.FaixaEtaria, &stat.Quantidade); err != nil {
			log.Printf("Erro ao processar resultado: %v", err)
			return []FaixaEtariaStats{}, err
		}
		stats = append(stats, stat)
	}

	// Se não houver resultados, retorne dados padrão
	if len(stats) == 0 {
		stats = []FaixaEtariaStats{
			{FaixaEtaria: "Menores ou igual a 20 anos", Quantidade: 0},
			{FaixaEtaria: "De 21 a 40 anos", Quantidade: 0},
			{FaixaEtaria: "De 41 a 60 anos", Quantidade: 0},
			{FaixaEtaria: "Maiores de 60 anos", Quantidade: 0},
		}
	}

	return stats, nil
}

// GetQuantidadeBOs otimizada usando view materializada
func (r *DashboardRepository) GetQuantidadeBOs() (CountStats, error) {
	query := `SELECT total_bos as quantidade FROM mv_contagens_gerais LIMIT 1;`
	
	var stats CountStats
	err := r.db.QueryRow(query).Scan(&stats.Quantidade)
	if err != nil {
		// Fallback para query tradicional
		query = `SELECT COUNT(DISTINCT numero_do_bo) AS quantidade FROM tabela_estelionato;`
		err = r.db.QueryRow(query).Scan(&stats.Quantidade)
		if err != nil {
			log.Printf("Erro ao consultar quantidade de BOs: %v", err)
			return CountStats{Quantidade: 0}, nil
		}
	}

	return stats, nil
}

// GetQuantidadeInfratores otimizada usando view materializada
func (r *DashboardRepository) GetQuantidadeInfratores() (CountStats, error) {
	query := `SELECT total_infratores as quantidade FROM mv_contagens_gerais LIMIT 1;`
	
	var stats CountStats
	err := r.db.QueryRow(query).Scan(&stats.Quantidade)
	if err != nil {
		// Fallback para query tradicional
		query = `SELECT COUNT(*) AS quantidade FROM tabela_estelionato WHERE tipo_envolvido = 'Suposto Autor/infrator';`
		err = r.db.QueryRow(query).Scan(&stats.Quantidade)
		if err != nil {
			log.Printf("Erro ao consultar quantidade de infratores: %v", err)
			return CountStats{Quantidade: 0}, nil
		}
	}

	return stats, nil
}

// GetQuantidadeVitimas otimizada usando view materializada
func (r *DashboardRepository) GetQuantidadeVitimas() (CountStats, error) {
	query := `SELECT total_vitimas as quantidade FROM mv_contagens_gerais LIMIT 1;`
	
	var stats CountStats
	err := r.db.QueryRow(query).Scan(&stats.Quantidade)
	if err != nil {
		// Fallback para query tradicional
		query = `SELECT COUNT(*) AS quantidade FROM tabela_estelionato WHERE tipo_envolvido IN ('Comunicante, Vítima', 'Vítima');`
		err = r.db.QueryRow(query).Scan(&stats.Quantidade)
		if err != nil {
			log.Printf("Erro ao consultar quantidade de vítimas: %v", err)
			return CountStats{Quantidade: 0}, nil
		}
	}

	return stats, nil
}

// GetInfratoresPorDelegacia usando view materializada (versão otimizada)
func (r *DashboardRepository) GetInfratoresPorDelegacia() ([]InfratoresPorDelegaciaStats, error) {
	query := `SELECT delegacia_responsavel, quantidade FROM mv_infratores_por_delegacia ORDER BY quantidade DESC LIMIT 5;`
	
	rows, err := r.db.Query(query)
	if err != nil {
		// Fallback para query tradicional
		query = `
			SELECT delegacia_responsavel, COUNT(*) AS quantidade
			FROM tabela_estelionato
			WHERE tipo_envolvido = 'Suposto Autor/infrator'
			  AND delegacia_responsavel != ''
			GROUP BY delegacia_responsavel
			ORDER BY quantidade DESC
			LIMIT 5;`
			
		rows, err = r.db.Query(query)
		if err != nil {
			log.Printf("Erro ao consultar infratores por delegacia: %v", err)
			return []InfratoresPorDelegaciaStats{}, err
		}
	}
	defer rows.Close()

	var stats []InfratoresPorDelegaciaStats
	for rows.Next() {
		var stat InfratoresPorDelegaciaStats
		if err := rows.Scan(&stat.DelegaciaResponsavel, &stat.Quantidade); err != nil {
			log.Printf("Erro ao processar resultado: %v", err)
			return []InfratoresPorDelegaciaStats{}, err
		}
		stats = append(stats, stat)
	}

	if len(stats) == 0 {
		stats = []InfratoresPorDelegaciaStats{
			{DelegaciaResponsavel: "Sem dados", Quantidade: 0},
		}
	}

	return stats, nil
}

// RefreshMaterializedViews atualiza as views materializadas
func (r *DashboardRepository) RefreshMaterializedViews() error {
	views := []string{
		"mv_vitimas_por_sexo",
		"mv_contagens_gerais",
		"mv_infratores_por_delegacia",
	}

	for _, view := range views {
		query := `REFRESH MATERIALIZED VIEW ` + view + `;`
		_, err := r.db.Exec(query)
		if err != nil {
			log.Printf("Erro ao atualizar view materializada %s: %v", view, err)
			return err
		}
		log.Printf("View materializada %s atualizada com sucesso", view)
	}

	return nil
}
