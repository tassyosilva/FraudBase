import { useState, ReactNode } from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';

interface MenuItem {
  text: string;
  icon?: React.ReactNode;
  path?: string;
  subItems?: {
    text: string;
    path: string;
  }[];
}

interface LayoutProps {
  children?: ReactNode; // Adicionando o '?' para tornar opcional
}

export default function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon sx={{ color: 'gold' }} />,
      path: '/dashboard'
    },
    {
      text: 'Cadastro de Envolvidos',
      icon: <PersonIcon sx={{ color: 'gold' }} />,
      path: '/cadastro-envolvidos'
    },
    {
      text: 'Consulta de Envolvidos',
      icon: <SearchIcon sx={{ color: 'gold' }} />,
      path: '/consulta-envolvidos'
    },
    {
      text: 'Configurações',
      icon: <SettingsIcon sx={{ color: 'gold' }} />,
      subItems: [
        {
          text: 'Usuários',
          path: '/settings/users'
        },
        {
          text: 'Cadastrar Usuário',
          path: '/settings/register'
        }
      ]
    }
  ];

  const handleClick = (item: MenuItem) => {
    if (item.subItems) {
      setOpen(!open);
    } else {
      navigate(item.path || '/');
    }
  };

  return (
    <Dashboard menu={
      <List component="nav">
        {menuItems.map((item, index) => (
          <div key={index}>
            <ListItemButton onClick={() => handleClick(item)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {item.subItems && (open ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
            {item.subItems && (
              <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem, subIndex) => (
                    <ListItemButton
                      key={subIndex}
                      sx={{ pl: 4 }}
                      onClick={() => navigate(subItem.path)}
                    >
                      <ListItemText primary={subItem.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </div>
        ))}
      </List>
    }>
      {children} {/* Isso é seguro mesmo se children for undefined */}
    </Dashboard>
  );
}