import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const MCSimulation = () => {
  return (
    <Box sx={{ width: '90%', margin: 'auto', mt: 4 }}>
      <Grid container spacing={2} justifyContent="center" alignItems="center" style={{ minHeight: '200px' }}>
        <Grid item xs={12}>
          <Typography variant="h4" align="center">
            Próximamente, funcionalidad para tal cosa...
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MCSimulation;
