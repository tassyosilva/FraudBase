package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"fraudbase/internal/repository"
)

type PaisHandler struct {
	paisRepo *repository.PaisRepository
}

func NewPaisHandler(paisRepo *repository.PaisRepository) *PaisHandler {
	return &PaisHandler{paisRepo: paisRepo}
}

func (h *PaisHandler) GetAllPaises(w http.ResponseWriter, r *http.Request) {
	log.Println("Iniciando busca de países")
	
	paises, err := h.paisRepo.GetAllPaises()
	if err != nil {
		log.Printf("Erro ao buscar países: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Erro ao buscar países",
		})
		return
	}
	
	log.Printf("Encontrados %d países", len(paises))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(paises)
}
