import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid
} from '@mui/material';

export default function Settings() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // Aqui será implementada a integração com o backend
  };

  return (
    <Paper sx={{ p: 4, bgcolor: 'background.paper' }}>
      <Typography variant="h6" color="white" gutterBottom>
        Cadastro de Usuários
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="login"
              label="Login"
              variant="outlined"
              sx={{ input: { color: 'white' }, label: { color: 'white' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="nome"
              label="Nome Completo"
              variant="outlined"
              sx={{ input: { color: 'white' }, label: { color: 'white' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="cpf"
              label="CPF"
              variant="outlined"
              sx={{ input: { color: 'white' }, label: { color: 'white' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="matricula"
              label="Matrícula"
              variant="outlined"
              sx={{ input: { color: 'white' }, label: { color: 'white' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="telefone"
              label="Telefone"
              variant="outlined"
              sx={{ input: { color: 'white' }, label: { color: 'white' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="unidade"
              label="Unidade Policial"
              variant="outlined"
              sx={{ input: { color: 'white' }, label: { color: 'white' } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="email"
              label="E-mail"
              variant="outlined"
              sx={{ input: { color: 'white' }, label: { color: 'white' } }}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ 
            mt: 3,
            mb: 2,
            bgcolor: '#FFD700',
            color: '#000000',
            '&:hover': {
              bgcolor: '#E5C100'
            }
          }}
        >
          Cadastrar Usuário
        </Button>
      </Box>
    </Paper>
  );
}
