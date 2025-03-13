package handlers

import (
    "encoding/json"
    "fraudbase/internal/repository"
    "log"
    "net/http"
    "strconv"
)

// ReincidenciaCelularHandler manipula requisições para estatísticas de reincidência por celular
type ReincidenciaCelularHandler struct {
    reincidenciaCelularRepo *repository.ReincidenciaCelularRepository
}

// NewReincidenciaCelularHandler cria um novo handler para estatísticas de reincidência por celular
func NewReincidenciaCelularHandler(reincidenciaCelularRepo *repository.ReincidenciaCelularRepository) *ReincidenciaCelularHandler {
    return &ReincidenciaCelularHandler{reincidenciaCelularRepo: reincidenciaCelularRepo}
}

// GetReincidenciaPorCelular retorna estatísticas de reincidência por celular
func (h *ReincidenciaCelularHandler) GetReincidenciaPorCelular(w http.ResponseWriter, r *http.Request) {
    log.Println("Recebida requisição para estatísticas de reincidência por celular")
    
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
    
    stats, total, err := h.reincidenciaCelularRepo.GetReincidenciaPorCelular(page, limit)
    if err != nil {
        log.Printf("Erro ao buscar estatísticas de reincidência por celular: %v", err)
        http.Error(w, "Erro ao buscar estatísticas", http.StatusInternalServerError)
        return
    }
    
    // Estrutura para retornar os dados e informações de paginação
    response := struct {
        Data       []*repository.ReincidenciaCelularStats `json:"data"`
        TotalCount int                                    `json:"totalCount"`
        Page       int                                    `json:"page"`
        Limit      int                                    `json:"limit"`
        TotalPages int                                    `json:"totalPages"`
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