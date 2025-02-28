package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"fraudbase/internal/repository"
)

type BancoHandler struct {
	bancoRepo *repository.BancoRepository
}

func NewBancoHandler(bancoRepo *repository.BancoRepository) *BancoHandler {
	return &BancoHandler{bancoRepo: bancoRepo}
}

func (h *BancoHandler) GetAllBancos(w http.ResponseWriter, r *http.Request) {
	log.Println("Iniciando busca de bancos")
	
	bancos, err := h.bancoRepo.GetAllBancos()
	if err != nil {
		log.Printf("Erro ao buscar bancos: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Erro ao buscar bancos",
		})
		return
	}
	
	log.Printf("Encontrados %d bancos", len(bancos))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bancos)
}
