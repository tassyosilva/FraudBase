package handlers

import (
	"encoding/json"
	"fraudbase/internal/repository"
	"log"
	"net/http"
)

// DashboardStatsHandler manipula requisições para estatísticas do dashboard
type DashboardStatsHandler struct {
	dashRepo *repository.DashboardRepository
}

// NewDashboardStatsHandler cria um novo handler para estatísticas do dashboard
func NewDashboardStatsHandler(dashRepo *repository.DashboardRepository) *DashboardStatsHandler {
	return &DashboardStatsHandler{dashRepo: dashRepo}
}

// GetVitimasPorSexo retorna estatísticas de vítimas por sexo
func (h *DashboardStatsHandler) GetVitimasPorSexo(w http.ResponseWriter, r *http.Request) {
	log.Println("Recebida requisição para estatísticas de vítimas por sexo")

	stats, err := h.dashRepo.GetVitimasPorSexo()
	if err != nil {
		log.Printf("Erro ao buscar estatísticas de vítimas por sexo: %v", err)
		http.Error(w, "Erro ao buscar estatísticas", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(stats); err != nil {
		log.Printf("Erro ao codificar resposta JSON: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}
}

// GetVitimasPorFaixaEtaria retorna estatísticas de vítimas por faixa etária
func (h *DashboardStatsHandler) GetVitimasPorFaixaEtaria(w http.ResponseWriter, r *http.Request) {
	log.Println("Recebida requisição para estatísticas de vítimas por faixa etária")

	stats, err := h.dashRepo.GetVitimasPorFaixaEtaria()
	if err != nil {
		log.Printf("Erro ao buscar estatísticas de vítimas por faixa etária: %v", err)
		http.Error(w, "Erro ao buscar estatísticas", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(stats); err != nil {
		log.Printf("Erro ao codificar resposta JSON: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}
}

// GetQuantidadeBOs retorna a quantidade de BOs registrados
func (h *DashboardStatsHandler) GetQuantidadeBOs(w http.ResponseWriter, r *http.Request) {
	log.Println("Recebida requisição para quantidade de BOs")

	stats, err := h.dashRepo.GetQuantidadeBOs()
	if err != nil {
		log.Printf("Erro ao buscar quantidade de BOs: %v", err)
		http.Error(w, "Erro ao buscar estatísticas", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(stats); err != nil {
		log.Printf("Erro ao codificar resposta JSON: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}
}

// GetQuantidadeInfratores retorna a quantidade de infratores
func (h *DashboardStatsHandler) GetQuantidadeInfratores(w http.ResponseWriter, r *http.Request) {
	log.Println("Recebida requisição para quantidade de infratores")

	stats, err := h.dashRepo.GetQuantidadeInfratores()
	if err != nil {
		log.Printf("Erro ao buscar quantidade de infratores: %v", err)
		http.Error(w, "Erro ao buscar estatísticas", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(stats); err != nil {
		log.Printf("Erro ao codificar resposta JSON: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}
}

// GetQuantidadeVitimas retorna a quantidade de vítimas
func (h *DashboardStatsHandler) GetQuantidadeVitimas(w http.ResponseWriter, r *http.Request) {
	log.Println("Recebida requisição para quantidade de vítimas")

	stats, err := h.dashRepo.GetQuantidadeVitimas()
	if err != nil {
		log.Printf("Erro ao buscar quantidade de vítimas: %v", err)
		http.Error(w, "Erro ao buscar estatísticas", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(stats); err != nil {
		log.Printf("Erro ao codificar resposta JSON: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}
}

// GetInfratoresPorDelegacia retorna estatísticas de infratores por delegacia responsável
func (h *DashboardStatsHandler) GetInfratoresPorDelegacia(w http.ResponseWriter, r *http.Request) {
    log.Println("Recebida requisição para estatísticas de infratores por delegacia")

    stats, err := h.dashRepo.GetInfratoresPorDelegacia()
    if err != nil {
        log.Printf("Erro ao buscar estatísticas de infratores por delegacia: %v", err)
        http.Error(w, "Erro ao buscar estatísticas", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    if err := json.NewEncoder(w).Encode(stats); err != nil {
        log.Printf("Erro ao codificar resposta JSON: %v", err)
        http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
        return
    }
}
