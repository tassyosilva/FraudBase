import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import SignIn from './components/SignIn'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import PrivateRoute from './components/PrivateRoute'
import { darkTheme } from './theme/darkTheme'

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <Dashboard>
                <Settings />
              </Dashboard>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}
export default App