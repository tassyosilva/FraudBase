import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
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
    Snackbar
} from '@mui/material';
import { User } from '../types/User';

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

                const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
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
            const response = await fetch('http://localhost:8080/api/users/password', {
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <Typography>Carregando informações do usuário...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
                Perfil do Usuário
            </Typography>

            <Paper sx={{ p: 4, mt: 2 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom sx={{ color: '#FFD700' }}>
                            Informações Pessoais
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Nome</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>{user?.nome}</Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Login</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>{user?.login}</Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">CPF</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>{user?.cpf}</Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Matrícula</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>{user?.matricula}</Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Email</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>{user?.email}</Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Telefone</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>{user?.telefone || 'Não informado'}</Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Unidade Policial</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>{user?.unidade_policial}</Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Tipo de Usuário</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {user?.is_admin ? 'Administrador' : 'Usuário Padrão'}
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleOpenPasswordModal}
                                sx={{
                                    backgroundColor: '#FFD700',
                                    color: '#000000',
                                    '&:hover': {
                                        backgroundColor: '#E5C100'
                                    }
                                }}
                            >
                                Alterar Senha
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Modal de Alteração de Senha */}
            <Dialog open={openPasswordModal} onClose={handleClosePasswordModal}>
                <DialogTitle>Alterar Senha</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Digite sua nova senha e confirme-a para alterar.
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
                    />
                    <TextField
                        margin="dense"
                        label="Confirmar Nova Senha"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {passwordError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {passwordError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePasswordModal} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handlePasswordChange} color="primary">
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserProfile;
