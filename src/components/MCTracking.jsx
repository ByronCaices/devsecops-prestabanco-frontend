import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MCApplicationService from '../services/MCApplicationService';
import MCTrackingService from '../services/MCTrackingService';
import MCTypesService from '../services/MCTypesService';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';

const MCTracking = () => {
  const { auth } = useAuth();
  const [applications, setApplications] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [mcTypes, setMCTypes] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (auth.user && auth.user.id) {
      const fetchApplications = async () => {
        try {
          const response = await MCApplicationService.getAllByClient(auth.user.id);
          setApplications(response.data);
        } catch (error) {
          console.log("Error al cargar las aplicaciones", error);
        }
      };

      const fetchStatuses = async () => {
        try {
          const response = await MCTrackingService.getAllStatuses();
          setStatuses(response.data);
        } catch (error) {
          console.log("Error al cargar los estados", error);
        }
      };

      const fetchMCTypes = async () => {
        try {
          const response = await MCTypesService.getAll();
          setMCTypes(response.data);
        } catch (error) {
          console.log("Error al cargar los tipos de préstamo", error);
        }
      };

      fetchApplications();
      fetchStatuses();
      fetchMCTypes();
    }
  }, [auth.user]);

  const handleSendApplication = async (id) => {
    try {
      await MCTrackingService.updateStatus(id, 2); // Enviar el status 2
      setSnackbarMessage("MCApplication enviada con éxito");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      // Actualizar la lista de aplicaciones
      const updatedApplications = applications.map(app => 
        app.id === id ? { ...app, status: 2 } : app
      );
      setApplications(updatedApplications);
    } catch (error) {
      console.log("Error al enviar la MCApplication", error);
      setSnackbarMessage("Error al enviar la MCApplication");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleExpandClick = (id) => {
    setExpanded(prevState => ({ ...prevState, [id]: !prevState[id] }));
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (!auth.user || !auth.user.id) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
        <Typography variant="h6" color="error">
          Debe iniciar sesión para ver el seguimiento de sus solicitudes de crédito.
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" width="100%" padding="16px">
      <Box position="sticky" top="0" bgcolor="white" zIndex="1" width="100%" padding="16px" boxShadow={1}>
        <Typography variant="h4" component="h3" gutterBottom>
          Seguimiento de Solicitudes de Crédito Hipotecario
        </Typography>
        <hr style={{ width: '100%' }} />
      </Box>
      {applications.map(application => {
        const mcType = mcTypes.find(type => type.id === application.type);
        return (
          <Card key={application.id} variant="outlined" style={{ padding: '16px', marginTop: '16px', width: '100%' }}>
            <CardContent>
              <Typography variant="body1">
                <strong>ID:</strong> {application.id}
              </Typography>
              <Typography variant="body1">
                <strong>Tipo de Préstamo:</strong> {mcType ? mcType.type : "Desconocido"}
              </Typography>
              <Typography variant="body1">
                <strong>Monto del Préstamo:</strong> $ {application.loanAmount} (CLP)
              </Typography>
              <Typography variant="body1">
                <strong>Interés Anual:</strong> {application.annualInterestRate}%
              </Typography>
              <Typography variant="body1">
                <strong>Plazo:</strong> {application.loanTerm} Años
              </Typography>
              <Typography variant="h6" color="primary">
                <strong>Estado:</strong> {statuses.find(status => status.id === application.status)?.status || "Desconocido"}
              </Typography>
              <Button
                variant="contained"
                color="info"
                onClick={() => handleExpandClick(application.id)}
                style={{ marginTop: '16px' }}
              >
                Ver más
              </Button>
              {application.status === 1 && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleSendApplication(application.id)}
                  style={{ marginTop: '16px', marginLeft: '16px' }}
                >
                  Enviar Simulación
                </Button>
              )}
              <Collapse in={expanded[application.id]} timeout="auto" unmountOnExit>
                <Box marginTop="16px">
                  <Typography variant="body1">
                    <strong>Seguro de Gravamen:</strong> $ {application.lienInsurance}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Seguro contra Incendios:</strong> $ {application.fireInsurance}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Comisión de Administración:</strong> $ {application.administrationCommission}
                  </Typography>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        );
      })}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MCTracking;