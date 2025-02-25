import { useState } from 'react'
import { Paper, TextField, Button, Box, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const UserRegister = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    login: '',
    nome: '',
    cpf: '',
    matricula: '',
    telefone: '',
    unidade_policial: '',
    email: '',
    senha: '',
    is_admin: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        setError(data.message)
        return
      }

      setSuccess('Usuário cadastrado com sucesso!')
      setTimeout(() => {
        navigate('/settings/users')
      }, 2000)
    } catch (err) {
      setError('Erro ao cadastrar usuário. Tente novamente.')
    }
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField 
          label="Login" 
          name="login"
          value={formData.login}
          onChange={handleChange}
          variant="outlined" 
          required
        />
        <TextField 
          label="Nome" 
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          variant="outlined" 
          required
        />
        <TextField 
          label="CPF" 
          name="cpf"
          value={formData.cpf}
          onChange={handleChange}
          variant="outlined" 
          required
        />
        <TextField 
          label="Matrícula" 
          name="matricula"
          value={formData.matricula}
          onChange={handleChange}
          variant="outlined" 
          required
        />
        <TextField 
          label="Telefone" 
          name="telefone"
          value={formData.telefone}
          onChange={handleChange}
          variant="outlined" 
        />
        <TextField 
          label="Unidade Policial" 
          name="unidade_policial"
          value={formData.unidade_policial}
          onChange={handleChange}
          variant="outlined" 
          required
        />
        <TextField 
          label="Email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
          variant="outlined" 
          required
          type="email"
        />
        <TextField 
          label="Senha" 
          name="senha"
          value={formData.senha}
          onChange={handleChange}
          type="password" 
          variant="outlined" 
          required
        />
        <FormControl>
          <FormLabel>Tipo de Usuário</FormLabel>
          <RadioGroup
            value={formData.is_admin.toString()}
            onChange={(e) => setFormData({
              ...formData,
              is_admin: e.target.value === 'true'
            })}
          >
            <FormControlLabel value="false" control={<Radio />} label="Usuário Padrão" />
            <FormControlLabel value="true" control={<Radio />} label="Administrador" />
          </RadioGroup>
        </FormControl>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          sx={{ 
            backgroundColor: '#FFD700',
            color: '#000000',
            '&:hover': {
              backgroundColor: '#E5C100'
            }
          }}
        >
          Cadastrar
        </Button>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography color="success" sx={{ mt: 2 }}>
            {success}
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

export default UserRegister