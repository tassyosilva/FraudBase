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

// InserirDadosRelatorio - versão otimizada
func (r *RelatorioRepository) InserirDadosRelatorio(dados []DadosRelatorio) (int, error) {
	if len(dados) == 0 {
		return 0, nil
	}
	
	// Usar inserção em lotes otimizada
	registrosInseridos, err := r.inserirDadosNormal(dados)
	if err != nil {
		return registrosInseridos, err
	}

	// Atualizar views materializadas após inserção
	go func() {
		time.Sleep(1 * time.Second) // Pequeno delay
		database.RefreshMaterializedViews(r.DB)
		log.Println("Views materializadas atualizadas após inserção")
	}()

	return registrosInseridos, nil
}

// Função para inserção em lotes otimizada
func (r *RelatorioRepository) inserirDadosNormal(dados []DadosRelatorio) (int, error) {
	// Query preparada para inserção em lote
	query := `
	INSERT INTO tabela_estelionato (
		numero_do_bo, delegacia_responsavel, situacao, natureza,
		data_fato, cep_fato, latitude_fato, longitude_fato, logradouro_fato,
		numerocasa_fato, bairro_fato, municipio_fato, pais_fato,
		tipo_envolvido, nomecompleto, cpf, nomedamae, nascimento,
		nacionalidade, naturalidade, uf_envolvido, sexo_envolvido, 
		telefone_envolvido, relato_historico
	) VALUES `

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
