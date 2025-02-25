import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import SignIn from './components/SignIn'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import UsersList from './components/UsersList'
import UserRegister from './components/UserRegister'
import { darkTheme } from './theme/darkTheme'

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
            <Route path="/settings/users" element={<UsersList />} />
            <Route path="/settings/register" element={<UserRegister />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App