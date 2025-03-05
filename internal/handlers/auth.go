package handlers

import (
	"encoding/json"
	"net/http"
	"log"
	"fraudbase/internal/repository"
	"golang.org/x/crypto/bcrypt"
	"fraudbase/internal/auth"
)

type AuthHandler struct {
	userRepo *repository.UserRepository
}

func NewAuthHandler(userRepo *repository.UserRepository) *AuthHandler {
	return &AuthHandler{userRepo: userRepo}
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Estrutura LoginResponse modificada para incluir mais informações do usuário
type LoginResponse struct {
	Token    string `json:"token"`
	IsAdmin  bool   `json:"isAdmin"`
	UserID   int    `json:"userId"`
	Username string `json:"username"`
	Nome     string `json:"nome"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	log.Println("=== Starting Login Process ===")
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Request decode error: %v", err)
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	log.Printf("Received login request for user: %s", req.Username)
	user, err := h.userRepo.GetUserByLogin(req.Username)
	if err != nil {
		log.Printf("Database query error: %v", err)
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.Senha), []byte(req.Password))
	if err != nil {
		log.Printf("Password mismatch")
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}
	// Gerar token JWT
	token, err := auth.GenerateToken(user.ID, user.Login, user.IsAdmin)
	if err != nil {
		log.Printf("JWT generation error: %v", err)
		http.Error(w, "Authentication error", http.StatusInternalServerError)
		return
	}
	log.Println("=== Login Successful ===")
	
	// Resposta modificada para incluir mais informações do usuário
	response := LoginResponse{
		Token:    token,
		IsAdmin:  user.IsAdmin,
		UserID:   user.ID,
		Username: user.Login,
		Nome:     user.Nome,
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}