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
    log.Println("Iniciando FraudBase API...")

    // Conectar ao banco de dados (agora com migrações automáticas)
    db, err := database.ConnectDB()
    if err != nil {
        log.Fatalf("Falha ao conectar com o banco de dados: %v", err)
    }
    defer db.Close()

    log.Println("Banco de dados conectado e configurado com sucesso!")

    // Inicializar todos os repositórios (mantendo os existentes)
    userRepo := repository.NewUserRepository(db)
    municipioRepo := repository.NewMunicipioRepository(db)
    paisRepo := repository.NewPaisRepository(db)
    delegaciaRepo := repository.NewDelegaciaRepository(db)
    bancoRepo := repository.NewBancoRepository(db)
    envolvidoRepo := repository.NewEnvolvidoRepository(db)
    consultaRepo := repository.NewConsultaRepository(db)
    dashboardRepo := repository.NewDashboardRepository(db)
    reincidenciaRepo := repository.NewReincidenciaRepository(db)
    relatorioRepo := repository.NewRelatorioRepository(db)
    limpezaRepo := repository.NewLimpezaRepository(db)
    boStatsRepo := repository.NewBOStatisticsRepository(db)
    reincidenciaCelularRepo := repository.NewReincidenciaCelularRepository(db)

    // Inicializar todos os handlers (mantendo os existentes)
    authHandler := handlers.NewAuthHandler(userRepo)
    userHandler := handlers.NewUserHandler(userRepo)
    municipioHandler := handlers.NewMunicipioHandler(municipioRepo)
    paisHandler := handlers.NewPaisHandler(paisRepo)
    delegaciaHandler := handlers.NewDelegaciaHandler(delegaciaRepo)
    bancoHandler := handlers.NewBancoHandler(bancoRepo)
    envolvidoHandler := handlers.NewEnvolvidoHandler(envolvidoRepo)
    consultaHandler := handlers.NewConsultaEnvolvidoHandler(consultaRepo)
    dashboardStatsHandler := handlers.NewDashboardStatsHandler(dashboardRepo)
    reincidenciaHandler := handlers.NewReincidenciaHandler(reincidenciaRepo)
    relatorioHandler := handlers.NewRelatorioHandler(relatorioRepo)
    limpezaHandler := handlers.NewLimpezaHandler(limpezaRepo)
    boStatsHandler := handlers.NewBOStatisticsHandler(boStatsRepo)
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
    // NOTA: Essas rotas agora retornarão arrays vazios das tabelas auxiliares
    // mas mantemos as rotas para compatibilidade
    apiRouter.HandleFunc("/municipios", municipioHandler.GetAllMunicipios).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/ufs", municipioHandler.GetAllUFs).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/paises", paisHandler.GetAllPaises).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/delegacias", delegaciaHandler.GetAllDelegacias).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/bancos", bancoHandler.GetAllBancos).Methods("GET", "OPTIONS")
    
    // Rotas principais da aplicação
    apiRouter.HandleFunc("/envolvidos", envolvidoHandler.CreateEnvolvido).Methods("POST", "OPTIONS")
    apiRouter.HandleFunc("/consulta-envolvidos", consultaHandler.GetEnvolvidos).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/consulta-envolvidos/{id}", consultaHandler.GetEnvolvidoById).Methods("GET", "OPTIONS")
    
    // Rotas de dashboard e estatísticas
    apiRouter.HandleFunc("/dashboard/vitimas-por-sexo", dashboardStatsHandler.GetVitimasPorSexo).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/dashboard/vitimas-por-faixa-etaria", dashboardStatsHandler.GetVitimasPorFaixaEtaria).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/dashboard/quantidade-bos", dashboardStatsHandler.GetQuantidadeBOs).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/dashboard/quantidade-infratores", dashboardStatsHandler.GetQuantidadeInfratores).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/dashboard/quantidade-vitimas", dashboardStatsHandler.GetQuantidadeVitimas).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/dashboard/infratores-por-delegacia", dashboardStatsHandler.GetInfratoresPorDelegacia).Methods("GET", "OPTIONS")
    
    // Rotas de reincidência
    apiRouter.HandleFunc("/reincidencia/cpf", reincidenciaHandler.GetReincidenciaPorCPF).Methods("GET", "OPTIONS")
    apiRouter.HandleFunc("/reincidencia/celular", reincidenciaCelularHandler.GetReincidenciaPorCelular).Methods("GET", "OPTIONS")
    
    // Rotas de relatórios e limpeza
    apiRouter.HandleFunc("/upload-relatorio", relatorioHandler.UploadRelatorio).Methods("POST", "OPTIONS")
    apiRouter.HandleFunc("/clean-duplicates", limpezaHandler.LimparDuplicatasHandler).Methods("POST", "OPTIONS")
    apiRouter.HandleFunc("/bo-statistics", boStatsHandler.GetBOStatistics).Methods("GET", "OPTIONS")
    
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

    log.Println("=== FRAUDBASE API INICIADA COM SUCESSO ===")
    log.Println("Servidor rodando na porta 8080")
    log.Println("API disponível em: http://localhost:8080/api")
    
    // Verificar se o usuário admin padrão foi criado
    log.Println("=== CREDENCIAIS DE ACESSO ===")
    log.Println("Login: admin")
    log.Println("Senha: admin123")
    log.Println("⚠️  ALTERE A SENHA APÓS O PRIMEIRO LOGIN!")
    log.Println("=====================================")
    
    log.Fatal(http.ListenAndServe(":8080", r))
}