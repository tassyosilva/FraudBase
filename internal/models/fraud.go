package models

type Fraud struct {
    ID          int    `json:"id"`
    Nome        string `json:"nome"`
    CPF         string `json:"cpf"`
    Telefone    string `json:"telefone"`
    TipoFraude  string `json:"tipo_fraude"`
    DataRegistro string `json:"data_registro"`
}

// Envolvido representa um registro na tabela tabela_estelionato
type Envolvido struct {
    ID                    int    `json:"id"`
    NumeroBO              string `json:"numero_do_bo"`
    TipoEnvolvido         string `json:"tipo_envolvido"`
    NomeCompleto          string `json:"nomecompleto"`
    CPF                   string `json:"cpf"`
    NomeMae               string `json:"nomedamae"`
    Nascimento            string `json:"nascimento"`
    Nacionalidade         string `json:"nacionalidade"`
    Naturalidade          string `json:"naturalidade"`
    UFEnvolvido           string `json:"uf_envolvido"`
    SexoEnvolvido         string `json:"sexo_envolvido"`
    TelefoneEnvolvido     string `json:"telefone_envolvido"`
    DataFato              string `json:"data_fato"`
    CEPFato               string `json:"cep_fato"`
    LatitudeFato          string `json:"latitude_fato"`
    LongitudeFato         string `json:"longitude_fato"`
    LogradouroFato        string `json:"logradouro_fato"`
    NumeroCasaFato        string `json:"numerocasa_fato"`
    BairroFato            string `json:"bairro_fato"`
    MunicipioFato         string `json:"municipio_fato"`
    PaisFato              string `json:"pais_fato"`
    DelegaciaResponsavel  string `json:"delegacia_responsavel"`
    Situacao              string `json:"situacao"`
    Natureza              string `json:"natureza"`
    RelatoHistorico       string `json:"relato_historico"`
    InstituicaoBancaria   string `json:"instituicao_bancaria"`
    EnderecoIP            string `json:"endereco_ip"`
    Valor                 string `json:"valor"`
    PixUtilizado          string `json:"pix_utilizado"`
    NumeroContaBancaria   string `json:"numero_conta_bancaria"`
    NumeroBoleto          string `json:"numero_boleto"`
    ProcessoBanco         string `json:"processo_banco"`
    NumeroAgenciaBancaria string `json:"numero_agencia_bancaria"`
    Cartao                string `json:"cartao"`
    Terminal              string `json:"terminal"`
    TipoPagamento         string `json:"tipo_pagamento"`
    OrgaoConcessionaria   string `json:"orgao_concessionaria"`
    Veiculo               string `json:"veiculo"`
    TerminalConexao       string `json:"terminal_conexao"`
    ERB                   string `json:"erb"`
    OperacaoPolicial      string `json:"operacao_policial"`
    NumeroLaudoPericial   string `json:"numero_laudo_pericial"`
}