package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"fraudbase/internal/models"
	"fraudbase/internal/repository"
	"github.com/gorilla/mux"
)

// ConsultaEnvolvidoHandler manipula requisições para consulta de envolvidos
type ConsultaEnvolvidoHandler struct {
	consultaRepo *repository.ConsultaRepository
}

// NewConsultaEnvolvidoHandler cria um novo handler para consulta de envolvidos
func NewConsultaEnvolvidoHandler(consultaRepo *repository.ConsultaRepository) *ConsultaEnvolvidoHandler {
	return &ConsultaEnvolvidoHandler{consultaRepo: consultaRepo}
}

// GetEnvolvidos busca envolvidos com filtros opcionais e paginação
func (h *ConsultaEnvolvidoHandler) GetEnvolvidos(w http.ResponseWriter, r *http.Request) {
	log.Println("Recebida requisição para consultar envolvidos")
	
	// Extrair parâmetros de consulta
	queryParams := r.URL.Query()
	nome := queryParams.Get("nome")
	cpf := queryParams.Get("cpf")
	bo := queryParams.Get("bo")
	telefone := queryParams.Get("telefone")
	
	// Parâmetros de paginação
	page := 1
	limit := 50 // Limite padrão otimizado
	
	if pageStr := queryParams.Get("page"); pageStr != "" {
		if pageNum, err := strconv.Atoi(pageStr); err == nil && pageNum > 0 {
			page = pageNum
		}
	}
	
	if limitStr := queryParams.Get("limit"); limitStr != "" {
		if limitNum, err := strconv.Atoi(limitStr); err == nil && limitNum > 0 && limitNum <= 100 {
			limit = limitNum
		}
	}
	
	// Buscar envolvidos com paginação
	envolvidos, totalCount, err := h.consultaRepo.FindEnvolvidosPaginated(nome, cpf, bo, telefone, page, limit)
	if err != nil {
		log.Printf("Erro ao buscar envolvidos: %v", err)
		http.Error(w, "Erro ao buscar envolvidos", http.StatusInternalServerError)
		return
	}
	
	// Calcular total de páginas
	totalPages := (totalCount + limit - 1) / limit
	
	// Estrutura de resposta com metadados de paginação
	response := struct {
		Data       []models.Envolvido `json:"data"`
		TotalCount int                `json:"totalCount"`
		Page       int                `json:"page"`
		Limit      int                `json:"limit"`
		TotalPages int                `json:"totalPages"`
	}{
		Data:       envolvidos,
		TotalCount: totalCount,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}
	
	// Retornar os resultados como JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Erro ao codificar resposta JSON: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}
}

// GetEnvolvidoById busca um envolvido específico pelo ID
func (h *ConsultaEnvolvidoHandler) GetEnvolvidoById(w http.ResponseWriter, r *http.Request) {
	log.Println("Recebida requisição para buscar detalhes de envolvido")

	// Extrair ID da URL
	vars := mux.Vars(r)
	idStr := vars["id"]

	// Converter para inteiro
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("ID inválido: %v", err)
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	// Buscar envolvido pelo ID
	envolvido, err := h.consultaRepo.FindEnvolvidoById(id)
	if err != nil {
		log.Printf("Erro ao buscar envolvido: %v", err)
		if err == repository.ErrNotFound {
			http.Error(w, "Envolvido não encontrado", http.StatusNotFound)
		} else {
			http.Error(w, "Erro ao buscar envolvido", http.StatusInternalServerError)
		}
		return
	}

	// Retornar o envolvido como JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(envolvido); err != nil {
		log.Printf("Erro ao codificar resposta JSON: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}
}
