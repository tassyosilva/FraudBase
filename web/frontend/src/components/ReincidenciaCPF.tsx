import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Pagination,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import PersonIcon from '@mui/icons-material/Person';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RepeatIcon from '@mui/icons-material/Repeat';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
// Correção da importação
import { usePDF } from 'react-to-pdf';

// Interface para os dados de reincidência
interface ReincidenciaData {
  cpf: string;
  nomecompleto: string;
  numeros_do_bo: string;
  quantidade: number;
}

// Interface para a resposta paginada
interface PaginatedResponse {
  data: ReincidenciaData[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ReincidenciaCPF = () => {
  // Estados existentes
  const [data, setData] = useState<ReincidenciaData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Novos estados para o modal e infrator selecionado
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedInfrator, setSelectedInfrator] = useState<ReincidenciaData | null>(null);

  // Estados para feedback de geração de PDF
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfFeedback, setPdfFeedback] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Hook para geração de PDF
  const { toPDF, targetRef } = usePDF({
    filename: 'relatorio-reincidencia.pdf',
    format: 'a4',
    page: {
      margin: 10,
      orientation: 'portrait'
    }
  });

  // Função para formatar CPF (adiciona pontos e traço)
  const formatCPF = (cpf: string) => {
    if (!cpf) return 'N/A';

    // Remove caracteres não numéricos
    const numbers = cpf.replace(/\D/g, '');

    if (numbers.length !== 11) return cpf;

    // Formata com pontos e traço
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para buscar dados com paginação
  const fetchData = async (currentPage: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/api/reincidencia/cpf?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados de reincidência por CPF');
      }

      const result: PaginatedResponse = await response.json();

      if (result && result.data) {
        setData(result.data);
        setTotalPages(result.totalPages || 1);
      } else {
        setData([]);
        setTotalPages(1);
        setError('Nenhum dado encontrado');
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar dados de reincidência por CPF');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar dados quando a página mudar
  useEffect(() => {
    fetchData(page);
  }, [page]);

  // Função para lidar com mudança de página
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Nova função para abrir o modal com os detalhes do infrator
  const handleOpenModal = (infrator: ReincidenciaData) => {
    setSelectedInfrator(infrator);
    setModalOpen(true);
  };

  // Nova função para fechar o modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedInfrator(null);
  };

  // Nova função para exportar como PDF
  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      await toPDF();
      setPdfFeedback({
        open: true,
        message: 'Relatório gerado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setPdfFeedback({
        open: true,
        message: 'Erro ao gerar o relatório PDF. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setPdfLoading(false);
    }
  };

  // Função para fechar o feedback
  const handleCloseFeedback = () => {
    setPdfFeedback({ ...pdfFeedback, open: false });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '50vh'
        }}
      >
        <CircularProgress sx={{ color: 'gold' }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Carregando dados de reincidência...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">
          Nenhum dado de reincidência encontrado.
        </Typography>
      </Paper>
    );
  }

  // Preparar dados para o gráfico
  const chartData = data.map(item => ({
    ...item,
    cpf: formatCPF(item.cpf),
    name: item.nomecompleto?.length > 20
      ? `${item.nomecompleto.substring(0, 20)}...`
      : (item.nomecompleto || 'Nome não informado')
  }));

  // Dividir a lista de BOs em um array para exibição na tabela
  const getBOArray = (boString: string) => {
    if (!boString) return ['Não informado'];
    return boString.split(', ');
  };

  return (
    <Box>
      {/* Conteúdo principal - Sem alterações no cabeçalho e no gráfico */}
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'gold', fontWeight: 'medium' }}>
          Reincidência de Infratores por CPF
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ maxWidth: '800px', mx: 'auto' }}>
          Este gráfico mostra os infratores com múltiplas ocorrências registradas no sistema, identificados pelo mesmo CPF.
        </Typography>
      </Paper>

      {/* Gráfico - Sem alterações */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom textAlign="center">
          Top Infratores Reincidentes por CPF
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 100,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip
              formatter={(value) => [`${value} ocorrências`, 'Quantidade']}
              labelFormatter={(label) => `Infrator: ${label}`}
            />
            <Legend />
            <Bar dataKey="quantidade" fill="#FF8042" name="Quantidade de Ocorrências" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Caixas com infratores - Adicionado onClick para abrir o modal */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Detalhes dos Infratores Reincidentes
          </Typography>
          <Chip
            icon={<RepeatIcon />}
            label={`Total: ${data.length} infratores`}
            color="primary"
            sx={{ bgcolor: 'gold', color: 'black', fontWeight: 'bold' }}
          />
        </Box>

        <Grid container spacing={3}>
          {data.map((infrator, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                onClick={() => handleOpenModal(infrator)}
                sx={{
                  bgcolor: '#2A2A2A',
                  borderLeft: '5px solid #FF8042',
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
                    cursor: 'pointer'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ color: 'gold', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {infrator.nomecompleto || 'Nome não informado'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssignmentIndIcon sx={{ color: 'gold', mr: 1 }} />
                    <Typography variant="body1">
                      <strong>CPF:</strong> {formatCPF(infrator.cpf)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <RepeatIcon sx={{ color: 'gold', mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Ocorrências:</strong> {infrator.quantidade}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <ListAltIcon sx={{ color: 'gold', mr: 1, mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2">
                        <strong>Boletins de Ocorrência:</strong>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: 'break-word',
                          bgcolor: 'rgba(255, 215, 0, 0.1)',
                          p: 1,
                          borderRadius: 1,
                          mt: 0.5
                        }}
                      >
                        {infrator.numeros_do_bo || 'Não informado'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Paginação - Sem alterações */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: 'white',
                },
                '& .Mui-selected': {
                  backgroundColor: 'gold !important',
                  color: 'black !important',
                }
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Modal com detalhes completos e opção de exportar PDF */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#2A2A2A', color: 'gold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            Relatório Detalhado de Reincidência
          </Box>
          <Button
            variant="contained"
            startIcon={pdfLoading ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
            onClick={handleExportPDF}
            disabled={pdfLoading}
            sx={{
              bgcolor: 'gold',
              color: 'black',
              '&:hover': {
                bgcolor: '#d4af37',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(255, 215, 0, 0.5)',
                color: 'rgba(0, 0, 0, 0.7)'
              }
            }}
          >
            {pdfLoading ? 'Gerando...' : 'Exportar PDF'}
          </Button>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#2A2A2A', px: 4, py: 3 }}>
          {selectedInfrator && (
            <Box ref={targetRef}>
              {/* Cabeçalho do Relatório para PDF */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ color: 'gold', fontWeight: 'bold', mb: 1 }}>
                  RELATÓRIO DE REINCIDÊNCIA
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  Sistema FraudBase - Gerado em {new Date().toLocaleString('pt-BR')}
                </Typography>
                <Divider sx={{ my: 2, borderColor: 'gold' }} />
              </Box>

              {/* Informações do Infrator */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: '#1A1A1A' }}>
                <Typography variant="h6" sx={{ color: 'gold', mb: 2 }}>
                  Dados do Infrator
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1">
                      <strong>Nome Completo:</strong> {selectedInfrator.nomecompleto || 'Não informado'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1">
                      <strong>CPF:</strong> {formatCPF(selectedInfrator.cpf)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Total de Ocorrências:</strong> {selectedInfrator.quantidade}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Tabela de Boletins de Ocorrência */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: '#1A1A1A' }}>
                <Typography variant="h6" sx={{ color: 'gold', mb: 2 }}>
                  Boletins de Ocorrência Registrados
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'gold', fontWeight: 'bold' }}>#</TableCell>
                        <TableCell sx={{ color: 'gold', fontWeight: 'bold' }}>Número do BO</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getBOArray(selectedInfrator.numeros_do_bo).map((bo, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{bo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Análise de Risco */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: '#1A1A1A' }}>
                <Typography variant="h6" sx={{ color: 'gold', mb: 2 }}>
                  Análise de Risco
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: selectedInfrator.quantidade > 5 ? 'rgba(220, 53, 69, 0.2)' :
                        selectedInfrator.quantidade > 3 ? 'rgba(255, 193, 7, 0.2)' :
                          'rgba(40, 167, 69, 0.2)',
                      borderLeft: `4px solid ${selectedInfrator.quantidade > 5 ? '#dc3545' :
                        selectedInfrator.quantidade > 3 ? '#ffc107' :
                          '#28a745'
                        }`
                    }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Nível de Reincidência: {
                          selectedInfrator.quantidade > 5 ? 'ALTO' :
                            selectedInfrator.quantidade > 3 ? 'MÉDIO' :
                              'BAIXO'
                        }
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {
                          selectedInfrator.quantidade > 5 ? 'Infrator com alto índice de reincidência. Recomenda-se atenção especial.' :
                            selectedInfrator.quantidade > 3 ? 'Infrator com reincidência moderada. Observe com cuidado.' :
                              'Infrator com baixa reincidência, mas já demonstra padrão repetitivo.'
                        }
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Observações */}
              <Paper sx={{ p: 3, bgcolor: '#1A1A1A' }}>
                <Typography variant="h6" sx={{ color: 'gold', mb: 2 }}>
                  Observações
                </Typography>
                <Typography variant="body2">
                  Este relatório apresenta o histórico condensado de reincidência do infrator. Para mais detalhes sobre cada ocorrência,
                  consulte os boletins de ocorrência individuais no sistema.
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#2A2A2A' }}>
          <Button onClick={handleCloseModal} sx={{ color: 'white' }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar para feedback de geração de PDF */}
      <Snackbar
        open={pdfFeedback.open}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={pdfFeedback.severity}
          sx={{ width: '100%' }}
        >
          {pdfFeedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReincidenciaCPF;