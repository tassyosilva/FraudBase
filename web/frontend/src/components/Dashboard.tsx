import * as React from 'react';
import { useState, useEffect } from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person';
import { Outlet, useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import logo from '../assets/logo.png';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const drawerWidth: number = 280;

// AppBar estilizada com gradiente e efeito de vidro
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  background: `linear-gradient(90deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
  backdropFilter: 'blur(10px)',
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: `0 4px 20px ${alpha('#000', 0.2)}`,
  zIndex: theme.zIndex.drawer + 1,
  width: `calc(100% - ${drawerWidth}px)`,
  marginLeft: drawerWidth,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
}));

// Drawer estilizada com fundo mais escuro e borda destacada
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    '& .MuiDrawer-paper': {
      backgroundColor: alpha(theme.palette.background.paper, 0.95),
      backgroundImage: `linear-gradient(rgba(20, 20, 25, 0.7), rgba(20, 20, 25, 0.9))`,
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      boxSizing: 'border-box',
      borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      boxShadow: `4px 0 20px ${alpha('#000', 0.3)}`,
      overflow: 'hidden',
    },
  }),
);

// Botão estilizado para a barra superior
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '8px 16px',
  transition: 'all 0.3s ease',
  textTransform: 'none',
  fontWeight: 600,
  borderColor: alpha(theme.palette.primary.main, 0.5),
  color: theme.palette.primary.main,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

// Container principal com rolagem suave
const MainContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: 'fadeIn 0.4s ease-in-out',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

interface DashboardProps {
  children: React.ReactNode;
  menu?: React.ReactNode; // Opcional
}

export default function Dashboard({ children, menu }: DashboardProps) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [userInitials, setUserInitials] = useState<string>('');

  // Efeito para obter o nome do usuário do sessionStorage
  useEffect(() => {
    const nome = sessionStorage.getItem('nome');
    if (nome) {
      setUserName(nome);
      // Obter iniciais do nome para o avatar
      const initials = nome
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      setUserInitials(initials);
    }
  }, []);

  const handleLogout = () => {
    // Limpar completamente o sessionStorage
    sessionStorage.clear();
    // Forçar uma atualização da página para garantir que todas as referências em memória sejam limpas
    window.location.href = '/';
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppBar position="absolute">
        <Toolbar sx={{
          pr: '24px',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={logo}
              alt="FraudBase Logo"
              style={{
                height: '45px',
                marginRight: '16px',
                filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))'
              }}
            />
            <Typography
              component="h1"
              variant="h5"
              color="white"
              sx={{
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              FraudBase
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              mr: 3,
              px: 2,
              py: 0.5,
              borderRadius: '20px',
              background: alpha('#FFD700', 0.15),
            }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  color: 'black',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  mr: 1,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                {userInitials}
              </Avatar>
              <Typography
                variant="body2"
                color="white"
                sx={{
                  fontWeight: 500,
                  display: { xs: 'none', md: 'block' }
                }}
              >
                {userName}
              </Typography>
            </Box>

            <StyledButton
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={handleViewProfile}
              size="small"
              sx={{ mr: 2 }}
            >
              Perfil
            </StyledButton>

            <StyledButton
              variant="outlined"
              startIcon={<ExitToAppIcon />}
              onClick={handleLogout}
              size="small"
              color="primary"
            >
              Sair
            </StyledButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent">
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70px',
            background: alpha('#000', 0.2)
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              color: 'primary.main',
              fontWeight: 'bold',
              letterSpacing: 1
            }}
          >
            MENU PRINCIPAL
          </Typography>
        </Toolbar>
        <Divider sx={{
          borderColor: alpha('#FFD700', 0.2),
          boxShadow: `0 1px 5px ${alpha('#000', 0.5)}`
        }} />

        <Box sx={{
          flexGrow: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: alpha('#000', 0.1),
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha('#FFD700', 0.3),
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: alpha('#FFD700', 0.5),
          },
        }}>
          {menu || children}
        </Box>

        <Divider sx={{ borderColor: alpha('#FFD700', 0.2) }} />
        <Box sx={{
          p: 2,
          background: alpha('#000', 0.2),
          textAlign: 'center'
        }}>
          <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
            © 2025 FraudBase
          </Typography>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          backgroundColor: 'background.default',
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: alpha('#000', 0.1),
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha('#FFD700', 0.3),
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: alpha('#FFD700', 0.5),
          },
        }}
      >
        <Toolbar />
        <MainContainer maxWidth="lg">
          <Outlet />
        </MainContainer>
      </Box>
    </Box>
  );
}
