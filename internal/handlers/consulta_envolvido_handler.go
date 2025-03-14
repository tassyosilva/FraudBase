package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
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

// GetEnvolvidos busca envolvidos com filtros opcionais
func (h *ConsultaEnvolvidoHandler) GetEnvolvidos(w http.ResponseWriter, r *http.Request) {
	log.Println("Recebida requisição para consultar envolvidos")
	
	// Extrair parâmetros de consulta
	queryParams := r.URL.Query()
	nome := queryParams.Get("nome")
	cpf := queryParams.Get("cpf")
	bo := queryParams.Get("bo")
	telefone := queryParams.Get("telefone") // Alterado de pix_utilizado para telefone
	
	// Buscar envolvidos no repositório
	envolvidos, err := h.consultaRepo.FindEnvolvidos(nome, cpf, bo, telefone) // Passar telefone em vez de pix
	if err != nil {
		log.Printf("Erro ao buscar envolvidos: %v", err)
		http.Error(w, "Erro ao buscar envolvidos", http.StatusInternalServerError)
		return
	}
	
	// Retornar os resultados como JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(envolvidos); err != nil {
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