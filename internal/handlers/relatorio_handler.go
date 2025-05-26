package handlers

import (
	"encoding/json"
	"fmt"
	"fraudbase/internal/repository"
	"fraudbase/internal/database"
	"net/http"
	"path/filepath"
	"strings"
	"time"
	"log"

	"github.com/xuri/excelize/v2"
)

type RelatorioHandler struct {
	repo *repository.RelatorioRepository
}

func NewRelatorioHandler(repo *repository.RelatorioRepository) *RelatorioHandler {
	return &RelatorioHandler{repo: repo}
}

// UploadRelatorio processa o upload e importação do relatório
func (h *RelatorioHandler) UploadRelatorio(w http.ResponseWriter, r *http.Request) {
	// Limitar tamanho do upload para 10MB
	r.ParseMultipartForm(10 << 20)

	file, handler, err := r.FormFile("relatorio")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Erro ao obter arquivo: "+err.Error())
		return
	}
	defer file.Close()

	// Verificar extensão do arquivo
	if filepath.Ext(handler.Filename) != ".xlsx" {
		respondWithError(w, http.StatusBadRequest, "Formato de arquivo inválido. Apenas arquivos .xlsx são permitidos.")
		return
	}

	// Verificar padrão do nome
	if !strings.Contains(handler.Filename, "resultado_da_pesquisa_bo_") {
		respondWithError(w, http.StatusBadRequest, "Nome do arquivo não segue o padrão esperado.")
		return
	}

	// Processar o arquivo Excel
	xlsx, err := excelize.OpenReader(file)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Erro ao ler arquivo Excel: "+err.Error())
		return
	}

	// Verificar se todas as planilhas necessárias existem
	requiredSheets := []string{"Dados do Registro", "Dados do Fato", "Envolvidos", "Relato Histórico"}
	for _, sheet := range requiredSheets {
		idx, err := xlsx.GetSheetIndex(sheet)
		if err != nil || idx == -1 {
			respondWithError(w, http.StatusBadRequest, "Planilha '"+sheet+"' não encontrada no arquivo.")
			return
		}
	}

	// Processar os dados e relacioná-los
	dadosProcessados, err := processarDadosRelatorio(xlsx)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Erro ao processar dados: "+err.Error())
		return
	}

	// Inserir dados no banco de dados (LINHA ALTERADA)
	registrosInseridos, duplicatasEvitadas, err := h.repo.InserirDadosRelatorio(dadosProcessados)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Erro ao inserir dados no banco: "+err.Error())
		return
	}

	// Atualizar views materializadas em background
	go func() {
		time.Sleep(2 * time.Second)
		database.RefreshMaterializedViews(h.repo.DB)
		log.Println("Views materializadas atualizadas após upload")
	}()

	// Responder com sucesso (RESPOSTA ALTERADA)
	response := map[string]interface{}{
		"success":             true,
		"message":             "Arquivo processado com sucesso",
		"registrosInseridos":  registrosInseridos,
		"duplicatasEvitadas":  duplicatasEvitadas, // NOVO CAMPO
		"totalProcessados":    len(dadosProcessados), // NOVO CAMPO
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Nova função para atualizar views materializadas
func (h *RelatorioHandler) RefreshViews(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondWithError(w, http.StatusMethodNotAllowed, "Método não permitido")
		return
	}

	// Atualizar views materializadas
	err := database.RefreshMaterializedViews(h.repo.DB) // MUDANÇA: h.repo.DB
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Erro ao atualizar views: "+err.Error())
		return
	}

	// Responder com sucesso
	response := map[string]interface{}{
		"success": true,
		"message": "Views materializadas atualizadas com sucesso",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Função completa para processar todas as tabelas do relatório
func processarDadosRelatorio(xlsx *excelize.File) ([]repository.DadosRelatorio, error) {
	var resultado []repository.DadosRelatorio

	// Mapas para armazenar dados temporariamente por ID
	dadosRegistro := make(map[string]map[string]string)
	dadosFato := make(map[string]map[string]string)
	dadosEnvolvidos := make(map[string][]map[string]string)
	dadosRelato := make(map[string]string)

	// 1. Processar "Dados do Registro"
	rows, err := xlsx.GetRows("Dados do Registro")
	if err != nil {
		return nil, fmt.Errorf("erro ao ler planilha 'Dados do Registro': %v", err)
	}

	// Identificar índices das colunas
	var idxId, idxNumero, idxUnidade, idxSituacao, idxNaturezas int = -1, -1, -1, -1, -1
	for i, cell := range rows[0] {
		switch cell {
		case "Id":
			idxId = i
		case "Número":
			idxNumero = i
		case "Unidade de Apuração":
			idxUnidade = i
		case "Situação":
			idxSituacao = i
		case "Naturezas":
			idxNaturezas = i
		}
	}

	// Verificar se todas as colunas foram encontradas
	if idxId == -1 || idxNumero == -1 || idxUnidade == -1 || idxSituacao == -1 || idxNaturezas == -1 {
		return nil, fmt.Errorf("colunas obrigatórias não encontradas na planilha 'Dados do Registro'")
	}

	// Processar linhas
	for i, row := range rows {
		if i == 0 { // Pular cabeçalho
			continue
		}
		if len(row) <= idxId || len(row) <= idxNumero {
			continue // Linha vazia ou inválida
		}

		id := row[idxId]
		if id == "" {
			continue
		}

		dadosRegistro[id] = map[string]string{
			"Número":              getValueSafely(row, idxNumero),
			"Unidade de Apuração": getValueSafely(row, idxUnidade),
			"Situação":            getValueSafely(row, idxSituacao),
			"Naturezas":           getValueSafely(row, idxNaturezas),
		}
	}

	// 2. Processar "Dados do Fato"
	rows, err = xlsx.GetRows("Dados do Fato")
	if err != nil {
		return nil, fmt.Errorf("erro ao ler planilha 'Dados do Fato': %v", err)
	}

	// Identificar índices das colunas para "Dados do Fato"
	var idxIdFato, idxDataHora, idxCep, idxLatitude, idxLongitude,
		idxLogradouro, idxNumeroFato, idxBairro, idxMunicipio, idxPais int = -1, -1, -1, -1, -1, -1, -1, -1, -1, -1

	for i, cell := range rows[0] {
		switch cell {
		case "Id":
			idxIdFato = i
		case "Data/Hora Início":
			idxDataHora = i
		case "CEP":
			idxCep = i
		case "Latitude":
			idxLatitude = i
		case "Longitude":
			idxLongitude = i
		case "Logradouro":
			idxLogradouro = i
		case "Número":
			idxNumeroFato = i
		case "Bairro":
			idxBairro = i
		case "Município":
			idxMunicipio = i
		case "Pais":
			idxPais = i
		}
	}

	// Verificar se todas as colunas foram encontradas
	if idxIdFato == -1 {
		return nil, fmt.Errorf("coluna Id não encontrada na planilha 'Dados do Fato'")
	}

	// Processar linhas
	for i, row := range rows {
		if i == 0 { // Pular cabeçalho
			continue
		}
		if len(row) <= idxIdFato {
			continue // Linha vazia ou inválida
		}

		id := row[idxIdFato]
		if id == "" {
			continue
		}

		dadosFato[id] = map[string]string{
			"Data/Hora Início": getValueSafely(row, idxDataHora),
			"CEP":              getValueSafely(row, idxCep),
			"Latitude":         getValueSafely(row, idxLatitude),
			"Longitude":        getValueSafely(row, idxLongitude),
			"Logradouro":       getValueSafely(row, idxLogradouro),
			"Número":           getValueSafely(row, idxNumeroFato),
			"Bairro":           getValueSafely(row, idxBairro),
			"Município":        getValueSafely(row, idxMunicipio),
			"Pais":             getValueSafely(row, idxPais),
		}
	}

	// 3. Processar "Envolvidos" (pode ter múltiplos por ID)
	rows, err = xlsx.GetRows("Envolvidos")
	if err != nil {
		return nil, fmt.Errorf("erro ao ler planilha 'Envolvidos': %v", err)
	}

	// Identificar índices das colunas para "Envolvidos"
	var idxIdEnvolvido, idxParticipacoes, idxNome, idxCpf, idxFiliacao1,
		idxDataNasc, idxNacionalidade, idxNaturalidade, idxUf, idxSexo, idxTelefone int = -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1

	for i, cell := range rows[0] {
		switch cell {
		case "Id":
			idxIdEnvolvido = i
		case "Participações":
			idxParticipacoes = i
		case "Nome Completo":
			idxNome = i
		case "CPF":
			idxCpf = i
		case "Filiação 1":
			idxFiliacao1 = i
		case "Data de Nascimento":
			idxDataNasc = i
		case "Nacionalidade":
			idxNacionalidade = i
		case "Naturalidade":
			idxNaturalidade = i
		case "UF":
			idxUf = i
		case "Sexo":
			idxSexo = i
		case "Telefone":
			idxTelefone = i
		}
	}

	// Verificar se todas as colunas foram encontradas
	if idxIdEnvolvido == -1 {
		return nil, fmt.Errorf("coluna Id não encontrada na planilha 'Envolvidos'")
	}

	// Processar linhas
	for i, row := range rows {
		if i == 0 { // Pular cabeçalho
			continue
		}
		if len(row) <= idxIdEnvolvido {
			continue // Linha vazia ou inválida
		}

		id := row[idxIdEnvolvido]
		if id == "" {
			continue
		}

		envolvido := map[string]string{
			"Participações":       getValueSafely(row, idxParticipacoes),
			"Nome Completo":       getValueSafely(row, idxNome),
			"CPF":                 getValueSafely(row, idxCpf),
			"Filiação 1":          getValueSafely(row, idxFiliacao1),
			"Data de Nascimento":  getValueSafely(row, idxDataNasc),
			"Nacionalidade":       getValueSafely(row, idxNacionalidade),
			"Naturalidade":        getValueSafely(row, idxNaturalidade),
			"UF":                  getValueSafely(row, idxUf),
			"Sexo":                getValueSafely(row, idxSexo),
			"Telefone":            getValueSafely(row, idxTelefone),
		}

		// Adicionar envolvido ao mapa por ID
		if _, exists := dadosEnvolvidos[id]; !exists {
			dadosEnvolvidos[id] = []map[string]string{}
		}
		dadosEnvolvidos[id] = append(dadosEnvolvidos[id], envolvido)
	}

	// 4. Processar "Relato Histórico"
	rows, err = xlsx.GetRows("Relato Histórico")
	if err != nil {
		return nil, fmt.Errorf("erro ao ler planilha 'Relato Histórico': %v", err)
	}

	// Identificar índices das colunas para "Relato Histórico"
	var idxIdRelato, idxRelato int = -1, -1
	for i, cell := range rows[0] {
		switch cell {
		case "Id":
			idxIdRelato = i
		case "Relato / Histórico":
			idxRelato = i
		}
	}

	// Verificar se todas as colunas foram encontradas
	if idxIdRelato == -1 || idxRelato == -1 {
		return nil, fmt.Errorf("colunas obrigatórias não encontradas na planilha 'Relato Histórico'")
	}

	// Processar linhas
	for i, row := range rows {
		if i == 0 { // Pular cabeçalho
			continue
		}
		if len(row) <= idxIdRelato || len(row) <= idxRelato {
			continue // Linha vazia ou inválida
		}

		id := row[idxIdRelato]
		if id == "" {
			continue
		}

		dadosRelato[id] = getValueSafely(row, idxRelato)
	}

	// 5. Relacionar os dados para gerar a lista final
	for id, registro := range dadosRegistro {
		fato, hasFato := dadosFato[id]
		if !hasFato {
			fato = make(map[string]string) // Criar mapa vazio se não existir
		}

		relato := dadosRelato[id]
		envolvidos, hasEnvolvidos := dadosEnvolvidos[id]

		if !hasEnvolvidos || len(envolvidos) == 0 {
			// Criar pelo menos um registro mesmo sem envolvidos
			dados := repository.DadosRelatorio{
				NumeroBo:             registro["Número"],
				DelegaciaResponsavel: registro["Unidade de Apuração"],
				Situacao:             registro["Situação"],
				Natureza:             registro["Naturezas"],
				DataFato:             fato["Data/Hora Início"],
				CepFato:              fato["CEP"],
				LatitudeFato:         fato["Latitude"],
				LongitudeFato:        fato["Longitude"],
				LogradouroFato:       fato["Logradouro"],
				NumeroCasaFato:       fato["Número"],
				BairroFato:           fato["Bairro"],
				MunicipioFato:        fato["Município"],
				PaisFato:             fato["Pais"],
				RelatoHistorico:      relato,
			}
			resultado = append(resultado, dados)
		} else {
			// Criar um registro para cada envolvido
			for _, envolvido := range envolvidos {
				dados := repository.DadosRelatorio{
					NumeroBo:             registro["Número"],
					DelegaciaResponsavel: registro["Unidade de Apuração"],
					Situacao:             registro["Situação"],
					Natureza:             registro["Naturezas"],
					DataFato:             fato["Data/Hora Início"],
					CepFato:              fato["CEP"],
					LatitudeFato:         fato["Latitude"],
					LongitudeFato:        fato["Longitude"],
					LogradouroFato:       fato["Logradouro"],
					NumeroCasaFato:       fato["Número"],
					BairroFato:           fato["Bairro"],
					MunicipioFato:        fato["Município"],
					PaisFato:             fato["Pais"],
					TipoEnvolvido:        envolvido["Participações"],
					NomeCompleto:         envolvido["Nome Completo"],
					Cpf:                  envolvido["CPF"],
					NomeDaMae:            envolvido["Filiação 1"],
					Nascimento:           envolvido["Data de Nascimento"],
					Nacionalidade:        envolvido["Nacionalidade"],
					Naturalidade:         envolvido["Naturalidade"],
					UfEnvolvido:          envolvido["UF"],
					SexoEnvolvido:        envolvido["Sexo"],
					TelefoneEnvolvido:    envolvido["Telefone"],
					RelatoHistorico:      relato,
				}
				resultado = append(resultado, dados)
			}
		}
	}

	return resultado, nil
}

// Função auxiliar para obter valor seguro de uma linha
func getValueSafely(row []string, index int) string {
	if index >= 0 && index < len(row) {
		return row[index]
	}
	return ""
}

// Função auxiliar para responder com erro
func respondWithError(w http.ResponseWriter, code int, message string) {
	response := map[string]string{"error": message}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(response)
}