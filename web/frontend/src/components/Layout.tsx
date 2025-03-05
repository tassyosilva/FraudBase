import { useState, ReactNode, useEffect } from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';
import UploadFileIcon from '@mui/icons-material/UploadFile'; // Importe este ícone

interface MenuItem {
  text: string;
  icon?: React.ReactNode;
  path?: string;
  subItems?: {
    text: string;
    path: string;
  }[];
  adminOnly?: boolean; // Propriedade para marcar itens apenas para administradores
  id?: string; // Adicionando id para identificação do item ativo
}

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar se o usuário é administrador ao carregar o componente
  useEffect(() => {
    const adminStatus = sessionStorage.getItem('isAdmin');
    setIsAdmin(adminStatus === 'true');
  }, []);

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
      adminOnly: true, // Marcar como apenas para administradores
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
        {filteredMenuItems.map((item, index) => (
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
      {children}
    </Dashboard>
  );
}