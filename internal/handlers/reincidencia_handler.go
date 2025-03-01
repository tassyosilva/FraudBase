package handlers

import (
	"encoding/json"
	"fraudbase/internal/repository"
	"log"
	"net/http"
	"strconv"
)

// ReincidenciaHandler manipula requisições para estatísticas de reincidência
type ReincidenciaHandler struct {
	reincidenciaRepo *repository.ReincidenciaRepository
}

// NewReincidenciaHandler cria um novo handler para estatísticas de reincidência
func NewReincidenciaHandler(reincidenciaRepo *repository.ReincidenciaRepository) *ReincidenciaHandler {
	return &ReincidenciaHandler{reincidenciaRepo: reincidenciaRepo}
}

// GetReincidenciaPorCPF retorna estatísticas de reincidência por CPF
func (h *ReincidenciaHandler) GetReincidenciaPorCPF(w http.ResponseWriter, r *http.Request) {
	log.Println("Recebida requisição para estatísticas de reincidência por CPF")

	// Obter parâmetros de paginação
	page := 1
	limit := 10
	
	pageStr := r.URL.Query().Get("page")
	if pageStr != "" {
		pageNum, err := strconv.Atoi(pageStr)
		if err == nil && pageNum > 0 {
			page = pageNum
		}
	}
	
	limitStr := r.URL.Query().Get("limit")
	if limitStr != "" {
		limitNum, err := strconv.Atoi(limitStr)
		if err == nil && limitNum > 0 {
			limit = limitNum
		}
	}

	stats, total, err := h.reincidenciaRepo.GetReincidenciaPorCPF(page, limit)
	if err != nil {
		log.Printf("Erro ao buscar estatísticas de reincidência por CPF: %v", err)
		http.Error(w, "Erro ao buscar estatísticas", http.StatusInternalServerError)
		return
	}

	// Estrutura para retornar os dados e informações de paginação
	response := struct {
		Data       []repository.ReincidenciaCPFStats `json:"data"`
		TotalCount int                               `json:"totalCount"`
		Page       int                               `json:"page"`
		Limit      int                               `json:"limit"`
		TotalPages int                               `json:"totalPages"`
	}{
		Data:       stats,
		TotalCount: total,
		Page:       page,
		Limit:      limit,
		TotalPages: (total + limit - 1) / limit, // Calcula o número total de páginas
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Erro ao codificar resposta JSON: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}
}
