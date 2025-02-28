package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"fraudbase/internal/repository"
)

type EnvolvidoHandler struct {
	envolvidoRepo *repository.EnvolvidoRepository
}

func NewEnvolvidoHandler(envolvidoRepo *repository.EnvolvidoRepository) *EnvolvidoHandler {
	return &EnvolvidoHandler{envolvidoRepo: envolvidoRepo}
}

func (h *EnvolvidoHandler) CreateEnvolvido(w http.ResponseWriter, r *http.Request) {
	log.Println("Recebida requisição para cadastrar envolvido")
	
	var envolvido repository.Envolvido
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&envolvido); err != nil {
		log.Printf("Erro ao decodificar JSON: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Erro ao processar dados do formulário",
		})
		return
	}
	
	id, err := h.envolvidoRepo.CreateEnvolvido(envolvido)
	if err != nil {
		log.Printf("Erro ao cadastrar envolvido: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Erro ao cadastrar envolvido no banco de dados",
		})
		return
	}
	
	log.Printf("Envolvido cadastrado com sucesso. ID: %s", id)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"success": "true",
		"message": "Envolvido cadastrado com sucesso",
		"id": id,
	})
}
