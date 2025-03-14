package handlers

import (
	"encoding/json"
	"fmt"
	"fraudbase/internal/repository"
	"net/http"
)

// BOStatisticsHandler manipula requisições relacionadas a estatísticas de BOs
type BOStatisticsHandler struct {
	boStatsRepo *repository.BOStatisticsRepository
}

// NewBOStatisticsHandler cria uma nova instância do handler
func NewBOStatisticsHandler(boStatsRepo *repository.BOStatisticsRepository) *BOStatisticsHandler {
	return &BOStatisticsHandler{
		boStatsRepo: boStatsRepo,
	}
}

// BOStatisticsResponse estrutura da resposta para estatísticas de BO
type BOStatisticsResponse struct {
	NewestBO *repository.BOData `json:"newestBO"`
	OldestBO *repository.BOData `json:"oldestBO"`
}

// GetBOStatistics manipula a requisição para obter estatísticas dos BOs
func (h *BOStatisticsHandler) GetBOStatistics(w http.ResponseWriter, r *http.Request) {
	// Configurar headers para a resposta
	w.Header().Set("Content-Type", "application/json")
	
	// Buscar o BO mais recente
	newestBO, err := h.boStatsRepo.BuscarBOMaisNovo()
	if err != nil {
		http.Error(w, fmt.Sprintf("Erro ao buscar BO mais recente: %v", err), http.StatusInternalServerError)
		return
	}
	
	// Buscar o BO mais antigo
	oldestBO, err := h.boStatsRepo.BuscarBOMaisAntigo()
	if err != nil {
		http.Error(w, fmt.Sprintf("Erro ao buscar BO mais antigo: %v", err), http.StatusInternalServerError)
		return
	}
	
	// Montar a resposta
	response := BOStatisticsResponse{
		NewestBO: newestBO,
		OldestBO: oldestBO,
	}
	
	// Codificar e enviar a resposta
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, fmt.Sprintf("Erro ao codificar resposta: %v", err), http.StatusInternalServerError)
		return
	}
}