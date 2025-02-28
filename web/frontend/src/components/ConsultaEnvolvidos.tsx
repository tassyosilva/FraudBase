import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Definição do tipo para os envolvidos retornados pela API
interface Envolvido {
  id: number;
  numero_do_bo: string;
  tipo_envolvido: string;
  nomecompleto: string;
  cpf: string;
  nomedamae: string;
  nascimento: string;
  nacionalidade: string;
  naturalidade: string;
  uf_envolvido: string;
  sexo_envolvido: string;
  telefone_envolvido: string;
  data_fato: string;
  delegacia_responsavel: string;
  situacao: string;
  natureza: string;
  // Campos adicionais quando visualizar detalhes
  cep_fato?: string;
  latitude_fato?: string;
  longitude_fato?: string;
  logradouro_fato?: string;
  numerocasa_fato?: string;
  bairro_fato?: string;
  municipio_fato?: string;
  pais_fato?: string;
  relato_historico?: string;
  instituicao_bancaria?: string;
  endereco_ip?: string;
  valor?: string;
  pix_utilizado?: string;
  numero_conta_bancaria?: string;
  numero_boleto?: string;
  processo_banco?: string;
  numero_agencia_bancaria?: string;
  cartao?: string;
  terminal?: string;
  tipo_pagamento?: string;
  orgao_concessionaria?: string;
  veiculo?: string;
  terminal_conexao?: string;
  erb?: string;
  operacao_policial?: string;
  numero_laudo_pericial?: string;
}

const ConsultaEnvolvidos = () => {
  // Estados para os filtros de busca
  const [filters, setFilters] = useState({
    nome: '',
    cpf: '',
    bo: ''
  });

  // Estado para a lista de envolvidos
  const [envolvidos, setEnvolvidos] = useState<Envolvido[]>([]);
  
  // Estado para o envolvido selecionado para visualização detalhada
  const [selectedEnvolvido, setSelectedEnvolvido] = useState<Envolvido | null>(null);
  
  // Estado para controlar o loading
  const [loading, setLoading] = useState(false);
  
  // Estado para mensagens de sucesso ou erro
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error'
  });

  // Estados para paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estado para controle do modal de detalhes
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Função para atualizar os filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para buscar envolvidos
  const handleSearch = async () => {
    setLoading(true);
    try {
      // Construir query string com os filtros
      const queryParams = new URLSearchParams();
      if (filters.nome) queryParams.append('nome', filters.nome);
      if (filters.cpf) queryParams.append('cpf', filters.cpf);
      if (filters.bo) queryParams.append('bo', filters.bo);

      const response = await fetch(`http://localhost:8080/api/consulta-envolvidos?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar envolvidos');
      }

      const data = await response.json();
      setEnvolvidos(data);
      
      if (data.length === 0) {
        setAlert({
          open: true,
          message: 'Nenhum resultado encontrado para os filtros informados.',
          severity: 'info'
        });
      } else {
        setAlert({
          open: true,
          message: `${data.length} resultado(s) encontrado(s).`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar envolvidos:', error);
      setAlert({
        open: true,
        message: 'Erro ao buscar envolvidos. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar detalhes de um envolvido
  const handleLoadDetails = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/consulta-envolvidos/${id}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar detalhes do envolvido');
      }

      const data = await response.json();
      setSelectedEnvolvido(data);
      setDetailsModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      setAlert({
        open: true,
        message: 'Erro ao carregar detalhes do envolvido.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Funções para paginação
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Função para fechar o alerta
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Função para fechar o modal de detalhes
  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedEnvolvido(null);
  };

  // Formatar data para exibição (YYYY-MM-DD para DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Se já estiver no formato brasileiro, retorna como está
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;
    
    // Converte de YYYY-MM-DD para DD/MM/YYYY
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, color: '#FFFFFF', fontWeight: 'medium' }}>
        Consulta de Envolvidos em Crimes de Estelionato
      </Typography>

      {/* Filtros de busca */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Nome"
              name="nome"
              value={filters.nome}
              onChange={handleFilterChange}
              variant="outlined"
              placeholder="Digite o nome para pesquisa"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="CPF"
              name="cpf"
              value={filters.cpf}
              onChange={handleFilterChange}
              variant="outlined"
              placeholder="Digite o CPF para pesquisa"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Número do BO"
              name="bo"
              value={filters.bo}
              onChange={handleFilterChange}
              variant="outlined"
              placeholder="Digite o número do BO"
            />
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
              sx={{
                height: '56px',
                backgroundColor: '#FFD700',
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#E5C100'
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Tabela de resultados */}
      <TableContainer component={Paper} sx={{ mb: 3, maxHeight: 440 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Número BO</TableCell>
              <TableCell>Data do Fato</TableCell>
              <TableCell>Natureza</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : envolvidos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nenhum resultado encontrado
                </TableCell>
              </TableRow>
            ) : (
              envolvidos
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((envolvido) => (
                  <TableRow key={envolvido.id} hover>
                    <TableCell>{envolvido.id}</TableCell>
                    <TableCell>{envolvido.nomecompleto}</TableCell>
                    <TableCell>{envolvido.cpf}</TableCell>
                    <TableCell>{envolvido.tipo_envolvido}</TableCell>
                    <TableCell>{envolvido.numero_do_bo}</TableCell>
                    <TableCell>{formatDate(envolvido.data_fato)}</TableCell>
                    <TableCell>{envolvido.natureza}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleLoadDetails(envolvido.id)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={envolvidos.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Modal para exibir detalhes do envolvido */}
      <Dialog
        open={detailsModalOpen}
        onClose={handleCloseDetailsModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Detalhes do Envolvido
        </DialogTitle>
        <DialogContent dividers>
          {selectedEnvolvido && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Informações Pessoais</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Nome Completo:</Typography>
                <Typography variant="body1" gutterBottom>{selectedEnvolvido.nomecompleto}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">CPF:</Typography>
                <Typography variant="body1" gutterBottom>{selectedEnvolvido.cpf}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Nome da Mãe:</Typography>
                <Typography variant="body1" gutterBottom>{selectedEnvolvido.nomedamae}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Data de Nascimento:</Typography>
                <Typography variant="body1" gutterBottom>{formatDate(selectedEnvolvido.nascimento)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Nacionalidade:</Typography>
                <Typography variant="body1" gutterBottom>{selectedEnvolvido.nacionalidade}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Naturalidade:</Typography>
                <Typography variant="body1" gutterBottom>{selectedEnvolvido.naturalidade}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">UF:</Typography>
                <Typography variant="body1" gutterBottom>{selectedEnvolvido.uf_envolvido}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Sexo:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.sexo_envolvido}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Telefone:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.telefone_envolvido}</Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Dados da Ocorrência</Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Número do BO:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.numero_do_bo}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Tipo de Envolvido:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.tipo_envolvido}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Data do Fato:</Typography>
                                <Typography variant="body1" gutterBottom>{formatDate(selectedEnvolvido.data_fato)}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Natureza:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.natureza}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Situação:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.situacao}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Delegacia Responsável:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.delegacia_responsavel}</Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Local do Fato</Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">CEP:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.cep_fato}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Logradouro:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.logradouro_fato}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Número:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.numerocasa_fato}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Bairro:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.bairro_fato}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Município:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.municipio_fato}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">País:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.pais_fato}</Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Dados Financeiros</Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Instituição Bancária:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.instituicao_bancaria}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Valor:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.valor}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">PIX Utilizado:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.pix_utilizado}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Número da Conta:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.numero_conta_bancaria}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Número da Agência:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.numero_agencia_bancaria}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Cartão:</Typography>
                                <Typography variant="body1" gutterBottom>{selectedEnvolvido.cartao}</Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Relato</Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1">{selectedEnvolvido.relato_historico}</Typography>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetailsModal} color="primary">
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para alertas */}
            <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity={alert.severity}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default ConsultaEnvolvidos;

