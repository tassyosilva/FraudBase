package repository

import (
    "database/sql"
    "fmt"
    "golang.org/x/crypto/bcrypt"
    "fraudbase/internal/models"
)

type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

func (r *UserRepository) GetUserByLogin(login string) (*models.User, error) {
    user := &models.User{}
    
    query := "SELECT id, login, nome, cpf, matricula, telefone, COALESCE(cidade, '') as cidade, COALESCE(estado, '') as estado, unidade_policial, email, senha, is_admin FROM usuarios WHERE login = $1"
    
    err := r.db.QueryRow(query, login).Scan(
        &user.ID,
        &user.Login,
        &user.Nome,
        &user.CPF,
        &user.Matricula,
        &user.Telefone,
        &user.Cidade,
        &user.Estado,
        &user.UnidadePolicial,
        &user.Email,
        &user.Senha,
        &user.IsAdmin,
    )
    if err != nil {
        return nil, err
    }
    return user, nil
}

func (r *UserRepository) CreateUser(user *models.User) error {
    // Verifica se o email já existe
    var count int
    err := r.db.QueryRow("SELECT COUNT(*) FROM usuarios WHERE email = $1", user.Email).Scan(&count)
    if err != nil {
        return err
    }
    if count > 0 {
        return fmt.Errorf("Email já cadastrado")
    }

    // Verifica se o login já existe
    err = r.db.QueryRow("SELECT COUNT(*) FROM usuarios WHERE login = $1", user.Login).Scan(&count)
    if err != nil {
        return err
    }
    if count > 0 {
        return fmt.Errorf("Login já cadastrado")
    }

    // Continua com o cadastro
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Senha), bcrypt.DefaultCost)
    if err != nil {
        return err
    }

    query := `
        INSERT INTO usuarios (login, nome, cpf, matricula, telefone, cidade, estado, unidade_policial, email, senha, is_admin)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `

    _, err = r.db.Exec(query,
        user.Login,
        user.Nome,
        user.CPF,
        user.Matricula,
        user.Telefone,
        user.Cidade,
        user.Estado,
        user.UnidadePolicial,
        user.Email,
        string(hashedPassword),
        user.IsAdmin,
    )

    return err
}

// GetAllUsers retorna todos os usuários do banco de dados
func (ur *UserRepository) GetAllUsers() ([]models.User, error) {
    var users []models.User
    
    query := `SELECT id, login, nome, cpf, matricula, telefone, COALESCE(cidade, '') as cidade, COALESCE(estado, '') as estado, unidade_policial, email, is_admin 
              FROM usuarios ORDER BY nome`
    
    rows, err := ur.db.Query(query)
    if err != nil {
        return nil, fmt.Errorf("erro ao buscar usuários: %v", err)
    }
    defer rows.Close()
    
    for rows.Next() {
        var user models.User
        err := rows.Scan(
            &user.ID,
            &user.Login,
            &user.Nome,
            &user.CPF,
            &user.Matricula,
            &user.Telefone,
            &user.Cidade,
            &user.Estado,
            &user.UnidadePolicial,
            &user.Email,
            &user.IsAdmin,
        )
        if err != nil {
            return nil, fmt.Errorf("erro ao escanear usuário: %v", err)
        }
        // Não incluímos a senha na resposta
        users = append(users, user)
    }
    
    if err = rows.Err(); err != nil {
        return nil, fmt.Errorf("erro ao iterar sobre os resultados: %v", err)
    }
    
    return users, nil
}

// UpdateUser atualiza os dados de um usuário existente
func (ur *UserRepository) UpdateUser(user models.User) error {
    query := `UPDATE usuarios SET 
                login = $1, 
                nome = $2, 
                cpf = $3, 
                matricula = $4, 
                telefone = $5,
                cidade = $6,
                estado = $7, 
                unidade_policial = $8, 
                email = $9, 
                is_admin = $10,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = $11`
    
    _, err := ur.db.Exec(
        query,
        user.Login,
        user.Nome,
        user.CPF,
        user.Matricula,
        user.Telefone,
        user.Cidade,
        user.Estado,
        user.UnidadePolicial,
        user.Email,
        user.IsAdmin,
        user.ID,
    )
    
    if err != nil {
        return fmt.Errorf("erro ao atualizar usuário: %v", err)
    }
    
    return nil
}

// UpdateUserPassword atualiza apenas a senha do usuário
func (ur *UserRepository) UpdateUserPassword(userID int, hashedPassword string) error {
    query := `UPDATE usuarios SET senha = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`
    
    _, err := ur.db.Exec(query, hashedPassword, userID)
    if err != nil {
        return fmt.Errorf("erro ao atualizar senha: %v", err)
    }
    
    return nil
}

// DeleteUser remove um usuário do sistema
func (ur *UserRepository) DeleteUser(userID int) error {
    query := `DELETE FROM usuarios WHERE id = $1`
    
    _, err := ur.db.Exec(query, userID)
    if err != nil {
        return fmt.Errorf("erro ao excluir usuário: %v", err)
    }
    
    return nil
}

// GetUserByID busca um usuário pelo ID
func (ur *UserRepository) GetUserByID(userID int) (models.User, error) {
    var user models.User
    
    query := `SELECT id, login, nome, cpf, matricula, telefone, COALESCE(cidade, '') as cidade, COALESCE(estado, '') as estado, unidade_policial, email, is_admin 
              FROM usuarios WHERE id = $1`
    
    err := ur.db.QueryRow(query, userID).Scan(
        &user.ID,
        &user.Login,
        &user.Nome,
        &user.CPF,
        &user.Matricula,
        &user.Telefone,
        &user.Cidade,
        &user.Estado,
        &user.UnidadePolicial,
        &user.Email,
        &user.IsAdmin,
    )
    
    if err != nil {
        return models.User{}, fmt.Errorf("erro ao buscar usuário: %v", err)
    }
    
    return user, nil
}