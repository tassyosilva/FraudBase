package main

import (
    "log"
    "net/http"
    "fraudbase/internal/database"
    "fraudbase/internal/handlers"
    "fraudbase/internal/repository"
    "github.com/gorilla/mux"
)

func corsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
        w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
        w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Authorization")

        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }

        next.ServeHTTP(w, r)
    })
}

func main() {
    db, err := database.ConnectDB()
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    userRepo := repository.NewUserRepository(db)
    authHandler := handlers.NewAuthHandler(userRepo)

    r := mux.NewRouter()
    r.Use(corsMiddleware)
    r.HandleFunc("/api/login", authHandler.Login).Methods("POST", "OPTIONS")

    log.Println("Servidor rodando na porta 8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}