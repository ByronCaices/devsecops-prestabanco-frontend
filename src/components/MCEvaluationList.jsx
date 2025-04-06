import React, { useEffect, useState } from 'react';
import MCEvaluationService from '../services/MCEvaluationService';
import MCTypesService from '../services/MCTypesService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TextField from '@mui/material/TextField';
import UserService from '../services/UserService';

const MCEvaluationList = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [mcTypes, setMCTypes] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [searchUser, setSearchUser] = useState("");
  const [userNames, setUserNames] = useState({}); // Estado para almacenar los nombres de los usuarios
 

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await MCEvaluationService.getAllApplications();
        setApplications(response.data);
        setFilteredApplications(response.data); // Inicialmente, mostrar todas las aplicaciones
        await fetchUserNames(response.data); // Cargar nombres de usuarios
      } catch (error) {
        console.log("Error al cargar las aplicaciones", error);
      }
    };

    const fetchStatuses = async () => {
      try {
        const response = await MCEvaluationService.getAllStatuses();
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
    const fetchUserNames = async (applications) => {
      const userIds = applications.map((app) => app.client);
      const uniqueUserIds = [...new Set(userIds)];
      const userNamesMap = {};
    
      for (const userId of uniqueUserIds) {
        try {
          const response = await UserService.getNameById(userId);
          userNamesMap[userId] = response.data.name; // Extraer solo el nombre del usuario
        } catch (error) {
          console.log(`Error al obtener el nombre del usuario con ID ${userId}`, error);
          userNamesMap[userId] = 'Desconocido';
        }
      }
    
      setUserNames(userNamesMap);
    };

    fetchApplications();
    fetchStatuses();
    fetchMCTypes();
  }, []);

  const handleSearch = () => {
    if (searchUser.trim() === "") {
      setFilteredApplications(applications); // Mostrar todas las aplicaciones si no hay búsqueda
    } else {
      const filtered = applications.filter(app => {
        const userName = userNames[app.client]; // Obtén el nombre del usuario
        return userName?.toLowerCase().includes(searchUser.toLowerCase()); // Verifica si incluye el texto buscado
      });
      setFilteredApplications(filtered);
    }
  };

  const handleStatusChange = (id, status) => {
    setSelectedStatus(prevState => ({ ...prevState, [id]: status }));
  };

  const handleUpdateStatus = async (id) => {
    try {
      const status = selectedStatus[id];
      await MCEvaluationService.updateStatus(id, status);
      setSnackbarMessage("Estado actualizado con éxito");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      // Actualizar la lista de aplicaciones
      const updatedApplications = applications.map(app => 
        app.id === id ? { ...app, status } : app
      );
      setApplications(updatedApplications);
      setFilteredApplications(updatedApplications);
    } catch (error) {
      console.log("Error al actualizar el estado", error);
      setSnackbarMessage("Error al actualizar el estado");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (!auth.user || !auth.user.id) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" position="relative">
      <Typography variant="h6" color="error">
        Debe iniciar sesión y tener rol de Ejecutivo para poder evaluar Solicitudes de Crédito.
      </Typography>
      <Button onClick={() => navigate("/home")} startIcon={<HomeIcon />}>
        Volver al Inicio
      </Button>
      </Box>
    );
  }

  if (auth.user && auth.user.role !== 2) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" position="relative">
        <Typography variant="h6" color="error">
          No puedes evaluar Solicitudes de Crédito, tu usuario no tiene rol de Ejecutivo.
          Por favor acceda a otra sección.
        </Typography>
        <Button onClick={() => navigate("/home")} startIcon={<HomeIcon />}>
        Volver al Inicio
      </Button>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" width="100%" padding="16px">
      <Box position="sticky" top="0" bgcolor="white" zIndex="1" width="100%" padding="16px" boxShadow={1}>
        <Typography variant="h4" component="h3" gutterBottom>
          Evaluación de Solicitudes de Crédito Hipotecario
        </Typography>
        <Box display="flex" alignItems="center" gap="16px" marginTop="16px">
          <TextField
            label="Buscar por Usuario"
            variant="outlined"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleSearch}>
            Buscar
          </Button>
        </Box>
        <hr style={{ width: '100%' }} />
      </Box>
      {filteredApplications.map(application => {
        const mcType = mcTypes.find(type => type.id === application.type);
        return (
          <Card key={application.id} variant="outlined" style={{ padding: '16px', marginTop: '16px', width: '100%' }}>
            <CardContent>
              <Typography variant="body1">
                <strong>ID:</strong> {application.id}
              </Typography>
              <Typography variant="body1">
                <strong>Usuario:</strong> {userNames[application.client] || 'Desconocido'}
              </Typography>
              <Typography variant="body1">
                <strong>Tipo de Préstamo:</strong> {mcType ? mcType.type : "Desconocido"}
              </Typography>
              <Typography variant="body1">
                <strong>Monto del Préstamo:</strong> $ {application.loanAmount} (CLP)
              </Typography>
              <Typography variant="h6" color="primary">
                <strong>Estado:</strong> {statuses.find(status => status.id === application.status)?.status || "Desconocido"}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/evaluation/${application.id}`)}
                startIcon={<AssignmentIcon />}
                style={{ marginTop: '16px' }}
              >
                Evaluar Solicitud
              </Button>
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

export default MCEvaluationList;
