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
        // Obtenha a origem da requisição
        origin := r.Header.Get("Origin")
        
        // LISTA DE ORIGENS PERMITIDAS
        allowedOrigins := map[string]bool{
            "http://localhost:5173": true,
            "http://localhost:8000": true,
            "http://10.0.0.16:8000": true,
        }
        
        // Verifique se a origem está na lista de permitidas
        if allowedOrigins[origin] {
            w.Header().Set("Access-Control-Allow-Origin", origin)
        }
        
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
    reincidenciaRepo := repository.NewReincidenciaRepository(db)
    reincidenciaHandler := handlers.NewReincidenciaHandler(reincidenciaRepo)
    relatorioRepo := repository.NewRelatorioRepository(db)
    relatorioHandler := handlers.NewRelatorioHandler(relatorioRepo)
    limpezaRepo := repository.NewLimpezaRepository(db)
    limpezaHandler := handlers.NewLimpezaHandler(limpezaRepo)
    boStatsRepo := repository.NewBOStatisticsRepository(db)
    boStatsHandler := handlers.NewBOStatisticsHandler(boStatsRepo)
    reincidenciaCelularRepo := repository.NewReincidenciaCelularRepository(db)
    reincidenciaCelularHandler := handlers.NewReincidenciaCelularHandler(reincidenciaCelularRepo)
    
    r := mux.NewRouter()
    
    // Middleware de CORS a todas as rotas
    r.Use(corsMiddleware)
    
    // Rota de login (não protegida)
    r.HandleFunc("/api/login", authHandler.Login).Methods("POST", "OPTIONS")
    
    // Rotas protegidas por JWT
    apiRouter := r.PathPrefix("/api").Subrouter()
    apiRouter.Use(middleware.JWTAuthMiddleware)
    
    // Rotas que qualquer usuário autenticado pode acessar
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
    apiRouter.HandleFunc("/reincidencia/cpf", reincidenciaHandler.GetReincidenciaPorCPF).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/upload-relatorio", relatorioHandler.UploadRelatorio).Methods("POST", "OPTIONS")
    apiRouter.HandleFunc("/clean-duplicates", limpezaHandler.LimparDuplicatasHandler).Methods("POST", "OPTIONS")
    apiRouter.HandleFunc("/bo-statistics", boStatsHandler.GetBOStatistics).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/reincidencia/celular", reincidenciaCelularHandler.GetReincidenciaPorCelular).Methods("GET", "OPTIONS")
    
    // Rotas para o perfil do usuário
    // Acesso ao próprio perfil de usuário
    apiRouter.HandleFunc("/users/{id}", userHandler.GetUserByIDHandler).Methods("GET", "OPTIONS")
    // Alteração de senha
    apiRouter.HandleFunc("/users/password", userHandler.UpdateUserPassword).Methods("PUT", "OPTIONS")
    
    // Função auxiliar para aplicar middleware AdminOnly a cada rota individual
    adminOnly := func(handler http.HandlerFunc) http.Handler {
        return middleware.AdminOnly(http.HandlerFunc(handler))
    }
    
    // Rotas de admin - cada uma protegida individualmente com middleware AdminOnly
    apiRouter.Handle("/users", adminOnly(userHandler.GetAllUsers)).Methods("GET", "OPTIONS")
    apiRouter.Handle("/users", adminOnly(userHandler.UpdateUser)).Methods("PUT", "OPTIONS")
    apiRouter.Handle("/users", adminOnly(userHandler.CreateUser)).Methods("POST", "OPTIONS")
    apiRouter.Handle("/users/{id}", adminOnly(userHandler.DeleteUser)).Methods("DELETE", "OPTIONS")
    
    // Proteção de rotas de settings adicionadas futuramente
    apiRouter.Handle("/settings/users", adminOnly(userHandler.GetAllUsers)).Methods("GET", "OPTIONS")
    apiRouter.Handle("/settings/register", adminOnly(userHandler.CreateUser)).Methods("POST", "OPTIONS")
    
    log.Println("Servidor rodando na porta 8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}