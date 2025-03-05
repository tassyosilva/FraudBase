import { useState, ReactNode, useEffect } from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  alpha,
  styled
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface MenuItem {
  text: string;
  icon?: React.ReactNode;
  path?: string;
  subItems?: {
    text: string;
    path: string;
  }[];
  adminOnly?: boolean;
  id: string; // Tornando id obrigatório
}

interface LayoutProps {
  children?: ReactNode;
}

// Estilizando o item do menu
const StyledListItemButton = styled(ListItemButton)(() => ({
  margin: '4px 8px',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha('#FFD700', 0.15),
    transform: 'translateX(5px)',
  },
  '&.Mui-selected': {
    backgroundColor: alpha('#FFD700', 0.2),
    color: '#FFD700',
    '&:hover': {
      backgroundColor: alpha('#FFD700', 0.25),
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '4px',
      height: '70%',
      backgroundColor: '#FFD700',
      borderRadius: '0 4px 4px 0',
    }
  }
}));

// Estilizando o submenu
const StyledSubItemButton = styled(ListItemButton)(() => ({
  margin: '3px 16px 3px 32px',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  fontSize: '0.9rem',
  '&:hover': {
    backgroundColor: alpha('#FFD700', 0.1),
    transform: 'translateX(3px)',
  },
  '&.Mui-selected': {
    backgroundColor: alpha('#FFD700', 0.15),
    '&:hover': {
      backgroundColor: alpha('#FFD700', 0.2),
    },
  }
}));

export default function Layout({ children }: LayoutProps) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>('');

  // Verificar se o usuário é administrador ao carregar o componente
  useEffect(() => {
    const adminStatus = sessionStorage.getItem('isAdmin');
    setIsAdmin(adminStatus === 'true');
  }, []);

  // Definir o item selecionado com base na rota atual
  useEffect(() => {
    const path = location.pathname;

    // Expandir automaticamente o menu que contém a rota atual
    menuItems.forEach(item => {
      if (item.path && path === item.path) {
        setSelectedItem(item.id);
      } else if (item.subItems) {
        const subItemMatch = item.subItems.find(subItem => path === subItem.path);
        if (subItemMatch) {
          setSelectedItem(subItemMatch.path);
          setOpenMenus(prev => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [location.pathname]);

  // Definir os itens do menu
  const menuItems: MenuItem[] = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon sx={{ color: 'gold' }} />,
      path: '/dashboard',
      id: 'dashboard'
    },
    {
      text: 'Cadastro de Envolvidos',
      icon: <PersonIcon sx={{ color: 'gold' }} />,
      path: '/cadastro-envolvidos',
      id: 'cadastroEnvolvidos'
    },
    {
      text: 'Consulta de Envolvidos',
      icon: <SearchIcon sx={{ color: 'gold' }} />,
      path: '/consulta-envolvidos',
      id: 'consultaEnvolvidos'
    },
    {
      text: 'Upload de Relatório',
      icon: <UploadFileIcon sx={{ color: 'gold' }} />,
      path: '/upload-relatorio',
      id: 'uploadRelatorio'
    },
    {
      text: 'Gráficos Reincidência',
      icon: <AssessmentIcon sx={{ color: 'gold' }} />,
      id: 'graficosReincidencia',
      subItems: [
        {
          text: 'Reincidência Por CPF',
          path: '/reincidencia-cpf'
        },
        {
          text: 'Reincidência Por PIX',
          path: '/reincidencia-pix'
        }
      ]
    },
    {
      text: 'Configurações',
      icon: <SettingsIcon sx={{ color: 'gold' }} />,
      adminOnly: true,
      id: 'configuracoes',
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

  // Filtrar os itens do menu com base no status de administrador
  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  // Modificar para alternar apenas o estado do menu específico
  const handleClick = (item: MenuItem) => {
    if (item.subItems) {
      setOpenMenus(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    } else {
      navigate(item.path || '/');
      setSelectedItem(item.id);
    }
  };

  // Navegar para rota de submenu
  const handleSubItemClick = (path: string) => {
    navigate(path);
    setSelectedItem(path);
  };

  return (
    <Dashboard menu={
      <List
        component="nav"
        sx={{
          py: 2,
          '& .MuiListItemIcon-root': {
            minWidth: '45px',
          }
        }}
      >
        {filteredMenuItems.map((item, index) => (
          <Box key={index} sx={{ mb: 0.5 }}>
            <StyledListItemButton
              onClick={() => handleClick(item)}
              selected={selectedItem === item.id}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: selectedItem === item.id ? 'bold' : 'normal'
                }}
              />
              {item.subItems && (
                openMenus[item.id] ? <ExpandLess /> : <ExpandMore />
              )}
            </StyledListItemButton>

            {item.subItems && (
              <Collapse
                in={!!openMenus[item.id]}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.subItems.map((subItem, subIndex) => (
                    <StyledSubItemButton
                      key={subIndex}
                      selected={selectedItem === subItem.path}
                      onClick={() => handleSubItemClick(subItem.path)}
                    >
                      <ListItemText
                        primary={subItem.text}
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                          fontWeight: selectedItem === subItem.path ? 'bold' : 'normal'
                        }}
                      />
                    </StyledSubItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>
    }>
      {children}
    </Dashboard>
  );
}
