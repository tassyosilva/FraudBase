package repository

import (
	"database/sql"
	"log"
)

type LimpezaRepository struct {
	db *sql.DB
}

func NewLimpezaRepository(db *sql.DB) *LimpezaRepository {
	return &LimpezaRepository{db: db}
}

// LimparRegistrosDuplicados remove registros duplicados da tabela tabela_estelionato
// e retorna o número de registros antes, depois e quantos foram removidos
func (r *LimpezaRepository) LimparRegistrosDuplicados() (int, int, error) {
	// Contar registros antes da limpeza
	var totalAntes int
	err := r.db.QueryRow("SELECT COUNT(*) FROM tabela_estelionato").Scan(&totalAntes)
	if err != nil {
		log.Printf("Erro ao contar registros antes da limpeza: %v", err)
		return 0, 0, err
	}

	// Executar a query de limpeza
	cleanQuery := `
	DELETE FROM tabela_estelionato
	WHERE ctid NOT IN (
		SELECT MIN(ctid)
		FROM tabela_estelionato
		GROUP BY numero_do_bo, tipo_envolvido, nomecompleto, cpf, nomedamae, 
			nascimento, nacionalidade, naturalidade, uf_envolvido, sexo_envolvido, 
			telefone_envolvido, data_fato, cep_fato, latitude_fato, longitude_fato, 
			logradouro_fato, numerocasa_fato, bairro_fato, municipio_fato, pais_fato, 
			delegacia_responsavel, situacao, natureza, relato_historico, instituicao_bancaria, 
			endereco_ip, valor, pix_utilizado, numero_conta_bancaria, numero_boleto, 
			processo_banco, numero_agencia_bancaria, cartao, terminal, tipo_pagamento, 
			orgao_concessionaria, veiculo, terminal_conexao, erb, operacao_policial, 
			numero_laudo_pericial
	);`

	_, err = r.db.Exec(cleanQuery)
	if err != nil {
		log.Printf("Erro ao remover duplicatas: %v", err)
		return 0, 0, err
	}

	// Contar registros após a limpeza
	var totalDepois int
	err = r.db.QueryRow("SELECT COUNT(*) FROM tabela_estelionato").Scan(&totalDepois)
	if err != nil {
		log.Printf("Erro ao contar registros após limpeza: %v", err)
		return totalAntes, 0, err
	}

	log.Printf("Limpeza de duplicatas concluída. Registros antes: %d, depois: %d, removidos: %d", 
		totalAntes, totalDepois, totalAntes-totalDepois)
	
	return totalAntes, totalDepois, nil
}
