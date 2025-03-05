package repository

import (
	"database/sql"
	"fmt"
)

type RelatorioRepository struct {
	db *sql.DB
}

func NewRelatorioRepository(db *sql.DB) *RelatorioRepository {
	return &RelatorioRepository{db: db}
}

// Estrutura para os dados processados do relatório
type DadosRelatorio struct {
	NumeroBo             string
	DelegaciaResponsavel string
	Situacao             string
	Natureza             string
	DataFato             string
	CepFato              string
	LatitudeFato         string
	LongitudeFato        string
	LogradouroFato       string
	NumeroCasaFato       string
	BairroFato           string
	MunicipioFato        string
	PaisFato             string
	TipoEnvolvido        string
	NomeCompleto         string
	Cpf                  string
	NomeDaMae            string
	Nascimento           string
	Nacionalidade        string
	Naturalidade         string
	UfEnvolvido          string
	SexoEnvolvido        string
	TelefoneEnvolvido    string
	RelatoHistorico      string
}

// InserirDadosRelatorio insere os dados processados do relatório no banco de dados
func (r *RelatorioRepository) InserirDadosRelatorio(dados []DadosRelatorio) (int, error) {
	// Query para inserção na tabela
	query := `
		INSERT INTO tabela_estelionato (
			numero_do_bo, delegacia_responsavel, situacao, natureza,
			data_fato, cep_fato, latitude_fato, longitude_fato, logradouro_fato,
			numerocasa_fato, bairro_fato, municipio_fato, pais_fato,
			tipo_envolvido, nomecompleto, cpf, nomedamae, nascimento,
			nacionalidade, naturalidade, uf_envolvido, sexo_envolvido, 
			telefone_envolvido, relato_historico
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 
			$15, $16, $17, $18, $19, $20, $21, $22, $23, $24
		)
	`
	
	// Iniciar transação
	tx, err := r.db.Begin()
	if err != nil {
		return 0, fmt.Errorf("erro ao iniciar transação: %v", err)
	}
	
	// Preparar statement
	stmt, err := tx.Prepare(query)
	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("erro ao preparar query: %v", err)
	}
	defer stmt.Close()
	
	// Contador de registros inseridos
	registrosInseridos := 0
	
	// Inserir cada registro
	for _, d := range dados {
		_, err := stmt.Exec(
			d.NumeroBo, d.DelegaciaResponsavel, d.Situacao, d.Natureza,
			d.DataFato, d.CepFato, d.LatitudeFato, d.LongitudeFato, d.LogradouroFato,
			d.NumeroCasaFato, d.BairroFato, d.MunicipioFato, d.PaisFato,
			d.TipoEnvolvido, d.NomeCompleto, d.Cpf, d.NomeDaMae, d.Nascimento,
			d.Nacionalidade, d.Naturalidade, d.UfEnvolvido, d.SexoEnvolvido,
			d.TelefoneEnvolvido, d.RelatoHistorico,
		)
		
		if err != nil {
			tx.Rollback()
			return 0, fmt.Errorf("erro ao inserir registro: %v", err)
		}
		
		registrosInseridos++
	}
	
	// Commit da transação
	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("erro ao finalizar transação: %v", err)
	}
	
	return registrosInseridos, nil
}
