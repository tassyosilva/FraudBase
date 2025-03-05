import { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  Card,
  Grid,
  alpha,
  styled
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import HistoryIcon from '@mui/icons-material/History';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import FlagIcon from '@mui/icons-material/Flag';

// Componente estilizado para o card de estatísticas
const StatsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha('#1e1e1e', 0.9)} 0%, ${alpha('#2a2a2a', 0.9)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
    borderColor: alpha(theme.palette.primary.main, 0.5),
  }
}));

// Tipagem para os dados de BO
interface BoData {
  numero_do_bo: string;
}

const UploadRelatorio = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ success: boolean, message: string } | null>(null);

  // Estados adicionados apenas para a funcionalidade de limpeza
  const [cleaningLoading, setCleaningLoading] = useState<boolean>(false);
  const [cleanResult, setCleanResult] = useState<{ success: boolean, message: string } | null>(null);

  // Novos estados para os dados de BO
  const [recentBOs, setRecentBOs] = useState<BoData[]>([]);
  const [oldestBO, setOldestBO] = useState<BoData | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Buscar dados de BO do backend quando o componente montar
  useEffect(() => {
    fetchBOStats();
  }, []);

  // Função para buscar as estatísticas dos BOs
  const fetchBOStats = async () => {
    setLoadingStats(true);
    setStatsError(null);

    try {
      const response = await fetch('http://localhost:8080/api/bo-statistics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar estatísticas de BO');
      }

      const data = await response.json();
      setRecentBOs(data.recentBOs || []);
      setOldestBO(data.oldestBO || null);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setStatsError('Não foi possível carregar as estatísticas dos BOs');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('relatorio', file);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8080/api/upload-relatorio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `Upload realizado com sucesso! ${data.registrosInseridos || 0} registros foram inseridos.`
        });
        // Atualizar estatísticas após upload bem-sucedido
        fetchBOStats();
      } else {
        setResult({
          success: false,
          message: data.error || 'Erro ao processar o arquivo.'
        });
      }
    } catch (error) {
      console.error('Erro durante o upload:', error);
      setResult({
        success: false,
        message: 'Erro de conexão com o servidor.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar duplicatas
  const handleCleanDuplicates = async () => {
    setCleaningLoading(true);
    setCleanResult(null);

    try {
      const response = await fetch('http://localhost:8080/api/clean-duplicates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCleanResult({
          success: true,
          message: `Limpeza concluída! ${data.rowsRemoved} registros duplicados foram removidos.`
        });
        // Atualizar estatísticas após limpeza bem-sucedida
        fetchBOStats();
      } else {
        setCleanResult({
          success: false,
          message: data.error || 'Erro ao limpar registros duplicados.'
        });
      }
    } catch (error) {
      console.error('Erro durante a limpeza:', error);
      setCleanResult({
        success: false,
        message: 'Erro de conexão com o servidor.'
      });
    } finally {
      setCleaningLoading(false);
    }
  };

  // Renderizar o componente de estatísticas de BO
  const renderBOStats = () => {
    if (loadingStats) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} sx={{ color: 'gold' }} />
        </Box>
      );
    }

    if (statsError) {
      return (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {statsError}
        </Alert>
      );
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StatsCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NewReleasesIcon sx={{ color: 'gold', mr: 1 }} />
              <Typography variant="h6" sx={{ color: 'white' }}>
                Últimos 5 BOs Registrados
              </Typography>
            </Box>
            <Divider sx={{ borderColor: alpha('#FFD700', 0.2), mb: 2 }} />

            {recentBOs.length > 0 ? (
              <List sx={{ p: 0 }}>
                {recentBOs.map((bo, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      borderLeft: `3px solid gold`,
                      mb: 1,
                      p: 1.5,
                      bgcolor: alpha('#000', 0.2),
                      borderRadius: '0 4px 4px 0',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha('#000', 0.3),
                        transform: 'translateX(5px)'
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      <strong>{bo.numero_do_bo}</strong>
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" sx={{ color: '#aaa', fontStyle: 'italic' }}>
                Nenhum BO encontrado no sistema.
              </Typography>
            )}
          </StatsCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <StatsCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FlagIcon sx={{ color: '#FFD700', mr: 1 }} />
              <Typography variant="h6" sx={{ color: 'white' }}>
                BO Mais Antigo Registrado
              </Typography>
            </Box>
            <Divider sx={{ borderColor: alpha('#FFD700', 0.2), mb: 2 }} />

            {oldestBO ? (
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha('#000', 0.2),
                  borderRadius: '4px',
                  border: `1px dashed ${alpha('#FFD700', 0.3)}`
                }}
              >
                <Typography variant="body1" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                  {oldestBO.numero_do_bo}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#aaa', fontStyle: 'italic' }}>
                Nenhum BO encontrado no sistema.
              </Typography>
            )}
          </StatsCard>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Upload de Relatório
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" gutterBottom>
          Faça upload do arquivo de relatório no formato Excel (.xlsx) para importação automática dos dados.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
          <input
            accept=".xlsx"
            style={{ display: 'none' }}
            id="upload-relatorio"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="upload-relatorio">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadFileIcon />}
              sx={{
                mb: 2,
                borderColor: 'gold',
                color: 'white',
                '&:hover': {
                  borderColor: 'gold',
                  backgroundColor: 'rgba(255, 215, 0, 0.1)'
                }
              }}
            >
              Selecionar Arquivo
            </Button>
          </label>

          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Arquivo selecionado: {file.name}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Processar Arquivo'}
          </Button>
        </Box>

        {result && (
          <Alert severity={result.success ? 'success' : 'error'} sx={{ mt: 2 }}>
            {result.message}
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Nova seção para estatísticas de BO */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HistoryIcon sx={{ color: 'gold', mr: 1 }} />
            <Typography variant="h6">
              Estatísticas dos BOs
            </Typography>
          </Box>

          {renderBOStats()}

          <Button
            variant="text"
            onClick={fetchBOStats}
            disabled={loadingStats}
            startIcon={loadingStats ? <CircularProgress size={20} /> : null}
            sx={{
              mt: 2,
              color: 'gold',
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.1)'
              }
            }}
          >
            Atualizar Estatísticas
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Importante:
          </Typography>
          <Typography variant="body2">
            • O arquivo deve conter no mínimo as tabelas: "Dados do Registro", "Dados do Fato", "Envolvidos" e "Relato Histórico"<br />
            • Certifique-se que o arquivo segue o formato padrão dos relatórios de B.O. do SINESP<br />
            • O sistema processará apenas os campos relevantes de cada tabela.
          </Typography>
        </Box>

        {/* Seção para o botão de limpeza */}
        <Divider sx={{ my: 3 }} />

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Manutenção da Base de Dados:
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            Após a inserção de novos relatórios, use esta opção para remover registros duplicados do banco de dados, mantendo apenas uma ocorrência de cada registro.
          </Typography>

          <Button
            variant="contained"
            onClick={handleCleanDuplicates}
            disabled={cleaningLoading}
            startIcon={cleaningLoading ? <CircularProgress size={24} /> : <CleaningServicesIcon />}
            sx={{
              mt: 1,
              backgroundColor: '#d32f2f',
              color: 'white',
              '&:hover': { backgroundColor: '#b71c1c' }
            }}
          >
            {cleaningLoading ? 'Limpando...' : 'Limpar Dados Duplicados'}
          </Button>

          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            Atenção: As operações realizadas nesta seção não podem ser desfeitas.
          </Typography>

          {cleanResult && (
            <Alert
              severity={cleanResult.success ? "success" : "error"}
              sx={{ mt: 2 }}
            >
              {cleanResult.message}
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default UploadRelatorio;