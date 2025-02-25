package handlers

import (
    "encoding/json"
    "net/http"
    "fraudbase/internal/models"
    "fraudbase/internal/repository"
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