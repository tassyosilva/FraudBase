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
    err := r.db.QueryRow("SELECT * FROM usuarios WHERE login = $1", login).Scan(
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
        INSERT INTO usuarios (login, nome, cpf, matricula, telefone, unidade_policial, email, senha, is_admin)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `

    _, err = r.db.Exec(query,
        user.Login,
        user.Nome,
        user.CPF,
        user.Matricula,
        user.Telefone,
        user.UnidadePolicial,
        user.Email,
        string(hashedPassword),
        user.IsAdmin,
    )

    return err
}