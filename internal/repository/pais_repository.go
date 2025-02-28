package repository

import (
	"database/sql"
	"log"
)

type PaisRepository struct {
	db *sql.DB
}

type Pais struct {
	NomePais string `json:"nome_pais"`
}

func NewPaisRepository(db *sql.DB) *PaisRepository {
	return &PaisRepository{db: db}
}

func (r *PaisRepository) GetAllPaises() ([]Pais, error) {
	log.Println("Executando query para buscar países")
	
	rows, err := r.db.Query("SELECT DISTINCT nome_pais FROM paises WHERE nome_pais IS NOT NULL ORDER BY nome_pais")
	if err != nil {
		log.Printf("Erro na query SQL para países: %v", err)
		return nil, err
	}
	defer rows.Close()
	
	var paises []Pais
	for rows.Next() {
		var p Pais
		var paisNullable sql.NullString
		
		if err := rows.Scan(&paisNullable); err != nil {
			log.Printf("Erro ao escanear resultado de país: %v", err)
			return nil, err
		}
		
		if paisNullable.Valid {
			p.NomePais = paisNullable.String
			paises = append(paises, p)
		}
	}
	
	if err = rows.Err(); err != nil {
		log.Printf("Erro ao iterar resultados de país: %v", err)
		return nil, err
	}
	
	log.Printf("Query executada com sucesso, %d países encontrados", len(paises))
	return paises, nil
}
