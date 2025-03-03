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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
// Importe os ícones adicionais necessários
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';

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
    bo: '',
    pix: '' // Novo campo para PIX
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
      // Sanitizando os filtros para evitar problemas com caracteres especiais
      const sanitizedFilters = {
        nome: filters.nome ? filters.nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '',
        cpf: filters.cpf ? filters.cpf.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '',
        bo: filters.bo ? filters.bo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '',
        pix: filters.pix ? filters.pix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '' // Sanitizando o novo campo PIX
      };

      // Construir query string com os filtros sanitizados
      const queryParams = new URLSearchParams();
      if (sanitizedFilters.nome) queryParams.append('nome', sanitizedFilters.nome);
      if (sanitizedFilters.cpf) queryParams.append('cpf', sanitizedFilters.cpf);
      if (sanitizedFilters.bo) queryParams.append('bo', sanitizedFilters.bo);

      // Alterando o nome do parâmetro para corresponder à coluna no banco de dados
      if (sanitizedFilters.pix) queryParams.append('pix_utilizado', sanitizedFilters.pix);

      const response = await fetch(`http://localhost:8080/api/consulta-envolvidos?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar envolvidos');
      }

      const data = await response.json();
      // Garantir que data é sempre um array
      const resultArray = Array.isArray(data) ? data : [];
      setEnvolvidos(resultArray);

      if (resultArray.length === 0) {
        setAlert({
          open: true,
          message: 'Nenhum resultado encontrado para os filtros informados.',
          severity: 'info'
        });
      } else {
        setAlert({
          open: true,
          message: `${resultArray.length} resultado(s) encontrado(s).`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar envolvidos:', error);
      // Importante: definir envolvidos como array vazio em caso de erro
      setEnvolvidos([]);
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
  const handleChangePage = (_event: unknown, newPage: number) => {
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
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="PIX Utilizado"
              name="pix"
              value={filters.pix}
              onChange={handleFilterChange}
              variant="outlined"
              placeholder="Digite o PIX utilizado"
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
            ) : !envolvidos || envolvidos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nenhum resultado encontrado
                </TableCell>
              </TableRow>
            ) : (
              (envolvidos || [])
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
        count={envolvidos ? envolvidos.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Modal para exibir detalhes do envolvido - Versão melhorada */}
      <Dialog
        open={detailsModalOpen}
        onClose={handleCloseDetailsModal}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: '#1e1e1e',
            backgroundImage: 'linear-gradient(rgba(255, 215, 0, 0.05), rgba(0, 0, 0, 0))',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 215, 0, 0.3)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ color: 'gold', mr: 1, fontSize: 28 }} />
            <Typography variant="h6" component="span">
              Detalhes do Envolvido
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseDetailsModal}
            size="small"
            sx={{
              color: 'white',
              '&:hover': { color: 'gold', backgroundColor: 'rgba(255, 215, 0, 0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3, borderColor: 'rgba(255, 215, 0, 0.1)' }}>
          {selectedEnvolvido && (
            <Box>
              {/* Informações Pessoais */}
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(30, 30, 30, 0.7)',
                  border: '1px solid rgba(255, 215, 0, 0.2)'
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  pb: 1,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <PersonIcon sx={{ color: 'gold', mr: 1 }} />
                  <Typography variant="h6">Informações Pessoais</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Nome Completo:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.nomecompleto}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">CPF:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.cpf}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Nome da Mãe:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.nomedamae}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Data de Nascimento:</Typography>
                      <Typography variant="body1" fontWeight="medium">{formatDate(selectedEnvolvido.nascimento)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Nacionalidade:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.nacionalidade}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Naturalidade:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.naturalidade}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">UF:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.uf_envolvido}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Sexo:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.sexo_envolvido}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Telefone:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.telefone_envolvido}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Dados da Ocorrência */}
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(30, 30, 30, 0.7)',
                  border: '1px solid rgba(255, 215, 0, 0.2)'
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  pb: 1,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <EventIcon sx={{ color: 'gold', mr: 1 }} />
                  <Typography variant="h6">Dados da Ocorrência</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Número do BO:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.numero_do_bo}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Tipo de Envolvido:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.tipo_envolvido}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Data do Fato:</Typography>
                      <Typography variant="body1" fontWeight="medium">{formatDate(selectedEnvolvido.data_fato)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Natureza:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.natureza}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Situação:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.situacao}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Delegacia Responsável:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.delegacia_responsavel}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Local do Fato */}
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(30, 30, 30, 0.7)',
                  border: '1px solid rgba(255, 215, 0, 0.2)'
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  pb: 1,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <LocationOnIcon sx={{ color: 'gold', mr: 1 }} />
                  <Typography variant="h6">Local do Fato</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">CEP:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.cep_fato}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Logradouro:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.logradouro_fato}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Número:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.numerocasa_fato}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Bairro:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.bairro_fato}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Município:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.municipio_fato}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">País:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.pais_fato}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Dados Financeiros */}
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(30, 30, 30, 0.7)',
                  border: '1px solid rgba(255, 215, 0, 0.2)'
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  pb: 1,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <AccountBalanceIcon sx={{ color: 'gold', mr: 1 }} />
                  <Typography variant="h6">Dados Financeiros</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Instituição Bancária:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.instituicao_bancaria}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Valor:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.valor}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">PIX Utilizado:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.pix_utilizado}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Número da Conta:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.numero_conta_bancaria}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Número da Agência:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.numero_agencia_bancaria}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Cartão:</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedEnvolvido.cartao}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Relato */}
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'rgba(30, 30, 30, 0.7)',
                  border: '1px solid rgba(255, 215, 0, 0.2)'
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  pb: 1,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <DescriptionIcon sx={{ color: 'gold', mr: 1 }} />
                  <Typography variant="h6">Relato</Typography>
                </Box>

                <Box sx={{ p: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedEnvolvido.relato_historico || 'Nenhum relato disponível.'}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255, 215, 0, 0.3)' }}>
          <Button
            onClick={handleCloseDetailsModal}
            variant="contained"
            startIcon={<CloseIcon />}
            sx={{
              bgcolor: 'gold',
              color: 'black',
              '&:hover': {
                bgcolor: '#d4af37',
              }
            }}
          >
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