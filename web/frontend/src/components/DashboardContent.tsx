import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  alpha,
  useTheme
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import logo from '../assets/logo.png';
import {
  TrendingUp,
  People,
  PersonSearch,
  DocumentScanner
} from '@mui/icons-material';

import API_BASE_URL from '../config/api';

// Tipos para os dados das estatísticas
interface SexoStats {
  sexo: string;
  quantidade: number;
}

interface FaixaEtariaStats {
  faixa_etaria: string;
  quantidade: number;
}

interface DelegaciaStats {
  delegacia_responsavel: string;
  quantidade: number;
}

// Interface para as props do StatCard
interface StatCardProps {
  title: string;
  value: number;
  color: string;
  icon: React.ElementType;
}

// Interface para as props do ChartPanel
interface ChartPanelProps {
  title: string;
  children: React.ReactNode;
  height?: number;
}

// Cores para os gráficos - paleta melhorada
const COLORS = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c', '#34495e', '#d35400'];

// Cores específicas para o gráfico de sexo
const SEXO_COLORS: { [key: string]: string } = {
  'Masculino': '#4285F4', // Azul
  'Feminino': '#FF69B4', // Rosa (Hot Pink)
};

// Componente de card estatístico com ícone
const StatCard = ({ title, value, color, icon: Icon }: StatCardProps) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        backgroundColor: 'transparent',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: '16px',
        boxShadow: `0 8px 32px 0 ${alpha(color, 0.2)}`,
        overflow: 'visible',
        transition: 'transform 0.3s, box-shadow 0.3s',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 12px 40px 0 ${alpha(color, 0.3)}`
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '-20px',
          left: '20px',
          backgroundColor: color,
          borderRadius: '15px',
          width: '60px',
          height: '60px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: `0 12px 20px 0 ${alpha(color, 0.4)}`
        }}
      >
        <Icon sx={{ fontSize: 32, color: 'white' }} />
      </Box>

      <CardContent sx={{ textAlign: 'right', pt: 3, pb: '16px !important' }}>
        <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7), mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ color: color, fontWeight: 700, lineHeight: 1.2 }}>
          {value.toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Componente para os painéis de gráficos
const ChartPanel = ({ title, children, height = 300 }: ChartPanelProps) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        borderRadius: '16px',
        backgroundColor: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        border: `1px solid ${alpha('#fff', 0.1)}`,
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'scale(1.01)'
        }
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        textAlign="center"
        sx={{
          fontWeight: 600,
          mb: 3,
          background: 'linear-gradient(45deg, #3498db 30%, #9b59b6 90%)',
          backgroundClip: 'text',
          textFillColor: 'transparent'
        }}
      >
        {title}
      </Typography>
      <Box sx={{ height }}>
        {children}
      </Box>
    </Paper>
  );
};

const DashboardContent = () => {
  // Estados para armazenar os dados das estatísticas
  const [vitimasPorSexo, setVitimasPorSexo] = useState<SexoStats[]>([]);
  const [vitimasPorFaixaEtaria, setVitimasPorFaixaEtaria] = useState<FaixaEtariaStats[]>([]);
  const [infratoresPorDelegacia, setInfratoresPorDelegacia] = useState<DelegaciaStats[]>([]);
  const [quantidadeBOs, setQuantidadeBOs] = useState<number>(0);
  const [quantidadeInfratores, setQuantidadeInfratores] = useState<number>(0);
  const [quantidadeVitimas, setQuantidadeVitimas] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados das APIs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Buscar vítimas por sexo
        const resVitimasPorSexo = await fetch(`${API_BASE_URL}/dashboard/vitimas-por-sexo`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        // Buscar vítimas por faixa etária
        const resVitimasPorFaixaEtaria = await fetch(`${API_BASE_URL}/dashboard/vitimas-por-faixa-etaria`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        // Buscar infratores por delegacia
        const resInfratoresPorDelegacia = await fetch(`${API_BASE_URL}/dashboard/infratores-por-delegacia`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        // Buscar quantidade de BOs
        const resQuantidadeBOs = await fetch(`${API_BASE_URL}/dashboard/quantidade-bos`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        // Buscar quantidade de infratores
        const resQuantidadeInfratores = await fetch(`${API_BASE_URL}/dashboard/quantidade-infratores`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        // Buscar quantidade de vítimas
        const resQuantidadeVitimas = await fetch(`${API_BASE_URL}/dashboard/quantidade-vitimas`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        if (!resVitimasPorSexo.ok || !resVitimasPorFaixaEtaria.ok || !resInfratoresPorDelegacia.ok ||
          !resQuantidadeBOs.ok || !resQuantidadeInfratores.ok || !resQuantidadeVitimas.ok) {
          throw new Error('Erro ao buscar dados para o dashboard');
        }

        const dataSexo = await resVitimasPorSexo.json();
        const dataFaixaEtaria = await resVitimasPorFaixaEtaria.json();
        const dataDelegacia = await resInfratoresPorDelegacia.json();
        const dataBOs = await resQuantidadeBOs.json();
        const dataInfratores = await resQuantidadeInfratores.json();
        const dataVitimas = await resQuantidadeVitimas.json();

        setVitimasPorSexo(dataSexo);
        setVitimasPorFaixaEtaria(dataFaixaEtaria);
        setInfratoresPorDelegacia(dataDelegacia);
        setQuantidadeBOs(dataBOs.quantidade);
        setQuantidadeInfratores(dataInfratores.quantidade);
        setQuantidadeVitimas(dataVitimas.quantidade);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Formatar dados do gráfico de faixa etária para melhor visualização
  const formattedFaixaEtariaData = vitimasPorFaixaEtaria.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }));

  // Formatar dados de delegacia para o gráfico
  const formattedDelegaciaData = infratoresPorDelegacia.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }));

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '70vh',
          background: 'linear-gradient(135deg, rgba(30,30,30,0.7) 0%, rgba(10,10,10,0.8) 100%)'
        }}
      >
        <CircularProgress
          sx={{
            color: '#3498db',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }}
          size={60}
          thickness={4}
        />
        <Typography
          variant="h6"
          sx={{
            mt: 2,
            fontWeight: 500,
            background: 'linear-gradient(45deg, #3498db 30%, #9b59b6 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }}
        >
          Carregando dados do dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{
        p: 4,
        textAlign: 'center',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(255, 59, 59, 0.2)',
        border: '1px solid rgba(255, 59, 59, 0.3)',
        background: 'rgba(30,30,30,0.7)',
        backdropFilter: 'blur(20px)'
      }}>
        <Typography variant="h6" sx={{ color: '#e74c3c', fontWeight: 500 }}>
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{
      pb: 4,
      background: 'linear-gradient(135deg, rgba(30,30,30,0.7) 0%, rgba(10,10,10,0.8) 100%)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      overflow: 'hidden',
    }}>
      {/* Cabeçalho */}
      <Paper sx={{
        p: 4,
        mb: 4,
        textAlign: 'center',
        borderRadius: '0 0 24px 24px',
        background: 'linear-gradient(135deg, rgba(40,40,50,0.9) 0%, rgba(20,20,30,0.95) 100%)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, rgba(255,215,0,0.7), #FFD700, #f39c12, #FFD700, rgba(255,215,0,0.7))',
          boxShadow: '0 0 10px rgba(255,215,0,0.3)',
        }
      }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #3498db 30%, #9b59b6 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            letterSpacing: '0.5px',
            textShadow: '0 2px 10px rgba(52, 152, 219, 0.3)'
          }}
        >
          FraudBase - Sistema para cruzamento de dados em fraudes
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <img
            src={logo}
            alt="FraudBase Logo"
            style={{
              height: '120px',
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
            }}
          />
        </Box>
      </Paper>

      {/* Cards com estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4, px: 2 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="BOs Registrados"
            value={quantidadeBOs}
            color="#3498db"
            icon={DocumentScanner}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total de Infratores"
            value={quantidadeInfratores}
            color="#e74c3c"
            icon={PersonSearch}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total de Vítimas"
            value={quantidadeVitimas}
            color="#2ecc71"
            icon={People}
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ px: 2 }}>
        <Grid item xs={12} md={6}>
          <ChartPanel title="Distribuição de Vítimas por Sexo">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vitimasPorSexo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                  dataKey="quantidade"
                  nameKey="sexo"
                  label={({ sexo, percent }) => `${sexo}: ${(percent * 100).toFixed(0)}%`}
                >
                  {vitimasPorSexo.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SEXO_COLORS[entry.sexo] || COLORS[index % COLORS.length]}
                      stroke={alpha(SEXO_COLORS[entry.sexo] || COLORS[index % COLORS.length], 0.2)}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} vítimas`, 'Quantidade']}
                  contentStyle={{
                    borderRadius: '8px',
                    backgroundColor: 'rgba(30,30,30,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartPanel title="Distribuição de Vítimas por Faixa Etária">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedFaixaEtariaData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 70,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha('#fff', 0.1)} />
                <XAxis
                  dataKey="faixa_etaria"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12, fill: alpha('#fff', 0.7) }}
                  stroke={alpha('#fff', 0.2)}
                />
                <YAxis stroke={alpha('#fff', 0.2)} tick={{ fill: alpha('#fff', 0.7) }} />
                <Tooltip
                  formatter={(value) => [`${value} vítimas`, 'Quantidade']}
                  contentStyle={{
                    borderRadius: '8px',
                    backgroundColor: 'rgba(30,30,30,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }}
                  cursor={{ fill: alpha('#fff', 0.05) }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Bar
                  dataKey="quantidade"
                  name="Quantidade de Vítimas"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>
        <Grid item xs={12} sx={{ mt: 1 }}>
          <ChartPanel title="Delegacias com Mais Infratores em Apuração" height={400}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedDelegaciaData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 150,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha('#fff', 0.1)} />
                <XAxis
                  type="number"
                  stroke={alpha('#fff', 0.2)}
                  tick={{ fill: alpha('#fff', 0.7) }}
                />
                <YAxis
                  dataKey="delegacia_responsavel"
                  type="category"
                  tick={{ fontSize: 12, fill: alpha('#fff', 0.7) }}
                  width={140}
                  stroke={alpha('#fff', 0.2)}
                />
                <Tooltip
                  formatter={(value) => [`${value} infratores`, 'Quantidade']}
                  contentStyle={{
                    borderRadius: '8px',
                    backgroundColor: 'rgba(30,30,30,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }}
                  cursor={{ fill: alpha('#fff', 0.05) }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar
                  dataKey="quantidade"
                  name="Quantidade de Infratores"
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>
      </Grid>

      {/* Rodapé com informações de atualização */}
      <Box sx={{
        textAlign: 'center',
        mt: 4,
        pt: 2,
        borderTop: `1px solid ${alpha('#fff', 0.1)}`,
        color: alpha('#fff', 0.5),
        fontSize: '0.85rem'
      }}>
        <Typography variant="caption">
          Última atualização dos dados: {new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="caption">
            FraudBase Analytics
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardContent;