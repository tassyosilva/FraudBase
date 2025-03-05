import { useState } from 'react';
import {
  Paper,
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices'; // Novo import

const UploadRelatorio = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ success: boolean, message: string } | null>(null);

  // Estados adicionados apenas para a funcionalidade de limpeza
  const [cleaningLoading, setCleaningLoading] = useState<boolean>(false);
  const [cleanResult, setCleanResult] = useState<{ success: boolean, message: string } | null>(null);

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

  // Nova função para limpar duplicatas
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

        {/* Nova seção para o botão de limpeza, adicionada após o conteúdo original */}
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