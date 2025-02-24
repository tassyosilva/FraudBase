package models

type Fraud struct {
    ID          int    `json:"id"`
    Nome        string `json:"nome"`
    CPF         string `json:"cpf"`
    Telefone    string `json:"telefone"`
    TipoFraude  string `json:"tipo_fraude"`
    DataRegistro string `json:"data_registro"`
}
