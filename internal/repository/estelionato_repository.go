package repository

import (
	"database/sql"
	"log"
	"time"
)

type EnvolvidoRepository struct {
	db *sql.DB
}

type Envolvido struct {
	ID                     string `json:"id,omitempty"`
	NumeroDoBo             string `json:"numero_do_bo"`
	TipoEnvolvido          string `json:"tipo_envolvido"`
	NomeCompleto           string `json:"nomecompleto"`
	CPF                    string `json:"cpf"`
	NomeDaMae              string `json:"nomedamae"`
	Nascimento             string `json:"nascimento"`
	Nacionalidade          string `json:"nacionalidade"`
	Naturalidade           string `json:"naturalidade"`
	UFEnvolvido            string `json:"uf_envolvido"`
	SexoEnvolvido          string `json:"sexo_envolvido"`
	TelefoneEnvolvido      string `json:"telefone_envolvido"`
	DataFato               string `json:"data_fato"`
	CEPFato                string `json:"cep_fato"`
	LatitudeFato           string `json:"latitude_fato"`
	LongitudeFato          string `json:"longitude_fato"`
	LogradouroFato         string `json:"logradouro_fato"`
	NumeroCasaFato         string `json:"numerocasa_fato"`
	BairroFato             string `json:"bairro_fato"`
	MunicipioFato          string `json:"municipio_fato"`
	PaisFato               string `json:"pais_fato"`
	DelegaciaResponsavel   string `json:"delegacia_responsavel"`
	Situacao               string `json:"situacao"`
	Natureza               string `json:"natureza"`
	RelatoHistorico        string `json:"relato_historico"`
	InstituicaoBancaria    string `json:"instituicao_bancaria"`
	EnderecoIP             string `json:"endereco_ip"`
	Valor                  string `json:"valor"`
	PixUtilizado           string `json:"pix_utilizado"`
	NumeroContaBancaria    string `json:"numero_conta_bancaria"`
	NumeroBoleto           string `json:"numero_boleto"`
	ProcessoBanco          string `json:"processo_banco"`
	NumeroAgenciaBancaria  string `json:"numero_agencia_bancaria"`
	Cartao                 string `json:"cartao"`
	Terminal               string `json:"terminal"`
	TipoPagamento          string `json:"tipo_pagamento"`
	OrgaoConcessionaria    string `json:"orgao_concessionaria"`
	Veiculo                string `json:"veiculo"`
	TerminalConexao        string `json:"terminal_conexao"`
	ERB                    string `json:"erb"`
	OperacaoPolicial       string `json:"operacao_policial"`
	NumeroLaudoPericial    string `json:"numero_laudo_pericial"`
}

func NewEnvolvidoRepository(db *sql.DB) *EnvolvidoRepository {
	return &EnvolvidoRepository{db: db}
}

func (r *EnvolvidoRepository) CreateEnvolvido(e Envolvido) (string, error) {
	log.Println("Iniciando cadastro de envolvido em caso de estelionato")
	
	// Converter data de nascimento para formato brasileiro
	nascimento := e.Nascimento
	if nascimento != "" {
		if t, err := time.Parse("2006-01-02", nascimento); err == nil {
			nascimento = t.Format("02/01/2006")
		}
	}
	
	// Converter data do fato para formato brasileiro
	dataFato := e.DataFato
	if dataFato != "" {
		if t, err := time.Parse("2006-01-02", dataFato); err == nil {
			dataFato = t.Format("02/01/2006")
		}
	}
	
	query := `
		INSERT INTO tabela_estelionato (
			numero_do_bo, tipo_envolvido, nomecompleto, cpf, nomedamae, 
			nascimento, nacionalidade, naturalidade, uf_envolvido, sexo_envolvido, 
			telefone_envolvido, data_fato, cep_fato, latitude_fato, longitude_fato, 
			logradouro_fato, numerocasa_fato, bairro_fato, municipio_fato, pais_fato, 
			delegacia_responsavel, situacao, natureza, relato_historico, instituicao_bancaria, 
			endereco_ip, valor, pix_utilizado, numero_conta_bancaria, numero_boleto, 
			processo_banco, numero_agencia_bancaria, cartao, terminal, tipo_pagamento, 
			orgao_concessionaria, veiculo, terminal_conexao, erb, operacao_policial, 
			numero_laudo_pericial
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
			$11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
			$21, $22, $23, $24, $25, $26, $27, $28, $29, $30, 
			$31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41
		) RETURNING id`
	
	var id string
	err := r.db.QueryRow(
		query,
		e.NumeroDoBo, e.TipoEnvolvido, e.NomeCompleto, e.CPF, e.NomeDaMae,
		nascimento, e.Nacionalidade, e.Naturalidade, e.UFEnvolvido, e.SexoEnvolvido, 
		e.TelefoneEnvolvido, dataFato, e.CEPFato, e.LatitudeFato, e.LongitudeFato,
		e.LogradouroFato, e.NumeroCasaFato, e.BairroFato, e.MunicipioFato, e.PaisFato,
		e.DelegaciaResponsavel, e.Situacao, e.Natureza, e.RelatoHistorico, e.InstituicaoBancaria,
		e.EnderecoIP, e.Valor, e.PixUtilizado, e.NumeroContaBancaria, e.NumeroBoleto,
		e.ProcessoBanco, e.NumeroAgenciaBancaria, e.Cartao, e.Terminal, e.TipoPagamento,
		e.OrgaoConcessionaria, e.Veiculo, e.TerminalConexao, e.ERB, e.OperacaoPolicial,
		e.NumeroLaudoPericial,
	).Scan(&id)
	
	if err != nil {
		log.Printf("Erro ao inserir dados na tabela_estelionato: %v", err)
		return "", err
	}
	
	log.Printf("Envolvido cadastrado com sucesso. ID: %s", id)
	return id, nil
}
