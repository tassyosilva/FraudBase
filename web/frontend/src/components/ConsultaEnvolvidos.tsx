import { useState, useCallback } from 'react';
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
  alpha,
  Chip,
  InputAdornment,
  Tooltip,
  tableCellClasses
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import PhoneIcon from '@mui/icons-material/Phone';

import API_BASE_URL from '../config/api';

// Constantes para cores
const GOLD_COLOR = '#FFD700';
const DARK_BLUE = '#0A1929';
const DARK_BG = '#121212';

// Função de formatação de CPF
const formatCPF = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');

  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);

  // Aplica a máscara
  if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 6) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3)}`;
  } else if (limitedNumbers.length <= 9) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6)}`;
  } else {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9)}`;
  }
};

// Componentes estilizados
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: alpha(GOLD_COLOR, 0.1),
    color: theme.palette.common.white,
    fontWeight: 'bold',
    borderBottom: `1px solid ${alpha(GOLD_COLOR, 0.3)}`
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    borderBottom: `1px solid ${alpha(GOLD_COLOR, 0.1)}`
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.common.white, 0.02),
  },
  '&:hover': {
    backgroundColor: alpha(GOLD_COLOR, 0.05),
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha('#1a1a1a', 0.97)}, ${alpha('#111111', 0.98)})`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 8px 32px 0 ${alpha('#000', 0.37)}`,
  backdropFilter: 'blur(4px)',
  border: `1px solid ${alpha(GOLD_COLOR, 0.1)}`,
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: `radial-gradient(circle at top right, ${alpha(GOLD_COLOR, 0.1)}, transparent 70%)`,
    pointerEvents: 'none'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: alpha(GOLD_COLOR, 0.3),
      transition: 'border-color 0.3s ease',
    },
    '&:hover fieldset': {
      borderColor: alpha(GOLD_COLOR, 0.5),
    },
    '&.Mui-focused fieldset': {
      borderColor: GOLD_COLOR,
    },
    '& input': {
      color: theme.palette.common.white,
    },
  },
  '& .MuiInputLabel-root': {
    color: alpha(theme.palette.common.white, 0.7),
    '&.Mui-focused': {
      color: GOLD_COLOR
    }
  },
}));

// Definição das interfaces
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

interface PaginatedResponse {
  data: Envolvido[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ConsultaEnvolvidos = () => {

  // Estados para os filtros de busca
  const [filters, setFilters] = useState({
    nome: '',
    cpf: '',
    bo: '',
    telefone: ''
  });

  // Estado para a lista de envolvidos
  const [envolvidos, setEnvolvidos] = useState<Envolvido[]>([]);

  // Estados para paginação real no servidor
  const [totalCount, setTotalCount] = useState(0);
  const [, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Estado para o envolvido selecionado para visualização detalhada
  const [selectedEnvolvido, setSelectedEnvolvido] = useState<Envolvido | null>(null);

  // Estado para controlar o loading
  const [loading, setLoading] = useState(false);

  // Estado para mensagens de sucesso ou erro
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning'
  });

  // Estado para controle do modal de detalhes
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Estado para controlar se a busca foi acionada pelo usuário
  // const [searchTriggered, setSearchTriggered] = useState(false); // REMOVIDO - não é mais necessário

  // Função para normalizar texto (remover acentos)
  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  };

  // Busca manual com paginação no servidor
  const handleAutoSearch = useCallback(async (pageNum: number = 1, limitNum: number = rowsPerPage) => {
    const hasValidFilters =
      (filters.nome && filters.nome.length >= 3) ||
      (filters.cpf && filters.cpf.replace(/\D/g, '').length >= 11) ||
      (filters.bo && filters.bo.length >= 3) ||
      (filters.telefone && filters.telefone.length >= 3);

    if (!hasValidFilters) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      if (filters.nome && filters.nome.length >= 3) {
        // Normalizar o nome para remover acentos antes de enviar
        queryParams.append('nome', normalizeText(filters.nome));
      }

      if (filters.cpf && filters.cpf.replace(/\D/g, '').length >= 11) {
        // Enviar apenas os números do CPF para o backend
        queryParams.append('cpf', filters.cpf.replace(/\D/g, ''));
      }

      if (filters.bo && filters.bo.length >= 3) {
        queryParams.append('bo', filters.bo);
      }

      if (filters.telefone && filters.telefone.length >= 3) {
        queryParams.append('telefone', filters.telefone);
      }

      // Adicionar parâmetros de paginação
      queryParams.append('page', pageNum.toString());
      queryParams.append('limit', limitNum.toString());

      const response = await fetch(`${API_BASE_URL}/consulta-envolvidos?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar envolvidos');
      }

      const data: PaginatedResponse = await response.json();

      setEnvolvidos(data.data || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.page || 1);

      if (data.data.length === 0) {
        setAlert({
          open: true,
          message: 'Nenhum resultado encontrado para os filtros informados.',
          severity: 'info'
        });
      } else {
        setAlert({
          open: true,
          message: `${data.totalCount} resultado(s) encontrado(s).`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar envolvidos:', error);
      setEnvolvidos([]);
      setTotalCount(0);
      setTotalPages(0);
      setAlert({
        open: true,
        message: 'Erro ao buscar envolvidos. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [filters.nome, filters.cpf, filters.bo, filters.telefone, rowsPerPage]);

  // Função para atualizar os filtros SEM busca automática
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cpf') {
      // Aplicar formatação de CPF
      const formattedCPF = formatCPF(value);
      setFilters(prev => ({
        ...prev,
        [name]: formattedCPF
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Função para buscar envolvidos (busca manual via botão)
  const handleSearch = async () => {
    const hasValidFilters =
      (filters.nome && filters.nome.length >= 3) ||
      (filters.cpf && filters.cpf.replace(/\D/g, '').length >= 11) ||
      (filters.bo && filters.bo.length >= 3) ||
      (filters.telefone && filters.telefone.length >= 3);

    if (!hasValidFilters) {
      setAlert({
        open: true,
        message: 'Por favor, preencha pelo menos um campo com dados suficientes para busca.',
        severity: 'warning'
      });
      return;
    }

    setCurrentPage(1);
    await handleAutoSearch(1, rowsPerPage);
  };

  // Novas funções para paginação no servidor
  const handlePageChange = (_event: unknown, newPage: number) => {
    const pageNum = newPage + 1; // MUI usa zero-based, backend usa 1-based
    setCurrentPage(pageNum);
    handleAutoSearch(pageNum, rowsPerPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    handleAutoSearch(1, newRowsPerPage);
  };

  // Função para carregar detalhes de um envolvido
  const handleLoadDetails = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/consulta-envolvidos/${id}`, {
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

  // Função truncateText
  const truncateText = (text: string, wordCount: number = 2): string => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
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
    <Box
      sx={{
        animation: 'fadeIn 0.5s ease-in-out',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 }
        }
      }}
    >
      <GradientPaper>
        {/* Cabeçalho decorativo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 4,
            pb: 2,
            borderBottom: `1px solid ${alpha(GOLD_COLOR, 0.3)}`,
          }}
        >
          <AssignmentIndIcon
            sx={{
              fontSize: 40,
              color: GOLD_COLOR,
              mr: 2,
              filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))'
            }}
          />
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: 'white',
                textShadow: '0 0 10px rgba(0,0,0,0.5)',
                letterSpacing: '0.5px'
              }}
            >
              Consulta de Envolvidos
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: alpha('#ffffff', 0.7),
                mt: 0.5
              }}
            >
              Busca detalhada de pessoas envolvidas em ocorrências de fraudes eletrônicas.
            </Typography>
          </Box>
        </Box>

        {/* Filtros de busca */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 2,
            backgroundColor: alpha(DARK_BG, 0.4),
            border: `1px solid ${alpha(GOLD_COLOR, 0.2)}`,
            boxShadow: `0 4px 20px 0 ${alpha('#000', 0.2)}`,
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              color: alpha(GOLD_COLOR, 0.9),
              '&::after': {
                content: '""',
                display: 'block',
                height: '1px',
                background: `linear-gradient(to right, ${alpha(GOLD_COLOR, 0.5)}, transparent)`,
                flexGrow: 1,
                ml: 2
              }
            }}
          >
            <SearchIcon sx={{ mr: 1, fontSize: 20 }} />
            Filtros de Pesquisa
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <StyledTextField
                fullWidth
                label="Nome"
                name="nome"
                value={filters.nome}
                onChange={handleFilterChange}
                variant="outlined"
                placeholder="Digite parte do nome (mín. 3 caracteres)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: alpha(GOLD_COLOR, 0.7) }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <StyledTextField
                fullWidth
                label="CPF"
                name="cpf"
                value={filters.cpf}
                onChange={handleFilterChange}
                variant="outlined"
                placeholder="000.000.000-00"
                inputProps={{
                  maxLength: 14 // Limitar ao tamanho da máscara
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCardIcon sx={{ color: alpha(GOLD_COLOR, 0.7) }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <StyledTextField
                fullWidth
                label="Número do BO"
                name="bo"
                value={filters.bo}
                onChange={handleFilterChange}
                variant="outlined"
                placeholder="Digite parte do número do BO"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ContentPasteIcon sx={{ color: alpha(GOLD_COLOR, 0.7) }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StyledTextField
                fullWidth
                label="Telefone/Celular"
                name="telefone"
                value={filters.telefone}
                onChange={handleFilterChange}
                variant="outlined"
                placeholder="Digite parte do número (mín. 3 dígitos)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: alpha(GOLD_COLOR, 0.7) }} />
                    </InputAdornment>
                  ),
                }}
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
                  background: `linear-gradient(45deg, ${GOLD_COLOR} 30%, #FFC107 90%)`,
                  color: '#000000',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px 0 rgba(255, 215, 0, 0.4)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px 0 rgba(255, 215, 0, 0.5)',
                    background: `linear-gradient(45deg, #FFC107 30%, ${GOLD_COLOR} 90%)`,
                  },
                  '&:disabled': {
                    background: `${alpha(GOLD_COLOR, 0.5)}`,
                    color: '#000000',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Tabela de resultados */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: `0 5px 15px 0 ${alpha('#000', 0.3)}`,
            border: `1px solid ${alpha(GOLD_COLOR, 0.2)}`,
            mb: 2
          }}
        >
          <Typography
            variant="h6"
            sx={{
              p: 2,
              backgroundColor: alpha(DARK_BLUE, 0.4),
              borderBottom: `1px solid ${alpha(GOLD_COLOR, 0.3)}`,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ContentPasteIcon sx={{ mr: 1, color: GOLD_COLOR }} />
            Resultados da Pesquisa
            {totalCount > 0 && (
              <Chip
                label={`${totalCount} registro(s)`}
                size="small"
                sx={{
                  ml: 2,
                  bgcolor: alpha(GOLD_COLOR, 0.1),
                  color: GOLD_COLOR,
                  borderColor: alpha(GOLD_COLOR, 0.3),
                  border: '1px solid'
                }}
              />
            )}
          </Typography>

          <TableContainer sx={{ maxHeight: 450 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center" sx={{ width: '5%' }}>ID</StyledTableCell>
                  <StyledTableCell sx={{ width: '25%' }}>Nome</StyledTableCell>
                  <StyledTableCell sx={{ width: '12%' }}>CPF</StyledTableCell>
                  <StyledTableCell sx={{ width: '12%' }}>Tipo</StyledTableCell>
                  <StyledTableCell sx={{ width: '15%' }}>Número BO</StyledTableCell>
                  <StyledTableCell sx={{ width: '12%' }}>Data do Fato</StyledTableCell>
                  <StyledTableCell sx={{ width: '15%' }}>Natureza</StyledTableCell>
                  <StyledTableCell align="center" sx={{ width: '4%' }}>Ações</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={40} sx={{ color: GOLD_COLOR }} />
                      <Typography variant="body2" sx={{ mt: 2, color: alpha('#ffffff', 0.7) }}>
                        Carregando resultados...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : !envolvidos || envolvidos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <SearchIcon sx={{ fontSize: 48, color: alpha('#ffffff', 0.3), mb: 2 }} />
                        <Typography sx={{ color: alpha('#ffffff', 0.5) }}>
                          Nenhum resultado encontrado
                        </Typography>
                        <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.4), mt: 1 }}>
                          Tente ajustar os filtros de pesquisa
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  envolvidos.map((envolvido) => (
                    <StyledTableRow
                      key={envolvido.id}
                      hover
                      onClick={() => handleLoadDetails(envolvido.id)}
                    >
                      <TableCell align="center">{envolvido.id}</TableCell>
                      <TableCell sx={{ fontWeight: 'medium' }}>{envolvido.nomecompleto}</TableCell>
                      <TableCell>{envolvido.cpf}</TableCell>
                      <TableCell>
                        <Chip
                          label={envolvido.tipo_envolvido}
                          size="small"
                          sx={{
                            backgroundColor: envolvido.tipo_envolvido.toLowerCase().includes('autor') ?
                              alpha('#f44336', 0.2) : alpha('#2196f3', 0.2),
                            color: envolvido.tipo_envolvido.toLowerCase().includes('autor') ?
                              '#f44336' : '#2196f3',
                            fontWeight: 'medium',
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>{envolvido.numero_do_bo}</TableCell>
                      <TableCell>{formatDate(envolvido.data_fato)}</TableCell>
                      <TableCell>
                        <Tooltip title={envolvido.natureza || ''} arrow placement="top">
                          <span>{truncateText(envolvido.natureza)}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadDetails(envolvido.id);
                          }}
                          sx={{
                            color: GOLD_COLOR,
                            '&:hover': {
                              backgroundColor: alpha(GOLD_COLOR, 0.1)
                            }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </StyledTableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginação no Servidor */}
          {totalCount > 0 && (
            <TablePagination
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={currentPage - 1} // Converter de 1-based para zero-based
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              sx={{
                borderTop: `1px solid ${alpha(GOLD_COLOR, 0.2)}`,
                '.MuiTablePagination-select, .MuiTablePagination-selectIcon': {
                  color: 'white',
                },
                '.MuiTablePagination-displayedRows': {
                  color: alpha('#ffffff', 0.7),
                },
                '.MuiButtonBase-root': {
                  color: GOLD_COLOR,
                }
              }}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
              labelRowsPerPage="Linhas por página:"
            />
          )}
        </Box>

        {/* Modal para exibir detalhes do envolvido */}
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
              }}>
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
        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseAlert}
            severity={alert.severity}
            variant="filled"
            sx={{
              width: '100%',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              '&.MuiAlert-standardSuccess': {
                backgroundColor: '#2e7d32',
              },
              '&.MuiAlert-standardError': {
                backgroundColor: '#d32f2f',
              },
              '&.MuiAlert-standardInfo': {
                backgroundColor: '#0288d1',
              },
              '&.MuiAlert-standardWarning': {
                backgroundColor: '#ed6c02',
              },
            }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </GradientPaper>
    </Box>
  );
};

export default ConsultaEnvolvidos;