package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"fraudbase/internal/repository"
)

type DelegaciaHandler struct {
	delegaciaRepo *repository.DelegaciaRepository
}

func NewDelegaciaHandler(delegaciaRepo *repository.DelegaciaRepository) *DelegaciaHandler {
	return &DelegaciaHandler{delegaciaRepo: delegaciaRepo}
}

func (h *DelegaciaHandler) GetAllDelegacias(w http.ResponseWriter, r *http.Request) {
	log.Println("Iniciando busca de delegacias")
	
	delegacias, err := h.delegaciaRepo.GetAllDelegacias()
	if err != nil {
		log.Printf("Erro ao buscar delegacias: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Erro ao buscar delegacias",
		})
		return
	}
	
	log.Printf("Encontradas %d delegacias", len(delegacias))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(delegacias)
}
