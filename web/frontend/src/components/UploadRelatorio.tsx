import { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Card,
  Grid,
  alpha,
  styled,
  Tooltip,
  Container
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import HistoryIcon from '@mui/icons-material/History';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import FlagIcon from '@mui/icons-material/Flag';
import InfoIcon from '@mui/icons-material/Info';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';

import API_BASE_URL from '../config/api';

// Cores e temas consistentes
const GOLD_COLOR = '#FFD700';
const CARD_BG = '#1e1e1e';

// Componente estilizado para o container principal com animação de fade-in
const AnimatedContainer = styled(Box)(({ theme }) => ({
  animation: 'fadeIn 0.5s ease-in-out',
  padding: theme.spacing(1), // Use o tema de alguma forma
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 }
  }
}));

// Componente estilizado para o Paper principal
const GradientPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(2),
  borderRadius: 12,
  backgroundColor: CARD_BG,
  backgroundImage: `linear-gradient(to bottom, ${alpha('#2c2c2c', 0.8)}, ${alpha('#1a1a1a', 0.8)})`,
  boxShadow: `0 8px 32px 0 ${alpha('#000', 0.6)}`,
  border: `1px solid ${alpha(GOLD_COLOR, 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '3px',
    background: `linear-gradient(90deg, ${alpha(GOLD_COLOR, 0)}, ${alpha(GOLD_COLOR, 0.7)}, ${alpha(GOLD_COLOR, 0)})`,
  }
}));

// Componente estilizado para o card de estatísticas
const StatsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha('#1e1e1e', 0.9)} 0%, ${alpha('#2a2a2a', 0.9)} 100%)`,
  border: `1px solid ${alpha(GOLD_COLOR, 0.2)}`,
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
  transition: 'all 0.3s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
    borderColor: alpha(GOLD_COLOR, 0.5),
  }
}));

// Componente estilizado para Divider personalizado
const GoldDivider = styled(Divider)({
  borderColor: alpha(GOLD_COLOR, 0.2),
  margin: '16px 0',
  width: '100%'
});

// Botão principal estilizado
const PrimaryButton = styled(Button)({
  backgroundColor: GOLD_COLOR,
  color: '#000',
  padding: '10px 32px',
  fontWeight: 'bold',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  boxShadow: `0 4px 12px ${alpha(GOLD_COLOR, 0.3)}`,
  '&:hover': {
    backgroundColor: '#E6C200',
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${alpha(GOLD_COLOR, 0.4)}`
  },
  '&.Mui-disabled': {
    backgroundColor: alpha(GOLD_COLOR, 0.3),
    color: alpha('#000', 0.5)
  }
});

// Botão de limpeza estilizado
const DangerButton = styled(Button)({
  backgroundColor: '#d32f2f',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
  '&:hover': {
    backgroundColor: '#b71c1c',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(211, 47, 47, 0.4)'
  }
});

// Tipagem para os dados de BO
interface BoData {
  numero_do_bo: string;
}

const UploadRelatorio = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ success: boolean, message: string } | null>(null);
  const [cleaningLoading, setCleaningLoading] = useState<boolean>(false);
  const [cleanResult, setCleanResult] = useState<{ success: boolean, message: string } | null>(null);
  const [newestBO, setNewestBO] = useState<BoData | null>(null);
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
      const response = await fetch(`${API_BASE_URL}/bo-statistics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar estatísticas de BO');
      }

      const data = await response.json();
      setNewestBO(data.newestBO || null);
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
      const response = await fetch(`${API_BASE_URL}/upload-relatorio`, {
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

  const handleCleanDuplicates = async () => {
    setCleaningLoading(true);
    setCleanResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/clean-duplicates`, {
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
          <CircularProgress size={40} sx={{ color: GOLD_COLOR }} />
        </Box>
      );
    }

    if (statsError) {
      return (
        <Alert severity="warning" variant="filled" sx={{ mt: 2 }}>
          {statsError}
        </Alert>
      );
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StatsCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{
                backgroundColor: alpha(GOLD_COLOR, 0.2),
                borderRadius: '50%',
                p: 1,
                mr: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <NewReleasesIcon sx={{ color: GOLD_COLOR }} />
              </Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                BO Mais Novo Registrado
              </Typography>
            </Box>
            <GoldDivider />

            {newestBO ? (
              <Box
                sx={{
                  p: 3,
                  bgcolor: alpha('#000', 0.2),
                  borderRadius: '8px',
                  border: `1px dashed ${alpha(GOLD_COLOR, 0.3)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '120px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: alpha('#000', 0.3),
                    boxShadow: `0 4px 15px ${alpha('#000', 0.5)}`,
                    borderColor: alpha(GOLD_COLOR, 0.5)
                  }
                }}
              >
                <Typography variant="body1" sx={{ color: '#aaa', mb: 1 }}>
                  Registro mais recente:
                </Typography>
                <Typography variant="h6" sx={{ color: GOLD_COLOR, fontWeight: 'bold' }}>
                  {newestBO.numero_do_bo}
                </Typography>
              </Box>
            ) : (
              <Box sx={{
                p: 3,
                bgcolor: alpha('#000', 0.2),
                borderRadius: 2,
                textAlign: 'center',
                border: `1px dashed ${alpha(GOLD_COLOR, 0.3)}`,
                minHeight: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="body2" sx={{ color: '#aaa', fontStyle: 'italic' }}>
                  Nenhum BO encontrado no sistema.
                </Typography>
              </Box>
            )}
          </StatsCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <StatsCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{
                backgroundColor: alpha(GOLD_COLOR, 0.2),
                borderRadius: '50%',
                p: 1,
                mr: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <FlagIcon sx={{ color: GOLD_COLOR }} />
              </Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                BO Mais Antigo Registrado
              </Typography>
            </Box>
            <GoldDivider />

            {oldestBO ? (
              <Box
                sx={{
                  p: 3,
                  bgcolor: alpha('#000', 0.2),
                  borderRadius: '8px',
                  border: `1px dashed ${alpha(GOLD_COLOR, 0.3)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '120px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: alpha('#000', 0.3),
                    boxShadow: `0 4px 15px ${alpha('#000', 0.5)}`,
                    borderColor: alpha(GOLD_COLOR, 0.5)
                  }
                }}
              >
                <Typography variant="body1" sx={{ color: '#aaa', mb: 1 }}>
                  Registro mais antigo:
                </Typography>
                <Typography variant="h6" sx={{ color: GOLD_COLOR, fontWeight: 'bold' }}>
                  {oldestBO.numero_do_bo}
                </Typography>
              </Box>
            ) : (
              <Box sx={{
                p: 3,
                bgcolor: alpha('#000', 0.2),
                borderRadius: 2,
                textAlign: 'center',
                border: `1px dashed ${alpha(GOLD_COLOR, 0.3)}`,
                minHeight: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="body2" sx={{ color: '#aaa', fontStyle: 'italic' }}>
                  Nenhum BO encontrado no sistema.
                </Typography>
              </Box>
            )}
          </StatsCard>
        </Grid>
      </Grid>
    );
  };

  return (
    <AnimatedContainer>
      <Container maxWidth="lg">
        <Typography variant="h5" fontWeight="bold" sx={{
          mb: 3,
          color: 'white',
          position: 'relative',
          display: 'inline-block',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '50%',
            height: '3px',
            bottom: '-8px',
            left: '0',
            backgroundColor: GOLD_COLOR,
            borderRadius: '2px'
          }
        }}>
          Upload de Relatório
        </Typography>

        <GradientPaper>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <UploadFileIcon sx={{ color: GOLD_COLOR, mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: 'white' }}>
              Importação de Relatórios SINESP
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ mb: 3, color: '#ccc' }}>
            Faça upload do arquivo de relatório no formato Excel (.xlsx) para importação automática dos dados.
          </Typography>

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
            px: 2,
            mb: 3,
            bgcolor: alpha('#000', 0.2),
            borderRadius: 2,
            border: `1px dashed ${alpha(GOLD_COLOR, 0.3)}`
          }}>
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
                startIcon={<CloudUploadIcon />}
                sx={{
                  borderColor: GOLD_COLOR,
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: GOLD_COLOR,
                    backgroundColor: alpha(GOLD_COLOR, 0.1),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 5px 15px ${alpha(GOLD_COLOR, 0.2)}`
                  }
                }}
              >
                Selecionar Arquivo
              </Button>
            </label>

            {file && (
              <Box sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 1,
                bgcolor: alpha(GOLD_COLOR, 0.1),
                border: `1px solid ${alpha(GOLD_COLOR, 0.2)}`,
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
              }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  <strong>Arquivo:</strong> {file.name}
                </Typography>
              </Box>
            )}

            <PrimaryButton
              variant="contained"
              onClick={handleUpload}
              disabled={!file || loading}
              sx={{ mt: 3 }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Processando...' : 'Processar Arquivo'}
            </PrimaryButton>
          </Box>

          {result && (
            <Alert
              severity={result.success ? 'success' : 'error'}
              variant="filled"
              sx={{ mt: 2, mb: 3 }}
            >
              {result.message}
            </Alert>
          )}

          <GoldDivider />

          <Box sx={{ mt: 3, mb: 2 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'flex-start',
              bgcolor: alpha('#2c2c2c', 0.5),
              borderRadius: 2,
              p: 2
            }}>
              <InfoIcon sx={{ color: GOLD_COLOR, mr: 1.5, mt: 0.3 }} />
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                  Importante:
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  • O arquivo deve conter no mínimo as tabelas: "Dados do Registro", "Dados do Fato", "Envolvidos" e "Relato Histórico"<br />
                  • Certifique-se que o arquivo segue o formato padrão dos relatórios de B.O. do SINESP<br />
                  • Antes de importar novos arquivos, consulte abaixo o BO mais recente cadastrado, verifique a data do referido BO no sistema e utilize relatórios a partir da referida data.
                </Typography>
              </Box>
            </Box>
          </Box>

          <GoldDivider />

          {/* Nova seção para estatísticas de BO */}
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{
                backgroundColor: alpha(GOLD_COLOR, 0.1),
                borderRadius: '8px',
                p: 1,
                mr: 1.5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <HistoryIcon sx={{ color: GOLD_COLOR }} />
              </Box>
              <Typography variant="h6" sx={{ color: 'white' }}>
                Estatísticas dos BOs
              </Typography>
            </Box>

            {renderBOStats()}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="text"
                onClick={fetchBOStats}
                disabled={loadingStats}
                startIcon={loadingStats ? <CircularProgress size={20} /> : <RefreshIcon />}
                sx={{
                  color: GOLD_COLOR,
                  '&:hover': {
                    backgroundColor: alpha(GOLD_COLOR, 0.1)
                  }
                }}
              >
                Atualizar Estatísticas
              </Button>
            </Box>
          </Box>

          {/* Seção para o botão de limpeza */}
          <GoldDivider />

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 2 }}>
              Manutenção da Base de Dados
            </Typography>

            <Box sx={{
              bgcolor: alpha('#2c2c2c', 0.5),
              borderRadius: 2,
              p: 3,
              border: `1px solid ${alpha('#d32f2f', 0.3)}`
            }}>
              <Typography variant="body2" sx={{ mb: 2, color: '#ccc' }}>
                Após a inserção de novos relatórios, use esta opção para remover registros duplicados do banco de dados, mantendo apenas uma ocorrência de cada registro.
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Tooltip title="Esta operação não pode ser desfeita" placement="top">
                  <span>
                    <DangerButton
                      variant="contained"
                      onClick={handleCleanDuplicates}
                      disabled={cleaningLoading}
                      startIcon={cleaningLoading ? <CircularProgress size={20} color="inherit" /> : <CleaningServicesIcon />}
                    >
                      {cleaningLoading ? 'Limpando...' : 'Limpar Dados Duplicados'}
                    </DangerButton>
                  </span>
                </Tooltip>
              </Box>

              <Typography variant="caption" display="block" sx={{ mt: 2, color: '#ff9e9e', textAlign: 'center' }}>
                Atenção: As operações realizadas nesta seção não podem ser desfeitas.
              </Typography>

              {cleanResult && (
                <Alert
                  severity={cleanResult.success ? "success" : "error"}
                  variant="filled"
                  sx={{ mt: 2 }}
                >
                  {cleanResult.message}
                </Alert>
              )}
            </Box>
          </Box>
        </GradientPaper>
      </Container>
    </AnimatedContainer>
  );
};

export default UploadRelatorio;