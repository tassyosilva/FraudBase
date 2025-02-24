import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

export const MainListItems = () => {
  const navigate = useNavigate();
  const isAdmin = true;

  return (
    <React.Fragment>
      <ListItemButton onClick={() => navigate('/dashboard')}>
        <ListItemIcon>
          <DashboardIcon sx={{ color: '#FFD700' }} />
        </ListItemIcon>
        <ListItemText primary="Dashboard" sx={{ color: 'white' }} />
      </ListItemButton>
      
      <ListItemButton>
        <ListItemIcon>
          <PersonAddIcon sx={{ color: '#FFD700' }} />
        </ListItemIcon>
        <ListItemText primary="Cadastrar" sx={{ color: 'white' }} />
      </ListItemButton>
      
      <ListItemButton>
        <ListItemIcon>
          <SearchIcon sx={{ color: '#FFD700' }} />
        </ListItemIcon>
        <ListItemText primary="Consultar" sx={{ color: 'white' }} />
      </ListItemButton>
      
      <ListItemButton>
        <ListItemIcon>
          <BarChartIcon sx={{ color: '#FFD700' }} />
        </ListItemIcon>
        <ListItemText primary="Gráficos" sx={{ color: 'white' }} />
      </ListItemButton>

      {isAdmin && (
        <ListItemButton onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <SettingsIcon sx={{ color: '#FFD700' }} />
          </ListItemIcon>
          <ListItemText primary="Configurações" sx={{ color: 'white' }} />
        </ListItemButton>
      )}
      
      <ListItemButton>
        <ListItemIcon>
          <LogoutIcon sx={{ color: '#FFD700' }} />
        </ListItemIcon>
        <ListItemText primary="Sair" sx={{ color: 'white' }} />
      </ListItemButton>
    </React.Fragment>
  );
};