package repository

import (
	"database/sql"
	"log"
)

type MunicipioRepository struct {
	db *sql.DB
}

type Municipio struct {
	Municipio string `json:"municipio"`
}

func NewMunicipioRepository(db *sql.DB) *MunicipioRepository {
	return &MunicipioRepository{db: db}
}

func (r *MunicipioRepository) GetAllMunicipios() ([]Municipio, error) {
	log.Println("Executando query para buscar municípios")
	
	// Modificando a query para ignorar valores NULL
	rows, err := r.db.Query("SELECT DISTINCT municipio FROM municipios_e_estados WHERE municipio IS NOT NULL ORDER BY municipio")
	if err != nil {
		log.Printf("Erro na query SQL: %v", err)
		return nil, err
	}
	defer rows.Close()
	
	var municipios []Municipio
	for rows.Next() {
		var m Municipio
		var municipioNullable sql.NullString
		
		if err := rows.Scan(&municipioNullable); err != nil {
			log.Printf("Erro ao escanear resultado: %v", err)
			return nil, err
		}
		
		// Convertendo o valor nullable para string
		if municipioNullable.Valid {
			m.Municipio = municipioNullable.String
			municipios = append(municipios, m)
		}
	}
	
	if err = rows.Err(); err != nil {
		log.Printf("Erro ao iterar resultados: %v", err)
		return nil, err
	}
	
	log.Printf("Query executada com sucesso, %d municípios encontrados", len(municipios))
	return municipios, nil
}

type UF struct {
	UF string `json:"uf"`
}

func (r *MunicipioRepository) GetAllUFs() ([]UF, error) {
	log.Println("Executando query para buscar UFs")
	
	rows, err := r.db.Query("SELECT DISTINCT uf FROM municipios_e_estados WHERE uf IS NOT NULL ORDER BY uf")
	if err != nil {
		log.Printf("Erro na query SQL para UFs: %v", err)
		return nil, err
	}
	defer rows.Close()
	
	var ufs []UF
	for rows.Next() {
		var u UF
		var ufNullable sql.NullString
		
		if err := rows.Scan(&ufNullable); err != nil {
			log.Printf("Erro ao escanear resultado de UF: %v", err)
			return nil, err
		}
		
		if ufNullable.Valid {
			u.UF = ufNullable.String
			ufs = append(ufs, u)
		}
	}
	
	if err = rows.Err(); err != nil {
		log.Printf("Erro ao iterar resultados de UF: %v", err)
		return nil, err
	}
	
	log.Printf("Query executada com sucesso, %d UFs encontradas", len(ufs))
	return ufs, nil
}
