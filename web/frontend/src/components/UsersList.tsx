import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Container,
  alpha,
  styled,
  Tooltip,
  TablePagination} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { User } from '../types/User';
import EditUserModal from './EditUserModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

import API_BASE_URL from '../config/api';

// Cores consistentes
const GOLD_COLOR = '#FFD700';
const CARD_BG = '#1e1e1e';

// Componente estilizado para o container principal com animação de fade-in
const AnimatedContainer = styled(Box)({
  animation: 'fadeIn 0.5s ease-in-out',
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 }
  }
});

// Papel estilizado para o conteúdo principal
const GradientPaper = styled(Paper)({
  padding: '24px',
  backgroundColor: CARD_BG,
  backgroundImage: `linear-gradient(to bottom, ${alpha('#2c2c2c', 0.8)}, ${alpha('#1a1a1a', 0.8)})`,
  boxShadow: `0 8px 32px 0 ${alpha('#000', 0.6)}`,
  border: `1px solid ${alpha(GOLD_COLOR, 0.2)}`,
  borderRadius: 12,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '3px',
    background: `linear-gradient(90deg, ${alpha(GOLD_COLOR, 0)}, ${alpha(GOLD_COLOR, 0.7)}, ${alpha(GOLD_COLOR, 0)})`
  }
});

// Tabela estilizada
const StyledTable = styled(Table)({
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${alpha('#FFF', 0.1)}`
  }
});

// Cabeçalho da tabela estilizado
const StyledTableHead = styled(TableHead)({
  '& .MuiTableCell-head': {
    backgroundColor: '#1A1A1A',
    color: 'white',
    fontWeight: 'bold',
    padding: '16px',
    borderBottom: `2px solid ${alpha(GOLD_COLOR, 0.3)}`
  }
});

// Linha da tabela estilizada
const StyledTableRow = styled(TableRow)({
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: alpha('#FFF', 0.05)
  },
  '&:last-child td, &:last-child th': {
    borderBottom: 0
  }
});

// Botão de edição estilizado
const EditButton = styled(IconButton)({
  color: GOLD_COLOR,
  transition: 'all 0.2s',
  padding: 8,
  margin: '0 4px',
  '&:hover': {
    backgroundColor: alpha(GOLD_COLOR, 0.1),
    transform: 'translateY(-2px)'
  }
});

// Botão de exclusão estilizado
const DeleteButton = styled(IconButton)({
  color: '#f44336',
  transition: 'all 0.2s',
  padding: 8,
  margin: '0 4px',
  '&:hover': {
    backgroundColor: alpha('#f44336', 0.1),
    transform: 'translateY(-2px)'
  }
});

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Estado para paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.message || 'Erro ao carregar usuários');
      }
    } catch (err) {
      setError('Erro de conexão ao servidor');
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const saveUser = async (updatedUser: User) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedUser)
      });

      const data = await response.json();
      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Usuário atualizado com sucesso',
          severity: 'success'
        });
        fetchUsers(); // Recarregar a lista de usuários
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Erro ao atualizar usuário',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      setSnackbar({
        open: true,
        message: 'Erro de conexão ao servidor',
        severity: 'error'
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Usuário excluído com sucesso',
          severity: 'success'
        });
        fetchUsers(); // Recarregar a lista de usuários
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Erro ao excluir usuário',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      setSnackbar({
        open: true,
        message: 'Erro de conexão ao servidor',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Handlers para paginação
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Renderização do estado de carregamento
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress size={60} sx={{ color: GOLD_COLOR, mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Carregando usuários...
        </Typography>
      </Box>
    );
  }

  // Renderização do estado de erro
  if (error) {
    return (
      <Box p={3} display="flex" justifyContent="center">
        <Alert
          severity="error"
          variant="filled"
          sx={{
            width: '100%',
            maxWidth: 600,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Cálculo para paginação
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, users.length - page * rowsPerPage);
  const visibleUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <AnimatedContainer>
      <Container maxWidth="lg">
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            mb: 3,
            color: 'white',
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '50%',
              height: '3px',
              bottom: '-8px',
              left: '0',
              backgroundColor: GOLD_COLOR,
              borderRadius: '2px'
            }
          }}
        >
          <PeopleAltIcon sx={{ color: GOLD_COLOR, mr: 1.5 }} />
          Usuários Cadastrados
        </Typography>

        <GradientPaper>
          <TableContainer sx={{
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: `inset 0 0 10px ${alpha('#000', 0.3)}`
          }}>
            <StyledTable stickyHeader>
              <StyledTableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Login</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Unidade Policial</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="center" width="140px">Ações</TableCell>
                </TableRow>
              </StyledTableHead>

              <TableBody sx={{ backgroundColor: alpha('#000', 0.2) }}>
                {visibleUsers.length === 0 ? (
                  <StyledTableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" sx={{ color: alpha('#FFF', 0.6), fontStyle: 'italic' }}>
                        Nenhum usuário encontrado
                      </Typography>
                    </TableCell>
                  </StyledTableRow>
                ) : (
                  visibleUsers.map((user) => (
                    <StyledTableRow key={user.id}>
                      <TableCell sx={{ color: 'white', fontWeight: 500 }}>{user.nome}</TableCell>
                      <TableCell sx={{ color: '#CCC' }}>{user.login}</TableCell>
                      <TableCell sx={{ color: '#CCC' }}>{user.email}</TableCell>
                      <TableCell sx={{ color: '#CCC' }}>{user.unidade_policial}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_admin ? "Administrador" : "Padrão"}
                          sx={{
                            backgroundColor: user.is_admin ? GOLD_COLOR : alpha('#3f51b5', 0.8),
                            color: user.is_admin ? 'black' : 'white',
                            fontWeight: 'bold',
                            px: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: user.is_admin
                                ? `0 2px 10px ${alpha(GOLD_COLOR, 0.5)}`
                                : `0 2px 10px ${alpha('#3f51b5', 0.5)}`
                            }
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="Editar usuário" arrow placement="top">
                            <EditButton
                              size="small"
                              onClick={() => handleEditUser(user)}
                            >
                              <EditIcon fontSize="small" />
                            </EditButton>
                          </Tooltip>
                          <Tooltip title="Excluir usuário" arrow placement="top">
                            <DeleteButton
                              size="small"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <DeleteIcon fontSize="small" />
                            </DeleteButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  ))
                )}

                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </StyledTable>
          </TableContainer>

          {/* Paginação */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              color: 'white',
              '.MuiTablePagination-selectIcon, .MuiTablePagination-actions': {
                color: GOLD_COLOR
              },
              '.MuiInputBase-root': {
                color: 'white',
                marginRight: '8px'
              },
              '.MuiToolbar-root': {
                '.MuiTablePagination-displayedRows': {
                  color: '#CCC'
                }
              }
            }}
          />
        </GradientPaper>

        {/* Modal de Edição */}
        <EditUserModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={selectedUser}
          onSave={saveUser}
        />

        {/* Modal de Confirmação de Exclusão */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir o usuário ${selectedUser?.nome}? Esta ação não pode ser desfeita.`}
        />

        {/* Feedback ao usuário */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: '100%',
              boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </AnimatedContainer>
  );
};

export default UsersList;
