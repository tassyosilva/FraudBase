package models

type User struct {
    ID             int    `json:"id"`
    Login          string `json:"login"`
    Nome           string `json:"nome"`
    CPF            string `json:"cpf"`
    Matricula      string `json:"matricula"`
    Telefone       string `json:"telefone"`
    Cidade         string `json:"cidade"`
    Estado         string `json:"estado"`
    UnidadePolicial string `json:"unidade_policial"`
    Email          string `json:"email"`
    Senha          string `json:"senha,omitempty"`
    IsAdmin        bool   `json:"is_admin"`
}