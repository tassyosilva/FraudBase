import { useState } from 'react'
import { Paper, TextField, Button, Box, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Typography, Grid, MenuItem, Select, InputLabel } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import API_BASE_URL from '../config/api';

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
    cidade: '',
    estado: '',
    unidade_policial: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    is_admin: false
  })

  // Estados brasileiros
  const estadosBrasileiros = [
    { codigo: 'AC', nome: 'Acre' },
    { codigo: 'AL', nome: 'Alagoas' },
    { codigo: 'AP', nome: 'Amapá' },
    { codigo: 'AM', nome: 'Amazonas' },
    { codigo: 'BA', nome: 'Bahia' },
    { codigo: 'CE', nome: 'Ceará' },
    { codigo: 'DF', nome: 'Distrito Federal' },
    { codigo: 'ES', nome: 'Espírito Santo' },
    { codigo: 'GO', nome: 'Goiás' },
    { codigo: 'MA', nome: 'Maranhão' },
    { codigo: 'MT', nome: 'Mato Grosso' },
    { codigo: 'MS', nome: 'Mato Grosso do Sul' },
    { codigo: 'MG', nome: 'Minas Gerais' },
    { codigo: 'PA', nome: 'Pará' },
    { codigo: 'PB', nome: 'Paraíba' },
    { codigo: 'PR', nome: 'Paraná' },
    { codigo: 'PE', nome: 'Pernambuco' },
    { codigo: 'PI', nome: 'Piauí' },
    { codigo: 'RJ', nome: 'Rio de Janeiro' },
    { codigo: 'RN', nome: 'Rio Grande do Norte' },
    { codigo: 'RS', nome: 'Rio Grande do Sul' },
    { codigo: 'RO', nome: 'Rondônia' },
    { codigo: 'RR', nome: 'Roraima' },
    { codigo: 'SC', nome: 'Santa Catarina' },
    { codigo: 'SP', nome: 'São Paulo' },
    { codigo: 'SE', nome: 'Sergipe' },
    { codigo: 'TO', nome: 'Tocantins' }
  ]

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '')

    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11)

    // Aplica a formatação
    if (limitedNumbers.length <= 3) {
      return limitedNumbers
    } else if (limitedNumbers.length <= 6) {
      return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3)}`
    } else if (limitedNumbers.length <= 9) {
      return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6)}`
    } else {
      return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9)}`
    }
  }

  // Função para formatar telefone
  const formatTelefone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '')

    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11)

    // Aplica a formatação
    if (limitedNumbers.length <= 2) {
      return limitedNumbers
    } else if (limitedNumbers.length <= 7) {
      return `(${limitedNumbers.slice(0, 2)})${limitedNumbers.slice(2)}`
    } else if (limitedNumbers.length <= 10) {
      return `(${limitedNumbers.slice(0, 2)})${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`
    } else {
      return `(${limitedNumbers.slice(0, 2)})${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === 'cpf') {
      setFormData({
        ...formData,
        [name]: formatCPF(value)
      })
    } else if (name === 'telefone') {
      setFormData({
        ...formData,
        [name]: formatTelefone(value)
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const validateForm = () => {
    // Verificar se as senhas coincidem
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem')
      return false
    }

    // Verificar tamanho mínimo da senha
    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return false
    }

    // Verificar se CPF tem 11 dígitos
    const cpfNumbers = formData.cpf.replace(/\D/g, '')
    if (cpfNumbers.length !== 11) {
      setError('CPF deve ter 11 dígitos')
      return false
    }

    // Verificar se telefone tem pelo menos 10 dígitos
    const telefoneNumbers = formData.telefone.replace(/\D/g, '')
    if (telefoneNumbers.length < 10) {
      setError('Telefone deve ter pelo menos 10 dígitos')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    try {
      // Preparar dados para envio (remover formatação)
      const dataToSend = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''), // Remove formatação do CPF
        telefone: formData.telefone.replace(/\D/g, ''), // Remove formatação do telefone
      }

      // Remove o campo confirmarSenha antes de enviar
      const { confirmarSenha, ...finalData } = dataToSend

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(finalData)
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
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, color: '#FFFFFF', fontWeight: 'medium' }}>
        Cadastro de Novos Usuários
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="CPF"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              required
              placeholder="000.000.000-00"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Matrícula"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              placeholder="(00)00000-0000"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Cidade"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Estado</InputLabel>
              <Select
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={(e) => setFormData({
                  ...formData,
                  estado: e.target.value as string
                })}
              >
                <MenuItem value="">
                  <em>Selecione um estado</em>
                </MenuItem>
                {estadosBrasileiros.map((estado) => (
                  <MenuItem key={estado.codigo} value={estado.codigo}>
                    {estado.nome} ({estado.codigo})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Unidade Policial"
              name="unidade_policial"
              value={formData.unidade_policial}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              required
              type="email"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              type="password"
              variant="outlined"
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Confirmar Senha"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              type="password"
              variant="outlined"
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
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
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                backgroundColor: '#FFD700',
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#E5C100'
                },
                mt: 2
              }}
            >
              Cadastrar
            </Button>
          </Grid>
        </Grid>

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