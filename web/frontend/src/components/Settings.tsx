import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import UserRegister from './UserRegister'; // Corrigido para importar o componente existente
import UsersList from './UsersList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Configurações
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleChange} aria-label="settings tabs">
          <Tab label="Cadastrar Usuário" />
          <Tab label="Gerenciar Usuários" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <UserRegister />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <UsersList />
      </TabPanel>
    </Box>
  );
};

export default Settings;
export default Settings;