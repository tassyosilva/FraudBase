import * as React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '../theme/darkTheme';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

export default function SignIn() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const loginData = {
      username: data.get('email'),
      password: data.get('password'),
    };

    console.log('Sending login request:', loginData);

    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const result = await response.json();

      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('isAdmin', result.isAdmin.toString());
      sessionStorage.setItem('token', result.token);
      sessionStorage.setItem('userId', result.userId.toString());
      sessionStorage.setItem('username', result.username);
      sessionStorage.setItem('nome', result.nome);

      navigate('/dashboard');
    } catch (err) {
      setError('Usuário ou senha inválidos');
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Paper
          elevation={3}
          sx={{
            marginTop: 8,
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'background.paper',
            borderRadius: 2
          }}
        >
          <Box sx={{ mb: 4 }}>
            <img src={logo} alt="FraudBase Logo" style={{ height: '200px' }} />
          </Box>
          <Typography component="h1" variant="h5" sx={{ color: 'white', mb: 3 }}>
            FraudBase
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Usuário"
              name="email"
              autoComplete="email"
              autoFocus
              variant="outlined"
              sx={{
                input: { color: 'white' },
                label: { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                  backgroundColor: 'rgba(0, 0, 0, 0.15)',
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              variant="outlined"
              sx={{
                input: { color: 'white' },
                label: { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                  },
                  backgroundColor: 'rgba(0, 0, 0, 0.15)',
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                backgroundColor: '#FFD700',
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#E5C100',
                }
              }}
            >
              Entrar
            </Button>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}