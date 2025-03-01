import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress
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

// Tipos para os dados das estatísticas
interface SexoStats {
  sexo: string;
  quantidade: number;
}

interface FaixaEtariaStats {
  faixa_etaria: string;
  quantidade: number;
}

interface CountStats {
  quantidade: number;
}

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardContent = () => {
  // Estados para armazenar os dados das estatísticas
  const [vitimasPorSexo, setVitimasPorSexo] = useState<SexoStats[]>([]);
  const [vitimasPorFaixaEtaria, setVitimasPorFaixaEtaria] = useState<FaixaEtariaStats[]>([]);
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
        const resVitimasPorSexo = await fetch('http://localhost:8080/api/dashboard/vitimas-por-sexo', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        
        // Buscar vítimas por faixa etária
        const resVitimasPorFaixaEtaria = await fetch('http://localhost:8080/api/dashboard/vitimas-por-faixa-etaria', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        
        // Buscar quantidade de BOs
        const resQuantidadeBOs = await fetch('http://localhost:8080/api/dashboard/quantidade-bos', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        
        // Buscar quantidade de infratores
        const resQuantidadeInfratores = await fetch('http://localhost:8080/api/dashboard/quantidade-infratores', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        
        // Buscar quantidade de vítimas
        const resQuantidadeVitimas = await fetch('http://localhost:8080/api/dashboard/quantidade-vitimas', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        
        if (!resVitimasPorSexo.ok || !resVitimasPorFaixaEtaria.ok || !resQuantidadeBOs.ok || 
            !resQuantidadeInfratores.ok || !resQuantidadeVitimas.ok) {
          throw new Error('Erro ao buscar dados para o dashboard');
        }
        
        const dataSexo = await resVitimasPorSexo.json();
        const dataFaixaEtaria = await resVitimasPorFaixaEtaria.json();
        const dataBOs = await resQuantidadeBOs.json();
        const dataInfratores = await resQuantidadeInfratores.json();
        const dataVitimas = await resQuantidadeVitimas.json();
        
        setVitimasPorSexo(dataSexo);
        setVitimasPorFaixaEtaria(dataFaixaEtaria);
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
          Carregando dados do dashboard...
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

  return (
    <Box>
      {/* Cabeçalho */}
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'gold', fontWeight: 'medium' }}>
          FraudBase - Sistema para cruzamento de dados de envolvidos em Fraudes Eletrônicas
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <img src={logo} alt="FraudBase Logo" style={{ height: '120px' }} />
        </Box>
      </Paper>

      {/* Cards com estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', backgroundColor: '#2A2A2A', borderLeft: '5px solid gold' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Quantidade de BOs Registrados
              </Typography>
              <Typography variant="h3" sx={{ color: 'gold', fontWeight: 'bold' }}>
                {quantidadeBOs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', backgroundColor: '#2A2A2A', borderLeft: '5px solid #0088FE' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Quantidade Total de Infratores
              </Typography>
              <Typography variant="h3" sx={{ color: '#0088FE', fontWeight: 'bold' }}>
                {quantidadeInfratores}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', backgroundColor: '#2A2A2A', borderLeft: '5px solid #00C49F' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Quantidade Total de Vítimas
              </Typography>
              <Typography variant="h3" sx={{ color: '#00C49F', fontWeight: 'bold' }}>
                {quantidadeVitimas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom textAlign="center">
              Distribuição de Vítimas por Sexo
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vitimasPorSexo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="quantidade"
                  nameKey="sexo"
                  label={({ sexo, percent }) => `${sexo}: ${(percent * 100).toFixed(0)}%`}
                >
                  {vitimasPorSexo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} vítimas`, 'Quantidade']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom textAlign="center">
              Distribuição de Vítimas por Faixa Etária
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={vitimasPorFaixaEtaria}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 50,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="faixa_etaria" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  interval={0}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} vítimas`, 'Quantidade']} />
                <Bar dataKey="quantidade" name="Quantidade" fill="#FFD700" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardContent;
