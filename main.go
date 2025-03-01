package main

import (
    "log"
    "net/http"
    "fraudbase/internal/database"
    "fraudbase/internal/handlers"
    "fraudbase/internal/middleware"
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
    userHandler := handlers.NewUserHandler(userRepo)
    municipioRepo := repository.NewMunicipioRepository(db)
    municipioHandler := handlers.NewMunicipioHandler(municipioRepo)
    paisRepo := repository.NewPaisRepository(db)
    paisHandler := handlers.NewPaisHandler(paisRepo)
    delegaciaRepo := repository.NewDelegaciaRepository(db)
    delegaciaHandler := handlers.NewDelegaciaHandler(delegaciaRepo)
    bancoRepo := repository.NewBancoRepository(db)
    bancoHandler := handlers.NewBancoHandler(bancoRepo)
    envolvidoRepo := repository.NewEnvolvidoRepository(db)
    envolvidoHandler := handlers.NewEnvolvidoHandler(envolvidoRepo)
    consultaRepo := repository.NewConsultaRepository(db)
    consultaHandler := handlers.NewConsultaEnvolvidoHandler(consultaRepo)
    dashboardRepo := repository.NewDashboardRepository(db)
    dashboardStatsHandler := handlers.NewDashboardStatsHandler(dashboardRepo)
    
    r := mux.NewRouter()
    
    // Middleware de CORS a todas as rotas
    r.Use(corsMiddleware)
    
    // Rota de login (não protegida)
    r.HandleFunc("/api/login", authHandler.Login).Methods("POST", "OPTIONS")
    
    // Rotas públicas (quando houver)
    r.HandleFunc("/api/users", userHandler.CreateUser).Methods("POST", "OPTIONS")
    
    // Rotas protegidas por JWT
    apiRouter := r.PathPrefix("/api").Subrouter()
    apiRouter.Use(middleware.JWTAuthMiddleware)
    
    // Rotas protegidas ao apiRouter
    apiRouter.HandleFunc("/users", userHandler.GetAllUsers).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/users/{id}", userHandler.DeleteUser).Methods("DELETE", "OPTIONS")
    apiRouter.HandleFunc("/users", userHandler.UpdateUser).Methods("PUT", "OPTIONS")
    apiRouter.HandleFunc("/users/password", userHandler.UpdateUserPassword).Methods("PUT", "OPTIONS")
    apiRouter.HandleFunc("/municipios", municipioHandler.GetAllMunicipios).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/ufs", municipioHandler.GetAllUFs).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/paises", paisHandler.GetAllPaises).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/delegacias", delegaciaHandler.GetAllDelegacias).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/bancos", bancoHandler.GetAllBancos).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/envolvidos", envolvidoHandler.CreateEnvolvido).Methods("POST", "OPTIONS")
    apiRouter.HandleFunc("/consulta-envolvidos", consultaHandler.GetEnvolvidos).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/consulta-envolvidos/{id}", consultaHandler.GetEnvolvidoById).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/dashboard/vitimas-por-sexo", dashboardStatsHandler.GetVitimasPorSexo).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/dashboard/vitimas-por-faixa-etaria", dashboardStatsHandler.GetVitimasPorFaixaEtaria).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/dashboard/quantidade-bos", dashboardStatsHandler.GetQuantidadeBOs).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/dashboard/quantidade-infratores", dashboardStatsHandler.GetQuantidadeInfratores).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/dashboard/quantidade-vitimas", dashboardStatsHandler.GetQuantidadeVitimas).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/dashboard/infratores-por-delegacia", dashboardStatsHandler.GetInfratoresPorDelegacia).Methods("GET", "OPTIONS")
    // adminRouter := apiRouter.PathPrefix("/admin").Subrouter()
    // adminRouter.Use(middleware.AdminOnly)
    // ... rotas de admin
    
    log.Println("Servidor rodando na porta 8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}