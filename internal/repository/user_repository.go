package repository

import (
    "database/sql"
    "log"
    "fraudbase/internal/models"
)

type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

func (r *UserRepository) GetUserByLogin(login string) (*models.User, error) {
    log.Printf("Tentando buscar usuário com login: %s", login)
    
    query := "SELECT id, login, nome, cpf, matricula, telefone, unidade_policial, email, senha, is_admin FROM usuarios WHERE login = $1"
    log.Printf("Executando query: %s", query)
    
    user := &models.User{}
    err := r.db.QueryRow(query, login).Scan(
        &user.ID, 
        &user.Login, 
        &user.Nome, 
        &user.CPF, 
        &user.Matricula, 
        &user.Telefone, 
        &user.UnidadePolicial, 
        &user.Email, 
        &user.Senha, 
        &user.IsAdmin,
    )
    
    if err != nil {
        log.Printf("Erro ao buscar usuário: %v", err)
        return nil, err
    }
    
    log.Printf("Usuário encontrado: %+v", user)
    return user, nil
}