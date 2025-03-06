import { useEffect, useState, } from 'react';
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
  Alert,
  alpha
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import PersonIcon from '@mui/icons-material/Person';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RepeatIcon from '@mui/icons-material/Repeat';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import BarChartIcon from '@mui/icons-material/BarChart';
import { usePDF } from 'react-to-pdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import API_BASE_URL from '../config/api';

// Cor dourada padrão do sistema
const GOLD_COLOR = '#FFD700';

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
  } as any);

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
      const response = await fetch(`${API_BASE_URL}/reincidencia/cpf?page=${currentPage}&limit=10`, {
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

  // Função para exportar como PDF (colorido)
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

  // Nova função para exportar como PDF em preto e branco usando jsPDF
  const handleExportBWPDF = async () => {
    if (!selectedInfrator) return;

    setPdfLoading(true);
    try {
      // Cria temporariamente um div com o conteúdo em preto e branco
      const reportElement = document.createElement('div');
      reportElement.style.position = 'absolute';
      reportElement.style.left = '-9999px';
      reportElement.style.width = '210mm';
      reportElement.style.background = 'white';
      reportElement.style.padding = '20mm';
      reportElement.style.fontFamily = 'Arial, sans-serif';

      // Criando o conteúdo do relatório em preto e branco
      reportElement.innerHTML = `
        <div style="color: black; background: white; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: black; font-weight: bold; margin-bottom: 10px;">RELATÓRIO DE REINCIDÊNCIA</h1>
            <p style="color: #333; margin-bottom: 10px;">Sistema FraudBase - Gerado em ${new Date().toLocaleString('pt-BR')}</p>
            <hr style="border-color: black; margin: 15px 0;" />
          </div>

          <div style="padding: 15px; margin-bottom: 20px; border: 1px solid #999; border-radius: 4px;">
            <h2 style="color: black; margin-bottom: 15px;">Dados do Infrator</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <p style="color: black;"><strong>Nome Completo:</strong> ${selectedInfrator.nomecompleto || 'Não informado'}</p>
              </div>
              <div>
                <p style="color: black;"><strong>CPF:</strong> ${formatCPF(selectedInfrator.cpf)}</p>
              </div>
              <div style="grid-column: span 2;">
                <p style="color: black;"><strong>Total de Ocorrências:</strong> ${selectedInfrator.quantidade}</p>
              </div>
            </div>
          </div>

          <div style="padding: 15px; margin-bottom: 20px; border: 1px solid #999; border-radius: 4px;">
            <h2 style="color: black; margin-bottom: 15px;">Boletins de Ocorrência Registrados</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="color: black; font-weight: bold; border-bottom: 1px solid #999; text-align: left; padding: 8px;">#</th>
                  <th style="color: black; font-weight: bold; border-bottom: 1px solid #999; text-align: left; padding: 8px;">Número do BO</th>
                </tr>
              </thead>
              <tbody>
                ${getBOArray(selectedInfrator.numeros_do_bo).map((bo, index) => `
                  <tr>
                    <td style="color: black; border-bottom: 1px solid #999; padding: 8px;">${index + 1}</td>
                    <td style="color: black; border-bottom: 1px solid #999; padding: 8px;">${bo}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="padding: 15px; margin-bottom: 20px; border: 1px solid #999; border-radius: 4px;">
            <h2 style="color: black; margin-bottom: 15px;">Análise de Risco</h2>
            <div style="padding: 10px; border-radius: 4px; border: 1px solid #999; border-left: 4px solid black;">
              <p style="font-weight: bold; color: black;">
                Nível de Reincidência: ${selectedInfrator.quantidade > 5 ? 'ALTO' :
          selectedInfrator.quantidade > 3 ? 'MÉDIO' :
            'BAIXO'
        }
              </p>
              <p style="margin-top: 10px; color: black;">
                ${selectedInfrator.quantidade > 5 ? 'Infrator com alto índice de reincidência. Recomenda-se atenção especial.' :
          selectedInfrator.quantidade > 3 ? 'Infrator com reincidência moderada. Observe com cuidado.' :
            'Infrator com baixa reincidência, mas já demonstra padrão repetitivo.'
        }
              </p>
            </div>
          </div>

          <div style="padding: 15px; border: 1px solid #999; border-radius: 4px;">
            <h2 style="color: black; margin-bottom: 15px;">Observações</h2>
            <p style="color: black;">
              Este relatório apresenta o histórico condensado de reincidência do infrator. Para mais detalhes sobre cada ocorrência,
              consulte os boletins de ocorrência individuais no sistema.
            </p>
          </div>
        </div>
      `;

      document.body.appendChild(reportElement);

      // Captura como imagem e converte para PDF
      try {
        const canvas = await html2canvas(reportElement);
        const imgData = canvas.toDataURL('image/png');

        // Cria o PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Adiciona a primeira página
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Adiciona páginas adicionais se necessário
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('relatorio-reincidencia-pb.pdf');

        setPdfFeedback({
          open: true,
          message: 'Relatório em preto e branco gerado com sucesso!',
          severity: 'success'
        });
      } finally {
        // Garante que o elemento temporário seja removido mesmo em caso de erro
        document.body.removeChild(reportElement);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF em preto e branco:', error);
      setPdfFeedback({
        open: true,
        message: 'Erro ao gerar o relatório em preto e branco.',
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
        <CircularProgress sx={{ color: GOLD_COLOR }} />
        <Typography variant="h6" sx={{ mt: 2, color: alpha('#fff', 0.9) }}>
          Carregando dados de reincidência...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{
        p: 4,
        textAlign: 'center',
        background: `linear-gradient(135deg, ${alpha('#1f2937', 0.97)}, ${alpha('#111827', 0.98)})`,
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        boxShadow: `0 8px 32px 0 ${alpha('#000', 0.37)}`,
        border: `1px solid ${alpha(GOLD_COLOR, 0.1)}`
      }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{
        p: 4,
        textAlign: 'center',
        background: `linear-gradient(135deg, ${alpha('#1f2937', 0.97)}, ${alpha('#111827', 0.98)})`,
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        boxShadow: `0 8px 32px 0 ${alpha('#000', 0.37)}`,
        border: `1px solid ${alpha(GOLD_COLOR, 0.1)}`
      }}>
        <Typography variant="h6" sx={{ color: alpha('#fff', 0.8) }}>
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
      {/* Cabeçalho Principal */}
      <Paper sx={{
        p: 4,
        mb: 3,
        textAlign: 'center',
        background: `linear-gradient(135deg, ${alpha('#1f2937', 0.96)}, ${alpha('#111827', 0.98)})`,
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        boxShadow: `0 8px 32px 0 ${alpha('#000', 0.37)}`,
        border: `1px solid ${alpha(GOLD_COLOR, 0.1)}`
      }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            color: GOLD_COLOR,
            fontWeight: 'bold',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}
        >
          Reincidência de Infratores por CPF
        </Typography>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            maxWidth: '800px',
            mx: 'auto',
            color: alpha('#fff', 0.8),
            fontSize: '1.1rem'
          }}
        >
          Este gráfico mostra os infratores com múltiplas ocorrências registradas no sistema, identificados pelo mesmo CPF.
        </Typography>
      </Paper>

      {/* Gráfico */}
      <Paper sx={{
        p: 4,
        mb: 3,
        background: `linear-gradient(135deg, ${alpha('#1f2937', 0.97)}, ${alpha('#111827', 0.98)})`,
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        boxShadow: `0 8px 32px 0 ${alpha('#000', 0.37)}`,
        border: `1px solid ${alpha(GOLD_COLOR, 0.1)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
          <BarChartIcon sx={{ color: GOLD_COLOR }} />
          <Typography
            variant="h6"
            sx={{
              color: alpha('#fff', 0.95),
              fontWeight: 'bold'
            }}
          >
            Top Infratores Reincidentes por CPF
          </Typography>
        </Box>

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
            <CartesianGrid strokeDasharray="3 3" stroke={alpha('#fff', 0.1)} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12, fill: alpha('#fff', 0.8) }}
            />
            <YAxis tick={{ fill: alpha('#fff', 0.8) }} />
            <Tooltip
              formatter={(value) => [`${value} ocorrências`, 'Quantidade']}
              labelFormatter={(label) => `Infrator: ${label}`}
              contentStyle={{
                backgroundColor: alpha('#000', 0.8),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha('#fff', 0.1)}`,
                borderRadius: '4px',
                color: '#fff'
              }}
            />
            <Legend wrapperStyle={{ color: alpha('#fff', 0.8) }} />
            <Bar
              dataKey="quantidade"
              name="Quantidade de Ocorrências"
              radius={[4, 4, 0, 0]}
              fill={GOLD_COLOR}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={GOLD_COLOR}
                  stroke={alpha(GOLD_COLOR, 0.2)}
                  strokeWidth={2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Caixas com infratores */}
      <Paper sx={{
        p: 4,
        mb: 3,
        background: `linear-gradient(135deg, ${alpha('#1f2937', 0.97)}, ${alpha('#111827', 0.98)})`,
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        boxShadow: `0 8px 32px 0 ${alpha('#000', 0.37)}`,
        border: `1px solid ${alpha(GOLD_COLOR, 0.1)}`
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: alpha('#fff', 0.95),
              fontWeight: 'bold'
            }}
          >
            <RepeatIcon sx={{ color: GOLD_COLOR }} />
            Detalhes dos Infratores Reincidentes
          </Typography>
          <Chip
            icon={<RepeatIcon />}
            label={`Total: ${data.length} infratores`}
            sx={{
              bgcolor: alpha(GOLD_COLOR, 0.9),
              color: '#000',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {data.map((infrator, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                onClick={() => handleOpenModal(infrator)}
                sx={{
                  background: `linear-gradient(135deg, ${alpha('#1a1a1a', 0.8)}, ${alpha('#000000', 0.9)})`,
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  boxShadow: `0 8px 32px 0 ${alpha('#000', 0.37)}`,
                  border: `1px solid ${alpha(GOLD_COLOR, 0.1)}`,
                  borderLeft: `5px solid ${GOLD_COLOR}`,
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 14px 28px ${alpha('#000', 0.5)}`,
                    cursor: 'pointer',
                    borderColor: alpha(GOLD_COLOR, 0.5)
                  },
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ color: GOLD_COLOR, mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: alpha('#fff', 0.95) }}>
                      {infrator.nomecompleto || 'Nome não informado'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5, borderColor: alpha('#fff', 0.08) }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssignmentIndIcon sx={{ color: GOLD_COLOR, mr: 1 }} />
                    <Typography variant="body1" sx={{ color: alpha('#fff', 0.9) }}>
                      <strong>CPF:</strong> {formatCPF(infrator.cpf)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <RepeatIcon sx={{ color: GOLD_COLOR, mr: 1 }} />
                    <Typography variant="body1" sx={{ color: alpha('#fff', 0.9) }}>
                      <strong>Ocorrências:</strong> {infrator.quantidade}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <ListAltIcon sx={{ color: GOLD_COLOR, mr: 1, mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: alpha('#fff', 0.9) }}>
                        <strong>Boletins de Ocorrência:</strong>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: 'break-word',
                          bgcolor: alpha(GOLD_COLOR, 0.05),
                          p: 1.5,
                          borderRadius: 1,
                          mt: 0.5,
                          color: alpha('#fff', 0.8),
                          border: `1px solid ${alpha(GOLD_COLOR, 0.1)}`
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

        {/* Paginação */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: alpha('#fff', 0.8),
                  '&:hover': {
                    bgcolor: alpha(GOLD_COLOR, 0.15),
                  }
                },
                '& .Mui-selected': {
                  backgroundColor: `${alpha(GOLD_COLOR, 0.9)} !important`,
                  color: 'black !important',
                  fontWeight: 'bold'
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
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${alpha('#1f2937', 0.97)}, ${alpha('#111827', 0.99)})`,
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            boxShadow: `0 8px 32px 0 ${alpha('#000', 0.37)}`,
            border: `1px solid ${alpha(GOLD_COLOR, 0.1)}`
          }
        }}
      >
        <DialogTitle sx={{
          color: GOLD_COLOR,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${alpha(GOLD_COLOR, 0.2)}`,
          p: 3
        }}>
          <Box sx={{ fontWeight: 'bold' }}>
            Relatório Detalhado de Reincidência
          </Box>
          <Box>
            <Button
              variant="contained"
              startIcon={pdfLoading ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
              onClick={handleExportPDF}
              disabled={pdfLoading}
              sx={{
                bgcolor: GOLD_COLOR,
                color: 'black',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: alpha(GOLD_COLOR, 0.85),
                },
                '&.Mui-disabled': {
                  bgcolor: alpha(GOLD_COLOR, 0.5),
                  color: 'rgba(0, 0, 0, 0.7)'
                },
                mr: 1,
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            >
              {pdfLoading ? 'Gerando...' : 'Exportar PDF'}
            </Button>
            <Button
              variant="outlined"
              startIcon={pdfLoading ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
              onClick={handleExportBWPDF}
              disabled={pdfLoading}
              sx={{
                borderColor: alpha('#fff', 0.3),
                color: alpha('#fff', 0.9),
                '&:hover': {
                  borderColor: alpha('#fff', 0.5),
                  bgcolor: alpha('#fff', 0.05)
                },
                '&.Mui-disabled': {
                  borderColor: alpha('#fff', 0.1),
                  color: alpha('#fff', 0.3)
                }
              }}
            >
              {pdfLoading ? 'Gerando...' : 'Exportar P&B'}
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 4 }}>
          {selectedInfrator && (
            <Box ref={targetRef}>
              {/* Cabeçalho do Relatório para PDF */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ color: GOLD_COLOR, fontWeight: 'bold', mb: 1 }}>
                  RELATÓRIO DE REINCIDÊNCIA
                </Typography>
                <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>
                  Sistema FraudBase - Gerado em {new Date().toLocaleString('pt-BR')}
                </Typography>
                <Divider sx={{ my: 2, borderColor: alpha(GOLD_COLOR, 0.3) }} />
              </Box>

              {/* Informações do Infrator */}
              <Paper sx={{
                p: 3,
                mb: 3,
                bgcolor: alpha('#000', 0.3),
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: `1px solid ${alpha(GOLD_COLOR, 0.1)}`
              }}>
                <Typography variant="h6" sx={{ color: GOLD_COLOR, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon />
                  Dados do Infrator
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ color: alpha('#fff', 0.9) }}>
                      <strong>Nome Completo:</strong> {selectedInfrator.nomecompleto || 'Não informado'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ color: alpha('#fff', 0.9) }}>
                      <strong>CPF:</strong> {formatCPF(selectedInfrator.cpf)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1" sx={{ color: alpha('#fff', 0.9) }}>
                      <strong>Total de Ocorrências:</strong> {selectedInfrator.quantidade}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Tabela de Boletins de Ocorrência */}
              <Paper sx={{
                p: 3,
                mb: 3,
                bgcolor: alpha('#000', 0.3),
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: `1px solid ${alpha(GOLD_COLOR, 0.1)}`
              }}>
                <Typography variant="h6" sx={{ color: GOLD_COLOR, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ListAltIcon />
                  Boletins de Ocorrência Registrados
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: GOLD_COLOR, fontWeight: 'bold', borderBottom: `1px solid ${alpha(GOLD_COLOR, 0.2)}` }}>#</TableCell>
                        <TableCell sx={{ color: GOLD_COLOR, fontWeight: 'bold', borderBottom: `1px solid ${alpha(GOLD_COLOR, 0.2)}` }}>Número do BO</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getBOArray(selectedInfrator.numeros_do_bo).map((bo, index) => (
                        <TableRow key={index} sx={{ '&:hover': { bgcolor: alpha('#fff', 0.05) } }}>
                          <TableCell sx={{ color: alpha('#fff', 0.8), borderBottom: `1px solid ${alpha('#fff', 0.1)}` }}>{index + 1}</TableCell>
                          <TableCell sx={{ color: alpha('#fff', 0.8), borderBottom: `1px solid ${alpha('#fff', 0.1)}` }}>{bo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Análise de Risco */}
              <Paper sx={{
                p: 3,
                mb: 3,
                bgcolor: alpha('#000', 0.3),
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: `1px solid ${alpha(GOLD_COLOR, 0.1)}`
              }}>
                <Typography variant="h6" sx={{ color: GOLD_COLOR, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RepeatIcon />
                  Análise de Risco
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: alpha(
                        selectedInfrator.quantidade > 5 ? '#dc3545' :
                          selectedInfrator.quantidade > 3 ? GOLD_COLOR :
                            '#28a745',
                        0.1
                      ),
                      borderLeft: `4px solid ${selectedInfrator.quantidade > 5 ? '#dc3545' :
                          selectedInfrator.quantidade > 3 ? GOLD_COLOR :
                            '#28a745'
                        }`
                    }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: alpha('#fff', 0.95) }}>
                        Nível de Reincidência: {
                          selectedInfrator.quantidade > 5 ? 'ALTO' :
                            selectedInfrator.quantidade > 3 ? 'MÉDIO' :
                              'BAIXO'
                        }
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, color: alpha('#fff', 0.8) }}>
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
              <Paper sx={{
                p: 3,
                bgcolor: alpha('#000', 0.3),
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: `1px solid ${alpha(GOLD_COLOR, 0.1)}`
              }}>
                <Typography variant="h6" sx={{ color: GOLD_COLOR, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ListAltIcon />
                  Observações
                </Typography>
                <Typography variant="body2" sx={{ color: alpha('#fff', 0.8) }}>
                  Este relatório apresenta o histórico condensado de reincidência do infrator. Para mais detalhes sobre cada ocorrência,
                  consulte os boletins de ocorrência individuais no sistema.
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(GOLD_COLOR, 0.1)}` }}>
          <Button
            onClick={handleCloseModal}
            sx={{
              color: alpha('#fff', 0.8),
              '&:hover': {
                bgcolor: alpha('#fff', 0.05),
                color: alpha('#fff', 0.95)
              }
            }}
          >
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
          sx={{
            width: '100%',
            bgcolor: pdfFeedback.severity === 'success' ? alpha('#28a745', 0.95) : alpha('#dc3545', 0.95),
            color: '#fff',
            fontWeight: 'medium',
            '& .MuiAlert-icon': {
              color: '#fff'
            }
          }}
        >
          {pdfFeedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReincidenciaCPF;