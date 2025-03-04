package database

import (
    "database/sql"
    "fmt"
    "log"
    "os"
    _ "github.com/lib/pq"
)

func ConnectDB() (*sql.DB, error) {
    log.Println("Iniciando conexão com o banco...")
    
    host := os.Getenv("DB_HOST")
    if host == "" {
        host = "192.168.1.106" // Valor padrão para desenvolvimento
    }
    
    user := os.Getenv("DB_USER")
    if user == "" {
        user = "postgres" // Valor padrão para desenvolvimento
    }
    
    password := os.Getenv("DB_PASSWORD")
    if password == "" {
        password = "123456" // Valor padrão para desenvolvimento
    }
    
    dbname := os.Getenv("DB_NAME")
    if dbname == "" {
        dbname = "fraudbase" // Valor padrão para desenvolvimento
    }
    
    sslmode := os.Getenv("DB_SSLMODE")
    if sslmode == "" {
        sslmode = "disable" // Valor padrão para desenvolvimento
    }
    
    connStr := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=%s", 
                           host, user, password, dbname, sslmode)
    
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        log.Printf("Erro ao abrir conexão: %v", err)
        return nil, err
    }
    
    err = db.Ping()
    if err != nil {
        log.Printf("Erro ao pingar o banco: %v", err)
        return nil, err
    }
    
    log.Println("Conexão estabelecida com sucesso!")
    return db, nil
}
