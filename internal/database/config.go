package database

import (
    "database/sql"
    "log"
    _ "github.com/lib/pq"
)

func ConnectDB() (*sql.DB, error) {
    log.Println("Iniciando conexão com o banco...")
    connStr := "host=192.168.1.106 user=postgres password=123456 dbname=estelionato sslmode=disable"
    
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