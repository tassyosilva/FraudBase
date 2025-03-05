package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"fraudbase/internal/models"
	"fraudbase/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	userRepo *repository.UserRepository
}

func NewUserHandler(userRepo *repository.UserRepository) *UserHandler {
	return &UserHandler{userRepo: userRepo}
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Erro ao decodificar dados do usuário", http.StatusBadRequest)
		return
	}

	err := h.userRepo.CreateUser(&user)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": err.Error()})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Usuário criado com sucesso"})
}

// GetAllUsers retorna todos os usuários
func (uh *UserHandler) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	users, err := uh.userRepo.GetAllUsers()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Erro ao buscar usuários",
		})
		log.Printf("Erro ao buscar usuários: %v", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"users":   users,
	})
}

// GetUserByIDHandler retorna dados de um usuário pelo ID
func (uh *UserHandler) GetUserByIDHandler(w http.ResponseWriter, r *http.Request) {
	// Configurar headers CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	
	// Se for uma requisição OPTIONS, retornar imediatamente
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "ID de usuário inválido",
		})
		return
	}
	
	user, err := uh.userRepo.GetUserByID(userID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Usuário não encontrado",
		})
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// UpdateUser atualiza os dados de um usuário
func (uh *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Erro ao decodificar dados do usuário",
		})
		log.Printf("Erro ao decodificar dados do usuário: %v", err)
		return
	}
	// Verificar se o ID foi fornecido
	if user.ID == 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "ID do usuário não fornecido",
		})
		return
	}
	// Verificar se o usuário existe
	_, err = uh.userRepo.GetUserByID(user.ID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Usuário não encontrado",
		})
		return
	}
	// Atualizar o usuário
	err = uh.userRepo.UpdateUser(user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Erro ao atualizar usuário",
		})
		log.Printf("Erro ao atualizar usuário: %v", err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"success": "true",
		"message": "Usuário atualizado com sucesso",
	})
}

// DeleteUser remove um usuário do sistema
func (uh *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "ID de usuário inválido",
		})
		return
	}
	// Verificar se o usuário existe
	_, err = uh.userRepo.GetUserByID(userID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Usuário não encontrado",
		})
		return
	}
	// Excluir o usuário
	err = uh.userRepo.DeleteUser(userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Erro ao excluir usuário",
		})
		log.Printf("Erro ao excluir usuário: %v", err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"success": "true",
		"message": "Usuário excluído com sucesso",
	})
}

// UpdateUserPassword atualiza apenas a senha do usuário
func (uh *UserHandler) UpdateUserPassword(w http.ResponseWriter, r *http.Request) {
	// Estrutura para receber os dados da requisição
	var passwordData struct {
		ID       int    `json:"id"`
		Password string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&passwordData)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Erro ao decodificar dados da senha",
		})
		log.Printf("Erro ao decodificar dados da senha: %v", err)
		return
	}
	// Verificar se o ID foi fornecido
	if passwordData.ID == 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "ID do usuário não fornecido",
		})
		return
	}
	// Verificar se o usuário existe
	_, err = uh.userRepo.GetUserByID(passwordData.ID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Usuário não encontrado",
		})
		return
	}
	// Gerar hash da nova senha
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(passwordData.Password), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Erro ao processar senha",
		})
		log.Printf("Erro ao gerar hash da senha: %v", err)
		return
	}
	// Atualizar a senha
	err = uh.userRepo.UpdateUserPassword(passwordData.ID, string(hashedPassword))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"success": "false",
			"message": "Erro ao atualizar senha",
		})
		log.Printf("Erro ao atualizar senha: %v", err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"success": "true",
		"message": "Senha atualizada com sucesso",
	})
}