package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"fraudbase/internal/models"
	"log"
	"strings"
)

// ErrNotFound é retornado quando não encontramos o registro
var ErrNotFound = errors.New("registro não encontrado")

// ConsultaRepository manipula operações de consulta no banco de dados
type ConsultaRepository struct {
	db *sql.DB
}

// NewConsultaRepository cria um novo repository para consultas
func NewConsultaRepository(db *sql.DB) *ConsultaRepository {
	return &ConsultaRepository{db: db}
}

// FindEnvolvidos busca envolvidos com os filtros especificados
func (r *ConsultaRepository) FindEnvolvidos(nome, cpf, bo, pix string) ([]models.Envolvido, error) {
	query := `SELECT id, numero_do_bo, tipo_envolvido, nomecompleto, cpf, 
	COALESCE(nomedamae, '') as nomedamae,
	COALESCE(nascimento, '') as nascimento, 
	COALESCE(nacionalidade, '') as nacionalidade, 
	COALESCE(naturalidade, '') as naturalidade, 
	COALESCE(uf_envolvido, '') as uf_envolvido, 
	COALESCE(sexo_envolvido, '') as sexo_envolvido,
	COALESCE(telefone_envolvido, '') as telefone_envolvido, 
	COALESCE(data_fato, '') as data_fato, 
	COALESCE(delegacia_responsavel, '') as delegacia_responsavel, 
	COALESCE(situacao, '') as situacao, 
	COALESCE(natureza, '') as natureza
	FROM tabela_estelionato WHERE 1=1`

	var params []interface{}
	var conditions []string
	paramIndex := 1

	// Adicionar condições se os filtros estiverem presentes
	if nome != "" {
		conditions = append(conditions, fmt.Sprintf("nomecompleto ILIKE $%d", paramIndex))
		params = append(params, "%"+nome+"%")
		paramIndex++
	}
	if cpf != "" {
		conditions = append(conditions, fmt.Sprintf("cpf LIKE $%d", paramIndex))
		params = append(params, "%"+cpf+"%")
		paramIndex++
	}
	if bo != "" {
		conditions = append(conditions, fmt.Sprintf("numero_do_bo LIKE $%d", paramIndex))
		params = append(params, "%"+bo+"%")
		paramIndex++
	}
	
	// Adicionar condição para PIX
	if pix != "" {
		conditions = append(conditions, fmt.Sprintf("pix_utilizado LIKE $%d", paramIndex))
		params = append(params, "%"+pix+"%")
		paramIndex++
	}

	// Anexar condições à consulta
	if len(conditions) > 0 {
		query += " AND " + strings.Join(conditions, " AND ")
	}

	// Ordenar por ID
	query += " ORDER BY id DESC"

	// Executar a consulta
	rows, err := r.db.Query(query, params...)
	if err != nil {
		log.Printf("Erro na consulta SQL: %v", err)
		return nil, err
	}
	defer rows.Close()

	// Processar resultados
	var envolvidos []models.Envolvido
	for rows.Next() {
		var e models.Envolvido
		if err := rows.Scan(
			&e.ID, &e.NumeroBO, &e.TipoEnvolvido, &e.NomeCompleto, &e.CPF, &e.NomeMae,
			&e.Nascimento, &e.Nacionalidade, &e.Naturalidade, &e.UFEnvolvido, &e.SexoEnvolvido,
			&e.TelefoneEnvolvido, &e.DataFato, &e.DelegaciaResponsavel, &e.Situacao, &e.Natureza,
		); err != nil {
			log.Printf("Erro ao escanear resultado: %v", err)
			return nil, err
		}
		envolvidos = append(envolvidos, e)
	}

	// Verificar erros após a iteração
	if err := rows.Err(); err != nil {
		log.Printf("Erro após iteração: %v", err)
		return nil, err
	}

	return envolvidos, nil
}

// FindEnvolvidoById busca um envolvido específico pelo ID
func (r *ConsultaRepository) FindEnvolvidoById(id int) (models.Envolvido, error) {
	query := `SELECT id, numero_do_bo, tipo_envolvido, nomecompleto, cpf, 
              COALESCE(nomedamae, '') as nomedamae,
              COALESCE(nascimento, '') as nascimento, 
              COALESCE(nacionalidade, '') as nacionalidade, 
              COALESCE(naturalidade, '') as naturalidade, 
              COALESCE(uf_envolvido, '') as uf_envolvido, 
              COALESCE(sexo_envolvido, '') as sexo_envolvido,
              COALESCE(telefone_envolvido, '') as telefone_envolvido, 
              COALESCE(data_fato, '') as data_fato,
              COALESCE(cep_fato, '') as cep_fato, 
              COALESCE(latitude_fato, '') as latitude_fato, 
              COALESCE(longitude_fato, '') as longitude_fato,
              COALESCE(logradouro_fato, '') as logradouro_fato, 
              COALESCE(numerocasa_fato, '') as numerocasa_fato, 
              COALESCE(bairro_fato, '') as bairro_fato, 
              COALESCE(municipio_fato, '') as municipio_fato, 
              COALESCE(pais_fato, '') as pais_fato,
              COALESCE(delegacia_responsavel, '') as delegacia_responsavel, 
              COALESCE(situacao, '') as situacao, 
              COALESCE(natureza, '') as natureza, 
              COALESCE(relato_historico, '') as relato_historico, 
              COALESCE(instituicao_bancaria, '') as instituicao_bancaria,
              COALESCE(endereco_ip, '') as endereco_ip, 
              COALESCE(valor, '') as valor, 
              COALESCE(pix_utilizado, '') as pix_utilizado, 
              COALESCE(numero_conta_bancaria, '') as numero_conta_bancaria, 
              COALESCE(numero_boleto, '') as numero_boleto,
              COALESCE(processo_banco, '') as processo_banco, 
              COALESCE(numero_agencia_bancaria, '') as numero_agencia_bancaria, 
              COALESCE(cartao, '') as cartao, 
              COALESCE(terminal, '') as terminal, 
              COALESCE(tipo_pagamento, '') as tipo_pagamento,
              COALESCE(orgao_concessionaria, '') as orgao_concessionaria, 
              COALESCE(veiculo, '') as veiculo, 
              COALESCE(terminal_conexao, '') as terminal_conexao, 
              COALESCE(erb, '') as erb, 
              COALESCE(operacao_policial, '') as operacao_policial,
              COALESCE(numero_laudo_pericial, '') as numero_laudo_pericial
              FROM tabela_estelionato WHERE id = $1`

	var e models.Envolvido
	err := r.db.QueryRow(query, id).Scan(
		&e.ID, &e.NumeroBO, &e.TipoEnvolvido, &e.NomeCompleto, &e.CPF, &e.NomeMae,
		&e.Nascimento, &e.Nacionalidade, &e.Naturalidade, &e.UFEnvolvido, &e.SexoEnvolvido,
		&e.TelefoneEnvolvido, &e.DataFato, &e.CEPFato, &e.LatitudeFato, &e.LongitudeFato,
		&e.LogradouroFato, &e.NumeroCasaFato, &e.BairroFato, &e.MunicipioFato, &e.PaisFato,
		&e.DelegaciaResponsavel, &e.Situacao, &e.Natureza, &e.RelatoHistorico, &e.InstituicaoBancaria,
		&e.EnderecoIP, &e.Valor, &e.PixUtilizado, &e.NumeroContaBancaria, &e.NumeroBoleto,
		&e.ProcessoBanco, &e.NumeroAgenciaBancaria, &e.Cartao, &e.Terminal, &e.TipoPagamento,
		&e.OrgaoConcessionaria, &e.Veiculo, &e.TerminalConexao, &e.ERB, &e.OperacaoPolicial,
		&e.NumeroLaudoPericial,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return models.Envolvido{}, ErrNotFound
		}
		log.Printf("Erro ao buscar envolvido por ID: %v", err)
		return models.Envolvido{}, err
	}

	return e, nil
}