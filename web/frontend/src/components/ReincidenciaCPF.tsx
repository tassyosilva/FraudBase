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
  Divider
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
  // Inicialize data como um array vazio, não como null
  const [data, setData] = useState<ReincidenciaData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

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

      // Verifique se result.data existe antes de atribuir
      if (result && result.data) {
        setData(result.data);
        setTotalPages(result.totalPages || 1);
      } else {
        // Se result.data não existir, defina um array vazio
        setData([]);
        setTotalPages(1);
        setError('Nenhum dado encontrado');
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar dados de reincidência por CPF');
      // Importante: resetar data para um array vazio em caso de erro
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

  // Verificar se data existe e tem elementos antes de mapear
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">
          Nenhum dado de reincidência encontrado.
        </Typography>
      </Paper>
    );
  }

  // Preparar dados para o gráfico (usando os dados da página atual)
  const chartData = data.map(item => ({
    ...item,
    cpf: formatCPF(item.cpf), // Formatar CPF para exibição
    name: item.nomecompleto?.length > 20
      ? `${item.nomecompleto.substring(0, 20)}...`
      : (item.nomecompleto || 'Nome não informado') // Verificar se o nome existe
  }));

  return (
    <Box>
      {/* Cabeçalho */}
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'gold', fontWeight: 'medium' }}>
          Reincidência de Infratores por CPF
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ maxWidth: '800px', mx: 'auto' }}>
          Este gráfico mostra os infratores com múltiplas ocorrências registradas no sistema, identificados pelo mesmo CPF.
        </Typography>
      </Paper>

      {/* Gráfico */}
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

      {/* Caixas com infratores */}
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
                sx={{
                  bgcolor: '#2A2A2A',
                  borderLeft: '5px solid #FF8042',
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.4)'
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

        {/* Paginação */}
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
    </Box>
  );
};

export default ReincidenciaCPF;