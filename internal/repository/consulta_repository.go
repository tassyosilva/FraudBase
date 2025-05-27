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

// FindEnvolvidos busca envolvidos com os filtros especificados (versão otimizada)
func (r *ConsultaRepository) FindEnvolvidos(nome, cpf, bo, telefone string) ([]models.Envolvido, error) {
	// Query base otimizada com LIMIT para evitar resultados excessivos
	query := `
	SELECT id, numero_do_bo, tipo_envolvido, nomecompleto, cpf,
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
	FROM tabela_estelionato
	WHERE 1=1`

	var params []interface{}
	var conditions []string
	paramIndex := 1

	// Otimização: usar busca trigram para nomes
	if nome != "" {
		conditions = append(conditions, fmt.Sprintf("nomecompleto %% $%d", paramIndex))
		params = append(params, nome)
		paramIndex++
	}

	// Busca exata otimizada para CPF
	if cpf != "" {
		conditions = append(conditions, fmt.Sprintf("cpf = $%d", paramIndex))
		params = append(params, cpf)
		paramIndex++
	}

	// Busca exata para BO
	if bo != "" {
		conditions = append(conditions, fmt.Sprintf("numero_do_bo = $%d", paramIndex))
		params = append(params, bo)
		paramIndex++
	}

	// Busca exata para telefone
	if telefone != "" {
		conditions = append(conditions, fmt.Sprintf("telefone_envolvido = $%d", paramIndex))
		params = append(params, telefone)
		paramIndex++
	}

	// Anexar condições à consulta
	if len(conditions) > 0 {
		query += " AND " + strings.Join(conditions, " AND ")
	}

	// Ordenar e limitar resultados para performance
	query += " ORDER BY id DESC LIMIT 1000"

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

	if err := rows.Err(); err != nil {
		log.Printf("Erro após iteração: %v", err)
		return nil, err
	}

	return envolvidos, nil
}

// FindEnvolvidosPaginated busca envolvidos com paginação real
func (r *ConsultaRepository) FindEnvolvidosPaginated(nome, cpf, bo, telefone string, page, limit int) ([]models.Envolvido, int, error) {
	// Query para contar total de registros
	baseCountQuery := `SELECT COUNT(*) FROM tabela_estelionato WHERE 1=1`
	
	// Query principal com paginação
	baseQuery := `
	SELECT id, numero_do_bo, tipo_envolvido, nomecompleto, cpf, 
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

	// BUSCA POR NOME - usando ILIKE para busca parcial case-insensitive
	if nome != "" {
		conditions = append(conditions, fmt.Sprintf("UPPER(nomecompleto) LIKE UPPER($%d)", paramIndex))
		params = append(params, "%"+nome+"%") // Busca parcial
		paramIndex++
	}
	
	// BUSCA POR CPF - busca exata apenas nos números
	if cpf != "" {
		// Remove caracteres não numéricos do CPF para busca
		cleanCPF := strings.ReplaceAll(strings.ReplaceAll(strings.ReplaceAll(cpf, ".", ""), "-", ""), " ", "")
		conditions = append(conditions, fmt.Sprintf("REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') = $%d", paramIndex))
		params = append(params, cleanCPF)
		paramIndex++
	}
	
	// BUSCA POR BO - usando ILIKE para busca parcial
	if bo != "" {
		conditions = append(conditions, fmt.Sprintf("numero_do_bo ILIKE $%d", paramIndex))
		params = append(params, "%"+bo+"%") // Busca parcial
		paramIndex++
	}
	
	// BUSCA POR TELEFONE - busca parcial nos números do telefone
	if telefone != "" {
		// Remove caracteres não numéricos para busca mais flexível
		cleanTelefone := strings.ReplaceAll(strings.ReplaceAll(strings.ReplaceAll(strings.ReplaceAll(telefone, "+", ""), " ", ""), "(", ""), ")", "")
		conditions = append(conditions, fmt.Sprintf("REGEXP_REPLACE(telefone_envolvido, '[^0-9]', '', 'g') LIKE $%d", paramIndex))
		params = append(params, "%"+cleanTelefone+"%") // Busca parcial
		paramIndex++
	}

	// Anexar condições
	whereClause := ""
	if len(conditions) > 0 {
		whereClause = " AND " + strings.Join(conditions, " AND ")
	}

	// Contar total de registros
	countQuery := baseCountQuery + whereClause
	var totalCount int
	err := r.db.QueryRow(countQuery, params...).Scan(&totalCount)
	if err != nil {
		log.Printf("Erro na consulta de contagem: %v", err)
		return nil, 0, err
	}

	// Query principal com paginação
	offset := (page - 1) * limit
	query := baseQuery + whereClause + fmt.Sprintf(" ORDER BY id DESC LIMIT $%d OFFSET $%d", paramIndex, paramIndex+1)
	params = append(params, limit, offset)

	// Executar consulta principal
	rows, err := r.db.Query(query, params...)
	if err != nil {
		log.Printf("Erro na consulta SQL: %v", err)
		return nil, 0, err
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
			return nil, 0, err
		}
		envolvidos = append(envolvidos, e)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Erro após iteração: %v", err)
		return nil, 0, err
	}

	return envolvidos, totalCount, nil
}

// FindEnvolvidoById busca um envolvido específico pelo ID
func (r *ConsultaRepository) FindEnvolvidoById(id int) (models.Envolvido, error) {
	query := `
	SELECT id, numero_do_bo, tipo_envolvido, nomecompleto, cpf,
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
