package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"fraudbase/internal/repository"
)

type MunicipioHandler struct {
	municipioRepo *repository.MunicipioRepository
}

func NewMunicipioHandler(municipioRepo *repository.MunicipioRepository) *MunicipioHandler {
	return &MunicipioHandler{municipioRepo: municipioRepo}
}

func (h *MunicipioHandler) GetAllMunicipios(w http.ResponseWriter, r *http.Request) {
	log.Println("Iniciando busca de municípios")
	
	municipios, err := h.municipioRepo.GetAllMunicipios()
	if err != nil {
		log.Printf("Erro ao buscar municípios: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Erro ao buscar municípios",
		})
		return
	}
	
	log.Printf("Encontrados %d municípios", len(municipios))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(municipios)
}

func (h *MunicipioHandler) GetAllUFs(w http.ResponseWriter, r *http.Request) {
	log.Println("Iniciando busca de UFs")
	
	ufs, err := h.municipioRepo.GetAllUFs()
	if err != nil {
		log.Printf("Erro ao buscar UFs: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Erro ao buscar UFs",
		})
		return
	}
	
	log.Printf("Encontradas %d UFs", len(ufs))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ufs)
}
