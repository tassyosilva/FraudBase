import * as React from 'react';
import { useState } from 'react';
import {
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  Container,
  Paper,
  alpha,
  CircularProgress,
  InputAdornment,
  IconButton,
  styled,
  Alert,
  Zoom,
  Fade
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '../theme/darkTheme';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';

import API_BASE_URL from '../config/api';

// Constantes para cores
const GOLD_COLOR = '#FFD700';
const GOLD_HOVER = '#E5C100';

// Container animado
const AnimatedContainer = styled('div')({
  animation: 'fadeIn 0.6s ease-out',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `radial-gradient(circle at center, #2c2c2c 0%, #121212 100%)`,
  position: 'relative',
  overflow: 'hidden',
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '5px',
    background: `linear-gradient(90deg, ${alpha(GOLD_COLOR, 0)}, ${GOLD_COLOR}, ${alpha(GOLD_COLOR, 0)})`,
    zIndex: 2
  }
});

// Paper com efeito de vidro
const GlassPaper = styled(Paper)({
  backdropFilter: 'blur(20px)',
  backgroundColor: alpha('#1A1A1A', 0.7),
  border: `1px solid ${alpha(GOLD_COLOR, 0.2)}`,
  borderRadius: 16,
  padding: '40px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: `0 10px 30px ${alpha('#000', 0.3)}, 
              0 1px 8px ${alpha(GOLD_COLOR, 0.2)}, 
              inset 0 0 30px ${alpha('#000', 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  maxWidth: '400px',
  width: '100%',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${alpha(GOLD_COLOR, 0)}, ${GOLD_COLOR}, ${alpha(GOLD_COLOR, 0)})`
  }
});

// Logo container com animações
const LogoContainer = styled(Box)({
  position: 'relative',
  marginBottom: '20px',
  '& img': {
    animation: 'pulse 3s infinite ease-in-out',
    filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.3))'
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)' }
  }
});

// Botão de login estilizado
const LoginButton = styled(Button)({
  marginTop: '24px',
  marginBottom: '16px',
  padding: '12px',
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: '8px',
  background: `linear-gradient(45deg, ${GOLD_COLOR}, ${GOLD_HOVER})`,
  color: '#000000',
  boxShadow: `0 4px 15px ${alpha(GOLD_COLOR, 0.4)}`,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: `0 6px 20px ${alpha(GOLD_COLOR, 0.6)}`,
    transform: 'translateY(-2px)'
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: `0 2px 10px ${alpha(GOLD_COLOR, 0.4)}`
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0))`,
    transform: 'rotate(30deg)',
    transition: 'transform 0.3s ease-out',
    opacity: 0
  },
  '&:hover::after': {
    opacity: 1,
    transform: 'rotate(30deg) translate(40%, -30%)'
  }
});

// Campos de texto customizados
const StyledTextField = styled(TextField)({
  marginBottom: '16px',
  '& .MuiInputBase-root': {
    color: 'white',
    backgroundColor: alpha('#000', 0.2),
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: alpha(GOLD_COLOR, 0.3),
      borderWidth: '1px',
      transition: 'all 0.3s ease'
    },
    '&:hover fieldset': {
      borderColor: alpha(GOLD_COLOR, 0.5)
    },
    '&.Mui-focused fieldset': {
      borderColor: GOLD_COLOR,
      borderWidth: '2px'
    }
  },
  '& .MuiInputLabel-root': {
    color: alpha('#fff', 0.7)
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: GOLD_COLOR
  },
  '& .MuiInputAdornment-root .MuiSvgIcon-root': {
    color: alpha(GOLD_COLOR, 0.7)
  }
});

export default function SignIn() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData(event.currentTarget);
    const loginData = {
      username: data.get('email'),
      password: data.get('password'),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const result = await response.json();

      // Pequeno delay para mostrar a animação de carregamento
      setTimeout(() => {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('isAdmin', result.isAdmin.toString());
        sessionStorage.setItem('token', result.token);
        sessionStorage.setItem('userId', result.userId.toString());
        sessionStorage.setItem('username', result.username);
        sessionStorage.setItem('nome', result.nome);

        navigate('/dashboard');
      }, 800);
    } catch (err) {
      setTimeout(() => {
        setError('Usuário ou senha inválidos');
        setLoading(false);
      }, 500);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AnimatedContainer>
        <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 10 }}>
          <Fade in={true} timeout={1000}>
            <GlassPaper elevation={6}>
              <LogoContainer>
                <img src={logo} alt="FraudBase Logo" style={{ height: '180px' }} />
              </LogoContainer>

              <Box sx={{ position: 'relative', mb: 3, textAlign: 'center' }}>
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    textShadow: `0 0 10px ${alpha(GOLD_COLOR, 0.5)}`
                  }}
                >
                  FraudBase
                </Typography>
                <Box sx={{
                  width: '40px',
                  height: '3px',
                  background: GOLD_COLOR,
                  margin: '12px auto 0',
                  borderRadius: '2px'
                }} />
              </Box>

              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <StyledTextField
                  required
                  fullWidth
                  id="email"
                  label="Usuário"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <StyledTextField
                  required
                  fullWidth
                  name="password"
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          sx={{ color: alpha('#fff', 0.7) }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <LoginButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SecurityIcon />}
                >
                  {loading ? 'Autenticando...' : 'Entrar'}
                </LoginButton>

                {error && (
                  <Zoom in={!!error}>
                    <Alert
                      severity="error"
                      variant="filled"
                      icon={<SecurityIcon />}
                      sx={{
                        width: '100%',
                        mt: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}
                    >
                      {error}
                    </Alert>
                  </Zoom>
                )}

                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    color: alpha('#fff', 0.6),
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}
                >
                  Sistema para cruzamento de dados de envolvidos em Fraudes Eletrônicas.
                </Typography>
              </Box>
            </GlassPaper>
          </Fade>
        </Container>
      </AnimatedContainer>
    </ThemeProvider>
  );
}
