package handlers

import (
    "encoding/json"
    "net/http"
    "log"
    "fraudbase/internal/repository"
    "golang.org/x/crypto/bcrypt"
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

type LoginResponse struct {
    Token    string `json:"token"`
    IsAdmin  bool   `json:"isAdmin"`
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

    log.Println("=== Login Successful ===")

    response := LoginResponse{
        Token: "jwt-token-here",
        IsAdmin: user.IsAdmin,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}