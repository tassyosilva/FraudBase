import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import API_BASE_URL from '../config/api';

// Tipos de envolvidos
const tiposEnvolvidos = [
  { value: 'Suposto Autor/infrator', label: 'Suposto Autor/infrator' },
  { value: 'Comunicante, Vítima', label: 'Comunicante, Vítima' },
  { value: 'Envolvido', label: 'Envolvido' },
  { value: 'Testemunha', label: 'Testemunha' },
  { value: 'Vítima', label: 'Vítima' }
];

// Opções para sexo
const sexoOptions = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'Sem informação', label: 'Sem informação' }
];

// Opções para situação
const situacaoOptions = [
  { value: 'Finalizado', label: 'Finalizado' },
  { value: 'Registrado', label: 'Registrado' }
];

// Opções para natureza
const naturezaOptions = [
  { value: 'Estelionato', label: 'Estelionato' },
  { value: 'Fraude Eletrônica', label: 'Fraude Eletrônica' },
  { value: 'Outros', label: 'Outros' }
];

const CadastroEnvolvidos = () => {
  // Estado para controlar os painéis expandidos do Accordion
  const [expanded, setExpanded] = useState<string | false>('panel1');
  // Estado para mensagens de sucesso ou erro
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  // Estado para armazenar a lista de municípios
  const [municipios, setMunicipios] = useState<{ municipio: string }[]>([]);
  // Estado para controlar o carregamento dos municípios
  const [municipiosLoading, setMunicipiosLoading] = useState(false);
  // Estado para armazenar a lista de UFs
  const [ufs, setUfs] = useState<{ uf: string }[]>([]);
  // Estado para controlar o carregamento das UFs
  const [ufsLoading, setUfsLoading] = useState(false);
  // Estado para armazenar a lista de países
  const [paises, setPaises] = useState<{ nome_pais: string }[]>([]);
  // Estado para controlar o carregamento dos países
  const [paisesLoading, setPaisesLoading] = useState(false);
  // Estado para armazenar a lista de delegacias
  const [delegacias, setDelegacias] = useState<{ nome: string }[]>([]);
  // Estado para controlar o carregamento das delegacias
  const [delegaciasLoading, setDelegaciasLoading] = useState(false);
  // Estado para armazenar a lista de bancos
  const [bancos, setBancos] = useState<{ nome_completo: string }[]>([]);
  // Estado para controlar o carregamento dos bancos
  const [bancosLoading, setBancosLoading] = useState(false);

  // Estado para os dados do formulário
  const [formData, setFormData] = useState({
    id: '',
    numero_do_bo: '',
    tipo_envolvido: '',
    nomecompleto: '',
    cpf: '',
    nomedamae: '',
    nascimento: '',
    nacionalidade: '',
    naturalidade: '',
    uf_envolvido: '',
    sexo_envolvido: '',
    telefone_envolvido: '',
    data_fato: '',
    cep_fato: '',
    latitude_fato: '',
    longitude_fato: '',
    logradouro_fato: '',
    numerocasa_fato: '',
    bairro_fato: '',
    municipio_fato: '',
    pais_fato: '',
    delegacia_responsavel: '',
    situacao: '',
    natureza: '',
    relato_historico: '',
    instituicao_bancaria: '',
    endereco_ip: '',
    valor: '',
    pix_utilizado: '',
    numero_conta_bancaria: '',
    numero_boleto: '',
    processo_banco: '',
    numero_agencia_bancaria: '',
    cartao: '',
    terminal: '',
    tipo_pagamento: '',
    orgao_concessionaria: '',
    veiculo: '',
    terminal_conexao: '',
    erb: '',
    operacao_policial: '',
    numero_laudo_pericial: ''
  });

  // Função para buscar municípios da API
  const fetchMunicipios = async () => {
    setMunicipiosLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/municipios`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar municípios');
      }

      const data = await response.json();
      setMunicipios(data);
    } catch (error) {
      console.error('Erro ao buscar municípios:', error);
      setAlert({
        open: true,
        message: 'Erro ao carregar lista de municípios.',
        severity: 'error'
      });
    } finally {
      setMunicipiosLoading(false);
    }
  };

  // Função para buscar UFs
  const fetchUFs = async () => {
    setUfsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/ufs', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar UFs');
      }

      const data = await response.json();
      setUfs(data);
    } catch (error) {
      console.error('Erro ao buscar UFs:', error);
      setAlert({
        open: true,
        message: 'Erro ao carregar lista de UFs.',
        severity: 'error'
      });
    } finally {
      setUfsLoading(false);
    }
  };

  // Função para buscar países
  const fetchPaises = async () => {
    setPaisesLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/paises', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar países');
      }

      const data = await response.json();
      setPaises(data);
    } catch (error) {
      console.error('Erro ao buscar países:', error);
      setAlert({
        open: true,
        message: 'Erro ao carregar lista de países.',
        severity: 'error'
      });
    } finally {
      setPaisesLoading(false);
    }
  };

  // Função para buscar delegacias
  const fetchDelegacias = async () => {
    setDelegaciasLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/delegacias', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar delegacias');
      }

      const data = await response.json();
      setDelegacias(data);
    } catch (error) {
      console.error('Erro ao buscar delegacias:', error);
      setAlert({
        open: true,
        message: 'Erro ao carregar lista de delegacias.',
        severity: 'error'
      });
    } finally {
      setDelegaciasLoading(false);
    }
  };

  // Função para buscar bancos
  const fetchBancos = async () => {
    setBancosLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/bancos', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar bancos');
      }

      const data = await response.json();
      setBancos(data);
    } catch (error) {
      console.error('Erro ao buscar bancos:', error);
      setAlert({
        open: true,
        message: 'Erro ao carregar lista de bancos.',
        severity: 'error'
      });
    } finally {
      setBancosLoading(false);
    }
  };

  // Carregar municípios, UFs, países, delegacias e bancos quando o componente montar
  useEffect(() => {
    fetchMunicipios();
    fetchUFs();
    fetchPaises();
    fetchDelegacias();
    fetchBancos();
  }, []);

  // Função para validar o CPF (apenas verificação de 11 dígitos)
  const validateCPF = (cpf: string) => {
    if (cpf) {
      const digits = cpf.replace(/\D/g, '');
      if (digits.length !== 11) {
        return 'CPF deve conter 11 dígitos';
      }
    }
    return '';
  };

  // Estado para erros de validação
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Função para lidar com a expansão do Accordion
  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };
  // Função para lidar com mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cpf') {
      const formattedCPF = formatCPF(value);

      setFormData({
        ...formData,
        [name]: formattedCPF
      });

      const cpfDigitsOnly = value.replace(/\D/g, '');
      if (cpfDigitsOnly && cpfDigitsOnly.length !== 11) {
        setErrors({
          ...errors,
          cpf: 'CPF deve conter 11 dígitos'
        });
      } else {
        const { cpf, ...restErrors } = errors;
        setErrors(restErrors);
      }
    } else if (name === 'telefone_envolvido') {
      const formattedPhone = formatPhone(value);

      setFormData({
        ...formData,
        [name]: formattedPhone
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar CPF se existir
    if (formData.cpf) {
      const cpfError = validateCPF(formData.cpf);
      if (cpfError) {
        setErrors({
          ...errors,
          cpf: cpfError
        });
        return;
      }
    }

    try {
      const response = await fetch('http://localhost:8080/api/envolvidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setAlert({
          open: true,
          message: data.message || 'Erro ao cadastrar envolvido',
          severity: 'error'
        });
        return;
      }

      setAlert({
        open: true,
        message: 'Envolvido cadastrado com sucesso!',
        severity: 'success'
      });

      // Limpar o formulário após cadastro bem-sucedido
      setFormData({
        id: '',
        numero_do_bo: '',
        tipo_envolvido: '',
        nomecompleto: '',
        cpf: '',
        nomedamae: '',
        nascimento: '',
        nacionalidade: '',
        naturalidade: '',
        uf_envolvido: '',
        sexo_envolvido: '',
        telefone_envolvido: '',
        data_fato: '',
        cep_fato: '',
        latitude_fato: '',
        longitude_fato: '',
        logradouro_fato: '',
        numerocasa_fato: '',
        bairro_fato: '',
        municipio_fato: '',
        pais_fato: '',
        delegacia_responsavel: '',
        situacao: '',
        natureza: '',
        relato_historico: '',
        instituicao_bancaria: '',
        endereco_ip: '',
        valor: '',
        pix_utilizado: '',
        numero_conta_bancaria: '',
        numero_boleto: '',
        processo_banco: '',
        numero_agencia_bancaria: '',
        cartao: '',
        terminal: '',
        tipo_pagamento: '',
        orgao_concessionaria: '',
        veiculo: '',
        terminal_conexao: '',
        erb: '',
        operacao_policial: '',
        numero_laudo_pericial: ''
      });

    } catch (err) {
      setAlert({
        open: true,
        message: 'Erro ao cadastrar envolvido. Tente novamente.',
        severity: 'error'
      });
    }
  };

  // Função para fechar o alerta
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, color: '#FFFFFF', fontWeight: 'medium' }}>
        Cadastro de Envolvidos em Crimes de Estelionato
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        {/* Accordion para Dados do Envolvido */}
        <Accordion
          expanded={expanded === 'panel1'}
          onChange={handleAccordionChange('panel1')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Dados do Envolvido</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Tipo de Envolvido"
                  name="tipo_envolvido"
                  value={formData.tipo_envolvido}
                  onChange={handleChange}
                  variant="outlined"
                >
                  {tiposEnvolvidos.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  name="nomecompleto"
                  value={formData.nomecompleto}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CPF"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  variant="outlined"
                  error={!!errors.cpf}
                  helperText={errors.cpf}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome da Mãe"
                  name="nomedamae"
                  value={formData.nomedamae}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data de Nascimento"
                  name="nascimento"
                  type="date"
                  value={formData.nascimento}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Nacionalidade"
                  name="nacionalidade"
                  value={formData.nacionalidade}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={paisesLoading}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    },
                  }}
                >
                  {paises.map((option) => (
                    <MenuItem key={option.nome_pais} value={option.nome_pais}>
                      {option.nome_pais}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Naturalidade"
                  name="naturalidade"
                  value={formData.naturalidade}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={municipiosLoading}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    },
                  }}
                >
                  {municipios.map((option) => (
                    <MenuItem key={option.municipio} value={option.municipio}>
                      {option.municipio}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="UF"
                  name="uf_envolvido"
                  value={formData.uf_envolvido}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={ufsLoading}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    },
                  }}
                >
                  {ufs.map((option) => (
                    <MenuItem key={option.uf} value={option.uf}>
                      {option.uf}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Sexo"
                  name="sexo_envolvido"
                  value={formData.sexo_envolvido}
                  onChange={handleChange}
                  variant="outlined"
                >
                  {sexoOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="telefone_envolvido"
                  value={formData.telefone_envolvido}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Accordion para Dados do Fato */}
        <Accordion
          expanded={expanded === 'panel2'}
          onChange={handleAccordionChange('panel2')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Dados do Fato</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data do Fato"
                  name="data_fato"
                  type="date"
                  value={formData.data_fato}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CEP"
                  name="cep_fato"
                  value={formData.cep_fato}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  name="latitude_fato"
                  value={formData.latitude_fato}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  name="longitude_fato"
                  value={formData.longitude_fato}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Logradouro"
                  name="logradouro_fato"
                  value={formData.logradouro_fato}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número"
                  name="numerocasa_fato"
                  value={formData.numerocasa_fato}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bairro"
                  name="bairro_fato"
                  value={formData.bairro_fato}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Município"
                  name="municipio_fato"
                  value={formData.municipio_fato}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={municipiosLoading}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    },
                  }}
                >
                  {municipios.map((option) => (
                    <MenuItem key={option.municipio} value={option.municipio}>
                      {option.municipio}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="País"
                  name="pais_fato"
                  value={formData.pais_fato}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={paisesLoading}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    },
                  }}
                >
                  {paises.map((option) => (
                    <MenuItem key={option.nome_pais} value={option.nome_pais}>
                      {option.nome_pais}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Accordion para Dados da Ocorrência */}
        <Accordion
          expanded={expanded === 'panel3'}
          onChange={handleAccordionChange('panel3')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Dados da Ocorrência</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número do BO"
                  name="numero_do_bo"
                  value={formData.numero_do_bo}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Delegacia Responsável"
                  name="delegacia_responsavel"
                  value={formData.delegacia_responsavel}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={delegaciasLoading}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    },
                  }}
                >
                  {delegacias.map((option) => (
                    <MenuItem key={option.nome} value={option.nome}>
                      {option.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Situação"
                  name="situacao"
                  value={formData.situacao}
                  onChange={handleChange}
                  variant="outlined"
                >
                  {situacaoOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Natureza"
                  name="natureza"
                  value={formData.natureza}
                  onChange={handleChange}
                  variant="outlined"
                >
                  {naturezaOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Relato/Histórico"
                  name="relato_historico"
                  value={formData.relato_historico}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Accordion para Dados Financeiros */}
        <Accordion
          expanded={expanded === 'panel4'}
          onChange={handleAccordionChange('panel4')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Dados Financeiros</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Instituição Bancária"
                  name="instituicao_bancaria"
                  value={formData.instituicao_bancaria}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={bancosLoading}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    },
                  }}
                >
                  {bancos.map((option) => (
                    <MenuItem key={option.nome_completo} value={option.nome_completo}>
                      {option.nome_completo}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valor"
                  name="valor"
                  value={formData.valor}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="PIX Utilizado"
                  name="pix_utilizado"
                  value={formData.pix_utilizado}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número da Conta Bancária"
                  name="numero_conta_bancaria"
                  value={formData.numero_conta_bancaria}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número do Boleto"
                  name="numero_boleto"
                  value={formData.numero_boleto}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Processo do Banco"
                  name="processo_banco"
                  value={formData.processo_banco}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número da Agência Bancária"
                  name="numero_agencia_bancaria"
                  value={formData.numero_agencia_bancaria}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cartão"
                  name="cartao"
                  value={formData.cartao}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tipo de Pagamento"
                  name="tipo_pagamento"
                  value={formData.tipo_pagamento}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Accordion para Dados Técnicos */}
        <Accordion
          expanded={expanded === 'panel5'}
          onChange={handleAccordionChange('panel5')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Dados Técnicos</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Endereço IP"
                  name="endereco_ip"
                  value={formData.endereco_ip}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Terminal"
                  name="terminal"
                  value={formData.terminal}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Órgão/Concessionária"
                  name="orgao_concessionaria"
                  value={formData.orgao_concessionaria}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Veículo"
                  name="veiculo"
                  value={formData.veiculo}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Terminal de Conexão"
                  name="terminal_conexao"
                  value={formData.terminal_conexao}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ERB"
                  name="erb"
                  value={formData.erb}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Operação Policial"
                  name="operacao_policial"
                  value={formData.operacao_policial}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número do Laudo Pericial"
                  name="numero_laudo_pericial"
                  value={formData.numero_laudo_pericial}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Botão de Salvar */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: '#FFD700',
              color: '#000000',
              '&:hover': {
                backgroundColor: '#E5C100'
              }
            }}
          >
            Cadastrar Envolvido
          </Button>
        </Box>
      </Box>

      {/* Snackbar para alertas */}
      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CadastroEnvolvidos;

const formatCPF = (cpf: string) => {
  const numbers = cpf.replace(/\D/g, '');
  const cpfLimited = numbers.slice(0, 11);

  return cpfLimited.replace(
    /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
    '$1.$2.$3-$4'
  ).replace(
    /^(\d{3})(\d{3})(\d{3})(\d*)$/,
    '$1.$2.$3-$4'
  ).replace(
    /^(\d{3})(\d{3})(\d*)$/,
    '$1.$2.$3'
  ).replace(
    /^(\d{3})(\d*)$/,
    '$1.$2'
  );
};

const formatPhone = (phone: string) => {
  const numbers = phone.replace(/\D/g, '');
  const phoneLimited = numbers.slice(0, 11);

  if (phoneLimited.length >= 10) {
    const ddd = phoneLimited.slice(0, 2);
    const firstPart = phoneLimited.slice(2, -4);
    const lastPart = phoneLimited.slice(-4);
    return `(${ddd})${firstPart}-${lastPart}`;
  } else if (phoneLimited.length > 2) {
    const ddd = phoneLimited.slice(0, 2);
    const rest = phoneLimited.slice(2);
    return `(${ddd})${rest}`;
  }
  
  return phoneLimited;
};