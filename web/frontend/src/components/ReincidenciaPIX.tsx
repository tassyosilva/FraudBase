import { Box, Typography, Paper } from '@mui/material';

const ReincidenciaPIX = () => {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'gold', fontWeight: 'medium' }}>
          Reincidência Por PIX
        </Typography>
        <Typography variant="subtitle1">
          Esta funcionalidade está em desenvolvimento e estará disponível em breve.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ReincidenciaPIX;
