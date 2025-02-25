import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import { Outlet } from 'react-router-dom';
import logo from '../assets/logo.png';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const drawerWidth: number = 240;

// AppBar sempre no modo "aberto"
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.primary.main}`,
  marginLeft: drawerWidth,
  width: `calc(100% - ${drawerWidth}px)`,
  zIndex: theme.zIndex.drawer + 1,
}));

// Drawer sempre visível com largura fixa
const Drawer = styled(MuiDrawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    boxSizing: 'border-box',
  },
}));

interface DashboardProps {
  children: React.ReactNode;
}

export default function Dashboard({ children }: DashboardProps) {
  // Removido estado open e função toggleDrawer

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="absolute">
        <Toolbar sx={{ pr: '24px' }}>
          {/* Removido botão de toggle do menu */}
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
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent">
        <Toolbar
          sx={{
            display: 'flex',
            px: [1],
            // Removida justificação para o final (não precisamos do espaço para o botão)
          }}
        >
          {/* Removido botão de toggle do drawer */}
        </Toolbar>
        <Divider sx={{ borderColor: 'primary.main' }} />
        {children}
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