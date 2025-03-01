import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import SignIn from './components/SignIn'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import UsersList from './components/UsersList'
import UserRegister from './components/UserRegister'
import { darkTheme } from './theme/darkTheme'
import CadastroEnvolvidos from './components/CadastroEnvolvidos'
import ConsultaEnvolvidos from './components/ConsultaEnvolvidos'
import DashboardContent from './components/DashboardContent'
import ReincidenciaCPF from './components/ReincidenciaCPF'
import ReincidenciaPIX from './components/ReincidenciaPIX'

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<DashboardContent />} />
            <Route path="/settings/users" element={<UsersList />} />
            <Route path="/settings/register" element={<UserRegister />} />
            <Route path="/cadastro-envolvidos" element={<CadastroEnvolvidos />} />
            <Route path="/consulta-envolvidos" element={<ConsultaEnvolvidos />} />
            <Route path="/reincidencia-cpf" element={<ReincidenciaCPF />} />
            <Route path="/reincidencia-pix" element={<ReincidenciaPIX />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App