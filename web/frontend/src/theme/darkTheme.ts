import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFD700', // Dourado
    },
    background: {
      default: '#000000', // Preto
      paper: '#1C1C1C', // Cinza muito escuro
    },
    text: {
      primary: '#FFFFFF', // Letras brancas
      secondary: '#FFD700', // Detalhes em dourado
    },
  },
});