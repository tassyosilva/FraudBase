package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"time"
	"log"
	"fraudbase/internal/database"
)

type RelatorioRepository struct {
	DB *sql.DB // MUDANÇA: Tornar público (maiúsculo)
}

func NewRelatorioRepository(db *sql.DB) *RelatorioRepository {
	return &RelatorioRepository{DB: db} // MUDANÇA: usar DB maiúsculo
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

// InserirDadosRelatorio - versão otimizada com verificação de duplicatas
func (r *RelatorioRepository) InserirDadosRelatorio(dados []DadosRelatorio) (int, int, error) {
	if len(dados) == 0 {
		return 0, 0, nil
	}

	log.Printf("Iniciando inserção de %d registros com verificação de duplicatas...", len(dados))

	// Verificar e remover duplicatas
	dadosUnicos, duplicatasRemovidas, err := r.VerificarDuplicatas(dados)
	if err != nil {
		return 0, 0, fmt.Errorf("erro ao verificar duplicatas: %v", err)
	}

	if len(dadosUnicos) == 0 {
		log.Println("Todos os registros são duplicatas, nenhum registro será inserido")
		return 0, duplicatasRemovidas, nil
	}

	log.Printf("Inserindo %d registros únicos (%d duplicatas removidas)...", len(dadosUnicos), duplicatasRemovidas)

	// Inserir apenas os dados únicos
	registrosInseridos, err := r.inserirDadosNormal(dadosUnicos)
	if err != nil {
		return registrosInseridos, duplicatasRemovidas, err
	}

	// Atualizar views materializadas após inserção
	go func() {
		time.Sleep(1 * time.Second) // Pequeno delay
		database.RefreshMaterializedViews(r.DB)
		log.Println("Views materializadas atualizadas após inserção")
	}()

	log.Printf("Inserção concluída: %d registros inseridos, %d duplicatas evitadas", registrosInseridos, duplicatasRemovidas)
	return registrosInseridos, duplicatasRemovidas, nil
}

// Função para inserção em lotes otimizada
func (r *RelatorioRepository) inserirDadosNormal(dados []DadosRelatorio) (int, error) {
	// Query preparada para inserção em lote
	query := `INSERT INTO tabela_estelionato (
		numero_do_bo, delegacia_responsavel, situacao, natureza,
		data_fato, cep_fato, latitude_fato, longitude_fato, logradouro_fato,
		numerocasa_fato, bairro_fato, municipio_fato, pais_fato,
		tipo_envolvido, nomecompleto, cpf, nomedamae, nascimento,
		nacionalidade, naturalidade, uf_envolvido, sexo_envolvido,
		telefone_envolvido, relato_historico) VALUES `

	batchSize := 500 // Lotes para evitar timeout
	registrosInseridos := 0

	for i := 0; i < len(dados); i += batchSize {
		end := i + batchSize
		if end > len(dados) {
			end = len(dados)
		}

		batch := dados[i:end]

		// Construir placeholders
		valueStrings := make([]string, 0, len(batch))
		valueArgs := make([]interface{}, 0, len(batch)*24)

		for j, d := range batch {
			valueStrings = append(valueStrings, fmt.Sprintf("($%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d)",
				j*24+1, j*24+2, j*24+3, j*24+4, j*24+5, j*24+6, j*24+7, j*24+8, j*24+9, j*24+10,
				j*24+11, j*24+12, j*24+13, j*24+14, j*24+15, j*24+16, j*24+17, j*24+18, j*24+19, j*24+20,
				j*24+21, j*24+22, j*24+23, j*24+24))

			valueArgs = append(valueArgs,
				d.NumeroBo, d.DelegaciaResponsavel, d.Situacao, d.Natureza,
				d.DataFato, d.CepFato, d.LatitudeFato, d.LongitudeFato, d.LogradouroFato,
				d.NumeroCasaFato, d.BairroFato, d.MunicipioFato, d.PaisFato,
				d.TipoEnvolvido, d.NomeCompleto, d.Cpf, d.NomeDaMae, d.Nascimento,
				d.Nacionalidade, d.Naturalidade, d.UfEnvolvido, d.SexoEnvolvido,
				d.TelefoneEnvolvido, d.RelatoHistorico,
			)
		}

		// Executar inserção do lote
		batchQuery := query + strings.Join(valueStrings, ",")
		_, err := r.DB.Exec(batchQuery, valueArgs...) // MUDANÇA: usar r.DB
		if err != nil {
			return registrosInseridos, fmt.Errorf("erro ao inserir lote: %v", err)
		}

		registrosInseridos += len(batch)

		// Log de progresso
		if registrosInseridos%2500 == 0 {
			log.Printf("Inseridos %d registros...", registrosInseridos)
		}
	}

	log.Printf("Inserção em lotes concluída: %d registros", registrosInseridos)
	return registrosInseridos, nil
}

// VerificarDuplicatas verifica quais registros já existem no banco
func (r *RelatorioRepository) VerificarDuplicatas(dados []DadosRelatorio) ([]DadosRelatorio, int, error) {
	if len(dados) == 0 {
		return dados, 0, nil
	}

	log.Printf("Verificando duplicatas para %d registros...", len(dados))

	// Criar um mapa para armazenar hashes dos registros do banco
	existingHashes := make(map[string]bool)
	duplicatesCount := 0

	// Buscar registros existentes em lotes para não sobrecarregar a memória
	batchSize := 1000
	var dadosUnicos []DadosRelatorio

	for i := 0; i < len(dados); i += batchSize {
		end := i + batchSize
		if end > len(dados) {
			end = len(dados)
		}

		batch := dados[i:end]
		uniqueBatch, duplicatesInBatch := r.filtrarDuplicatasBatch(batch, existingHashes)
		dadosUnicos = append(dadosUnicos, uniqueBatch...)
		duplicatesCount += duplicatesInBatch

		// Log de progresso
		if i%5000 == 0 {
			log.Printf("Verificados %d registros, %d duplicatas encontradas...", i, duplicatesCount)
		}
	}

	log.Printf("Verificação concluída: %d registros únicos, %d duplicatas removidas", len(dadosUnicos), duplicatesCount)
	return dadosUnicos, duplicatesCount, nil
}

// filtrarDuplicatasBatch processa um lote de dados verificando duplicatas
func (r *RelatorioRepository) filtrarDuplicatasBatch(batch []DadosRelatorio, existingHashes map[string]bool) ([]DadosRelatorio, int) {
	var uniqueData []DadosRelatorio
	duplicatesCount := 0

	// Criar query para verificar se os registros já existem
	// Usando uma abordagem eficiente com hash dos campos principais
	for _, registro := range batch {
		// Criar hash único do registro baseado em campos chave
		hashKey := r.criarHashRegistro(registro)

		// Se já processamos este hash, é duplicata
		if existingHashes[hashKey] {
			duplicatesCount++
			continue
		}

		// Verificar se existe no banco usando campos únicos mais prováveis
		exists, err := r.verificarExistenciaRegistro(registro)
		if err != nil {
			log.Printf("Erro ao verificar registro: %v", err)
			// Em caso de erro, incluir o registro (melhor incluir que perder)
			uniqueData = append(uniqueData, registro)
			existingHashes[hashKey] = true
			continue
		}

		if exists {
			duplicatesCount++
			existingHashes[hashKey] = true
		} else {
			uniqueData = append(uniqueData, registro)
			existingHashes[hashKey] = true
		}
	}

	return uniqueData, duplicatesCount
}

// GetEstadoUsuario obtém o estado do usuário pelo ID
func (r *RelatorioRepository) GetEstadoUsuario(userID int) (string, error) {
	var estado sql.NullString
	query := `SELECT estado FROM usuarios WHERE id = $1`
	
	err := r.DB.QueryRow(query, userID).Scan(&estado)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("usuário não encontrado")
		}
		return "", fmt.Errorf("erro ao buscar estado do usuário: %v", err)
	}
	
	if !estado.Valid {
		return "", nil // Estado não informado
	}
	
	return estado.String, nil
}

// criarHashRegistro cria um hash único baseado nos campos principais
func (r *RelatorioRepository) criarHashRegistro(registro DadosRelatorio) string {
	// Usar o número do BO como está (já com sufixo)
	return fmt.Sprintf("%s|%s|%s|%s|%s|%s", 
		registro.NumeroBo,      // Já com sufixo do estado
		registro.TipoEnvolvido, 
		registro.NomeCompleto,
		registro.Cpf,
		registro.TelefoneEnvolvido,
		registro.DataFato)
}

// verificarExistenciaRegistro verifica se um registro específico já existe (MÉTODO OTIMIZADO)
func (r *RelatorioRepository) verificarExistenciaRegistro(registro DadosRelatorio) (bool, error) {
	// Query OTIMIZADA - verificação direta sem variações
	query := `
		SELECT 1 FROM tabela_estelionato 
		WHERE numero_do_bo = $1
		  AND COALESCE(tipo_envolvido, '') = $2
		  AND COALESCE(nomecompleto, '') = $3
		  AND COALESCE(cpf, '') = $4
		  AND COALESCE(telefone_envolvido, '') = $5
		  AND COALESCE(data_fato, '') = $6
		LIMIT 1`
	
	var exists int
	err := r.DB.QueryRow(query, 
		registro.NumeroBo,  // Já vem com sufixo do estado
		registro.TipoEnvolvido,
		registro.NomeCompleto,
		registro.Cpf,
		registro.TelefoneEnvolvido,
		registro.DataFato,
	).Scan(&exists)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	
	return true, nil
}

// Método alternativo mais rigoroso (verifica TODOS os campos)
func (r *RelatorioRepository) verificarExistenciaCompleta(registro DadosRelatorio) (bool, error) {
	// Query que verifica TODOS os campos (como a limpeza de duplicatas faz)
	query := `SELECT 1 FROM tabela_estelionato
	WHERE numero_do_bo = $1
	  AND COALESCE(delegacia_responsavel, '') = $2
	  AND COALESCE(situacao, '') = $3
	  AND COALESCE(natureza, '') = $4
	  AND COALESCE(data_fato, '') = $5
	  AND COALESCE(cep_fato, '') = $6
	  AND COALESCE(latitude_fato, '') = $7
	  AND COALESCE(longitude_fato, '') = $8
	  AND COALESCE(logradouro_fato, '') = $9
	  AND COALESCE(numerocasa_fato, '') = $10
	  AND COALESCE(bairro_fato, '') = $11
	  AND COALESCE(municipio_fato, '') = $12
	  AND COALESCE(pais_fato, '') = $13
	  AND COALESCE(tipo_envolvido, '') = $14
	  AND COALESCE(nomecompleto, '') = $15
	  AND COALESCE(cpf, '') = $16
	  AND COALESCE(nomedamae, '') = $17
	  AND COALESCE(nascimento, '') = $18
	  AND COALESCE(nacionalidade, '') = $19
	  AND COALESCE(naturalidade, '') = $20
	  AND COALESCE(uf_envolvido, '') = $21
	  AND COALESCE(sexo_envolvido, '') = $22
	  AND COALESCE(telefone_envolvido, '') = $23
	  AND COALESCE(relato_historico, '') = $24
	LIMIT 1`

	var exists int
	err := r.DB.QueryRow(query,
		registro.NumeroBo, registro.DelegaciaResponsavel, registro.Situacao, registro.Natureza,
		registro.DataFato, registro.CepFato, registro.LatitudeFato, registro.LongitudeFato,
		registro.LogradouroFato, registro.NumeroCasaFato, registro.BairroFato, registro.MunicipioFato,
		registro.PaisFato, registro.TipoEnvolvido, registro.NomeCompleto, registro.Cpf,
		registro.NomeDaMae, registro.Nascimento, registro.Nacionalidade, registro.Naturalidade,
		registro.UfEnvolvido, registro.SexoEnvolvido, registro.TelefoneEnvolvido, registro.RelatoHistorico).Scan(&exists)

	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}

	return true, nil
}