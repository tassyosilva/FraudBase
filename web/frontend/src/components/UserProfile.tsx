import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Alert,
    Snackbar,
    Avatar,
    Divider,
    Card,
    CardContent,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Person,
    Badge,
    Email,
    Phone,
    LocationOn,
    Security,
    VpnKey,
    AdminPanelSettings,
    Lock,
    Fingerprint,
    Assignment
} from '@mui/icons-material';
import { User } from '../types/User';

import API_BASE_URL from '../config/api';

const UserProfile = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = sessionStorage.getItem('userId');
                if (!userId) {
                    setError('Usuário não identificado');
                    setLoading(false);
                    return;
                }

              const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Erro ao buscar dados do usuário');
                }

                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError('Erro ao carregar informações do usuário');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleOpenPasswordModal = () => {
        setOpenPasswordModal(true);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
    };

    const handleClosePasswordModal = () => {
        setOpenPasswordModal(false);
    };

    const handlePasswordChange = async () => {
        // Validate passwords
        if (newPassword !== confirmPassword) {
            setPasswordError('As senhas não correspondem');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/users/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    id: user?.id,
                    password: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSnackbar({
                    open: true,
                    message: 'Senha alterada com sucesso',
                    severity: 'success'
                });
                handleClosePasswordModal();
            } else {
                setPasswordError(data.message || 'Erro ao alterar senha');
            }
        } catch (err) {
            setPasswordError('Erro de conexão ao servidor');
            console.error(err);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // Gerar iniciais do nome para o avatar
    const getNameInitials = () => {
        if (!user?.nome) return '?';

        const nameParts = user.nome.split(' ');
        if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    };

    // Cores personalizadas
    const colors = {
        primary: '#FFD700',
        secondary: '#121212',
        accent: '#2196F3',
        background: '#1e1e1e',
        cardBg: '#2d2d2d',
        divider: '#444444'
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ color: colors.primary }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <Alert severity="error" variant="filled">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ animation: 'fadeIn 0.5s ease-in-out', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 4,
                borderBottom: `3px solid ${colors.primary}`,
                pb: 2
            }}>
                <Person sx={{ fontSize: 36, color: colors.primary, mr: 2 }} />
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Perfil do Usuário
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Informações Pessoais */}
                <Grid item xs={12} md={6}>
                    <Card elevation={5} sx={{
                        backgroundColor: colors.cardBg,
                        borderRadius: 2,
                        height: '100%',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                        transition: 'transform 0.3s',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 20px rgba(0,0,0,0.5)'
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: colors.primary,
                                        color: 'black',
                                        fontSize: 32,
                                        fontWeight: 'bold',
                                        mr: 2,
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    {getNameInitials()}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {user?.nome}
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ color: colors.primary }}>
                                        {user?.is_admin ? 'Administrador' : 'Usuário Padrão'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2, backgroundColor: colors.divider }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Badge sx={{ color: colors.primary, mr: 2 }} />
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#aaa' }}>Login</Typography>
                                            <Typography variant="body1" sx={{ color: 'white' }}>{user?.login}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Fingerprint sx={{ color: colors.primary, mr: 2 }} />
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#aaa' }}>CPF</Typography>
                                            <Typography variant="body1" sx={{ color: 'white' }}>{user?.cpf || 'Não informado'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Assignment sx={{ color: colors.primary, mr: 2 }} />
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#aaa' }}>Matrícula</Typography>
                                            <Typography variant="body1" sx={{ color: 'white' }}>{user?.matricula || 'Não informado'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Informações de Contato */}
                <Grid item xs={12} md={6}>
                    <Card elevation={5} sx={{
                        backgroundColor: colors.cardBg,
                        borderRadius: 2,
                        height: '100%',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                        transition: 'transform 0.3s',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 20px rgba(0,0,0,0.5)'
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Box sx={{
                                    backgroundColor: colors.primary,
                                    borderRadius: '50%',
                                    p: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                }}>
                                    <Phone sx={{ color: 'black', fontSize: 32 }} />
                                </Box>
                                <Typography variant="h5" sx={{ ml: 2, color: 'white', fontWeight: 'bold' }}>
                                    Informações de Contato
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2, backgroundColor: colors.divider }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Email sx={{ color: colors.primary, mr: 2 }} />
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#aaa' }}>Email</Typography>
                                            <Typography variant="body1" sx={{ color: 'white' }}>{user?.email || 'Não informado'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Phone sx={{ color: colors.primary, mr: 2 }} />
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#aaa' }}>Telefone</Typography>
                                            <Typography variant="body1" sx={{ color: 'white' }}>{user?.telefone || 'Não informado'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <LocationOn sx={{ color: colors.primary, mr: 2 }} />
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#aaa' }}>Unidade Policial</Typography>
                                            <Typography variant="body1" sx={{ color: 'white' }}>{user?.unidade_policial || 'Não informado'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                <Tooltip title="Altere sua senha para manter sua conta segura">
                                    <Button
                                        variant="contained"
                                        startIcon={<Lock />}
                                        onClick={handleOpenPasswordModal}
                                        sx={{
                                            backgroundColor: colors.primary,
                                            color: '#000000',
                                            fontWeight: 'bold',
                                            px: 3,
                                            py: 1.2,
                                            borderRadius: 2,
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                            '&:hover': {
                                                backgroundColor: '#E5C100',
                                                transform: 'scale(1.05)',
                                                transition: 'all 0.2s'
                                            }
                                        }}
                                    >
                                        Alterar Senha
                                    </Button>
                                </Tooltip>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Informações de Segurança */}
            <Card elevation={5} sx={{
                mt: 4,
                backgroundColor: colors.cardBg,
                borderRadius: 2,
                boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                transition: 'transform 0.3s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.5)'
                }
            }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box sx={{
              backgroundColor: colors.primary, 
              borderRadius: '50%', 
              p: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}>
              <Security sx={{ color: 'black', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ ml: 2, color: 'white', fontWeight: 'bold' }}>
              Informações de Segurança
            </Typography>
          </Box>

          <Divider sx={{ my: 2, backgroundColor: colors.divider }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VpnKey sx={{ color: colors.primary, mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#aaa' }}>Última alteração de senha</Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>Não disponível</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AdminPanelSettings sx={{ color: colors.primary, mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#aaa' }}>Nível de Acesso</Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    {user?.is_admin ? 'Administrador (Acesso total)' : 'Usuário Padrão'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Modal de Alteração de Senha */}
      <Dialog 
        open={openPasswordModal} 
        onClose={handleClosePasswordModal}
        PaperProps={{
          style: {
            backgroundColor: colors.cardBg,
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', borderBottom: `1px solid ${colors.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Lock sx={{ color: colors.primary, mr: 2 }} />
            Alterar Senha
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3, mt: 2, color: '#aaa' }}>
            Digite sua nova senha e confirme-a para alterar. Recomendamos usar uma combinação de letras, números e caracteres especiais.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Nova Senha"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: colors.divider,
                },
                '&:hover fieldset': {
                  borderColor: colors.primary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.primary,
                },
              },
              '& .MuiInputLabel-root': {
                color: '#aaa',
              },
            }}
          />
          <TextField
            margin="dense"
            label="Confirmar Nova Senha"
            type="password"
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: colors.divider,
                },
                '&:hover fieldset': {
                  borderColor: colors.primary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.primary,
                },
              },
              '& .MuiInputLabel-root': {
                color: '#aaa',
              },
            }}
          />
          {passwordError && (
            <Alert severity="error" sx={{ mt: 2 }} variant="filled">
              {passwordError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.divider}` }}>
          <Button 
            onClick={handleClosePasswordModal} 
            sx={{ 
              color: '#aaa',
              '&:hover': {
                color: 'white'
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handlePasswordChange} 
            variant="contained"
            sx={{ 
              backgroundColor: colors.primary,
              color: 'black',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#E5C100'
              }
            }}
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 'bold' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;
