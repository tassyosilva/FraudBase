import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Grid,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { User } from '../types/User';

import API_BASE_URL from '../config/api';

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (user: User) => Promise<void>;
}

const EditUserModal = ({ open, onClose, user, onSave }: EditUserModalProps) => {
  const [formData, setFormData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado para controlar alteração de senha
  const [changePassword, setChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

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
  ];

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
      // Reset senha quando o usuário muda
      setChangePassword(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setPasswordError('');
    }
  }, [user]);

  if (!formData) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPasswordData({
      ...passwordData,
      [name]: value
    });

    if (passwordError) {
      setPasswordError('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.login) newErrors.login = 'Login é obrigatório';
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
    if (!formData.matricula) newErrors.matricula = 'Matrícula é obrigatória';

    setErrors(newErrors);

    // Validar a senha se a opção de alterar senha estiver ativa
    if (changePassword) {
      if (!passwordData.newPassword) {
        setPasswordError('Nova senha é obrigatória');
        return false;
      }
      if (passwordData.newPassword.length < 6) {
        setPasswordError('A senha deve ter pelo menos 6 caracteres');
        return false;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('As senhas não coincidem');
        return false;
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Salvar os dados do usuário
      await onSave(formData);

      // Se alterou a senha, chamar endpoint específico
      if (changePassword && passwordData.newPassword) {
        const response = await fetch(`${API_BASE_URL}/users/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          },
          body: JSON.stringify({
            id: formData.id,
            password: passwordData.newPassword
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Erro ao atualizar senha');
        }
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Usuário</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Primeira linha */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              error={Boolean(errors.login)}
              helperText={errors.login}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              error={Boolean(errors.nome)}
              helperText={errors.nome}
              required
            />
          </Grid>

          {/* Segunda linha */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="CPF"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              error={Boolean(errors.cpf)}
              helperText={errors.cpf}
              required
            />
          </Grid>

          {/* Terceira linha */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Matrícula"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              error={Boolean(errors.matricula)}
              helperText={errors.matricula}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
            />
          </Grid>

          {/* Quarta linha */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Cidade"
              name="cidade"
              value={formData.cidade || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                label="Estado"
                value={formData.estado || ''}
                onChange={(e) => handleSelectChange('estado', e.target.value as string)}
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

          {/* Quinta linha */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Unidade Policial"
              name="unidade_policial"
              value={formData.unidade_policial}
              onChange={handleChange}
            />
          </Grid>

          {/* Sexta linha */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_admin}
                  onChange={handleChange}
                  name="is_admin"
                />
              }
              label="Administrador"
            />
          </Grid>

          {/* Seção de Alteração de Senha */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Accordion
              expanded={changePassword}
              onChange={() => setChangePassword(!changePassword)}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: 'rgba(255, 215, 0, 0.05)',
                  '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.1)' }
                }}
              >
                <Typography sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                  Alterar Senha
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nova Senha"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      error={Boolean(passwordError)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirmar Senha"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      error={Boolean(passwordError)}
                      helperText={passwordError}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{
            backgroundColor: '#FFD700',
            color: 'black',
            '&:hover': { backgroundColor: '#E6C200' },
            position: 'relative'
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ position: 'absolute' }} /> : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserModal;