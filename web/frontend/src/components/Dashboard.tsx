import * as React from 'react';
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
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
import logo from '../assets/logo.png';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const drawerWidth: number = 280;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.primary.main}`,
  zIndex: theme.zIndex.drawer + 1,
  width: `calc(100% - ${drawerWidth}px)`,
  marginLeft: drawerWidth,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    '& .MuiDrawer-paper': {
      backgroundColor: theme.palette.background.paper,
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      boxSizing: 'border-box',
    },
  }),
);

interface DashboardProps {
  children: React.ReactNode;
  menu?: React.ReactNode; // Opcional
}

export default function Dashboard({ children, menu }: DashboardProps) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');

  // Efeito para obter o nome do usuário do sessionStorage
  useEffect(() => {
    const nome = sessionStorage.getItem('nome');
    if (nome) {
      setUserName(nome);
    }
  }, []);

  const handleLogout = () => {
    // Limpar completamente o sessionStorage
    sessionStorage.clear();
    // Forçar uma atualização da página para garantir que todas as referências em memória sejam limpas
    window.location.href = '/';
    // Nota: Usamos window.location.href em vez de navigate para garantir um refresh completo
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="absolute">
        <Toolbar sx={{ pr: '24px' }}>
          <img src={logo} alt="FraudBase Logo" style={{ height: '40px', marginRight: '20px' }} />
          <Typography
            component="h1"
            variant="h6"
            color="white"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            FraudBase
          </Typography>

          {/* Exibição do nome do usuário */}
          {userName && (
            <Typography
              variant="body1"
              color="white"
              sx={{ mr: 2 }}
            >
              Usuário: {userName}
            </Typography>
          )}

          {/* Botão Ver Perfil */}
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<PersonIcon />}
            onClick={handleViewProfile}
            sx={{
              color: 'white',
              borderColor: 'gold',
              mr: 2,
              '&:hover': {
                borderColor: 'gold',
                backgroundColor: 'rgba(255, 215, 0, 0.1)'
              }
            }}
          >
            Ver Perfil
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ExitToAppIcon />}
            onClick={handleLogout}
            sx={{
              color: 'white',
              borderColor: 'gold',
              '&:hover': {
                borderColor: 'gold',
                backgroundColor: 'rgba(255, 215, 0, 0.1)'
              }
            }}
          >
            Sair do Sistema
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent">
        <Toolbar />
        <Divider sx={{ borderColor: 'primary.main' }} />
        {menu || children}
      </Drawer>
      <Box
        component="main"
        sx={{
          backgroundColor: 'background.default',
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}