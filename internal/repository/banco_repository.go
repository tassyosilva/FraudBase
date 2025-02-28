package repository

import (
	"database/sql"
	"log"
)

type BancoRepository struct {
	db *sql.DB
}

type Banco struct {
	NomeCompleto string `json:"nome_completo"`
}

func NewBancoRepository(db *sql.DB) *BancoRepository {
	return &BancoRepository{db: db}
}

func (r *BancoRepository) GetAllBancos() ([]Banco, error) {
	log.Println("Executando query para buscar bancos")
	
	rows, err := r.db.Query("SELECT DISTINCT nome_completo FROM bancos WHERE nome_completo IS NOT NULL ORDER BY nome_completo")
	if err != nil {
		log.Printf("Erro na query SQL para bancos: %v", err)
		return nil, err
	}
	defer rows.Close()
	
	var bancos []Banco
	for rows.Next() {
		var b Banco
		var nomeNullable sql.NullString
		
		if err := rows.Scan(&nomeNullable); err != nil {
			log.Printf("Erro ao escanear resultado de banco: %v", err)
			return nil, err
		}
		
		if nomeNullable.Valid {
			b.NomeCompleto = nomeNullable.String
			bancos = append(bancos, b)
		}
	}
	
	if err = rows.Err(); err != nil {
		log.Printf("Erro ao iterar resultados de bancos: %v", err)
		return nil, err
	}
	
	log.Printf("Query executada com sucesso, %d bancos encontrados", len(bancos))
	return bancos, nil
}
