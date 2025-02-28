package repository

import (
	"database/sql"
	"log"
)

type DelegaciaRepository struct {
	db *sql.DB
}

type Delegacia struct {
	Nome string `json:"nome"`
}

func NewDelegaciaRepository(db *sql.DB) *DelegaciaRepository {
	return &DelegaciaRepository{db: db}
}

func (r *DelegaciaRepository) GetAllDelegacias() ([]Delegacia, error) {
	log.Println("Executando query para buscar delegacias")
	
	rows, err := r.db.Query("SELECT DISTINCT nome FROM delegacias WHERE nome IS NOT NULL ORDER BY nome")
	if err != nil {
		log.Printf("Erro na query SQL para delegacias: %v", err)
		return nil, err
	}
	defer rows.Close()
	
	var delegacias []Delegacia
	for rows.Next() {
		var d Delegacia
		var nomeNullable sql.NullString
		
		if err := rows.Scan(&nomeNullable); err != nil {
			log.Printf("Erro ao escanear resultado de delegacia: %v", err)
			return nil, err
		}
		
		if nomeNullable.Valid {
			d.Nome = nomeNullable.String
			delegacias = append(delegacias, d)
		}
	}
	
	if err = rows.Err(); err != nil {
		log.Printf("Erro ao iterar resultados de delegacia: %v", err)
		return nil, err
	}
	
	log.Printf("Query executada com sucesso, %d delegacias encontradas", len(delegacias))
	return delegacias, nil
}
