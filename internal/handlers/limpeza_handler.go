package handlers

import (
	"encoding/json"
	"net/http"
	"fraudbase/internal/repository"
	"log"
)

type LimpezaHandler struct {
	limpezaRepo *repository.LimpezaRepository
}

func NewLimpezaHandler(limpezaRepo *repository.LimpezaRepository) *LimpezaHandler {
	return &LimpezaHandler{
		limpezaRepo: limpezaRepo,
	}
}

// LimparDuplicatasHandler processa a requisição para limpar registros duplicados
func (h *LimpezaHandler) LimparDuplicatasHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Recebida requisição para limpar registros duplicados")
	
	// Verificar se é um método POST
	if r.Method != http.MethodPost {
		respondWithError(w, http.StatusMethodNotAllowed, "Método não permitido")
		return
	}

	// Chamar o repository para executar a limpeza
	totalAntes, totalDepois, err := h.limpezaRepo.LimparRegistrosDuplicados()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Erro ao remover duplicatas: "+err.Error())
		return
	}

	// Calcular quantos registros foram removidos
	registrosRemovidos := totalAntes - totalDepois

	// Responder com sucesso
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"message":     "Limpeza de duplicatas concluída com sucesso",
		"rowsRemoved": registrosRemovidos,
		"totalBefore": totalAntes,
		"totalAfter":  totalDepois,
	})
}
