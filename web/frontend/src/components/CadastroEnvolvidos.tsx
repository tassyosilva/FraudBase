import { useState } from 'react'
import { Paper, Typography, Box } from '@mui/material'

const CadastroEnvolvidos = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, color: '#FFFFFF', fontWeight: 'medium' }}>
        Cadastro de Envolvidos
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body1">
          Formulário para cadastro de envolvidos em crimes de estelionato.
        </Typography>
        
        {/* O formulário será implementado posteriormente */}
      </Box>
    </Paper>
  )
}

export default CadastroEnvolvidos