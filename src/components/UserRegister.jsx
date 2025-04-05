import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/UserService';
import UserRoleService from '../services/UserRoleService';

import TextField from "@mui/material/TextField";
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

const UserRegister = () => {
  const [name, setName] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [selectedUserRole, setSelectedUserRole] = useState("");
  const [registerResult, setRegisterResult] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [pressed, setPressed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserRoles = async () => {
      try {
        const response = await UserRoleService.getAll();
        setUserRoles(response.data);
      } catch (error) {
        console.log("Error al cargar los roles de usuario", error);
      }
    };

    getUserRoles();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    const registerData = {
      name: name,
      password1: password1,
      password2: password2,
      role: selectedUserRole.role
    };

    try {
      setPressed(true);
      const response = await UserService.register(registerData);
      setRegisterResult(response.data);
      console.log("Registro exitoso", response.data);
      setSnackbarMessage("Registro exitoso");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate('/login'); // Redirigir a la página de inicio de sesión después del registro
      }, 1500);
    } catch (error) {
      console.log("Error al registrar", error);
      if (error.response && error.response.data) {
        setSnackbarMessage(error.response.data);
      } else {
        setSnackbarMessage("Error al registrar");
      }
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      setRegisterResult({ error: "Error al registrar" });
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      component="form"
      onSubmit={handleRegister}
    >
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <h3>Registrarse</h3>
      <hr />
      <FormControl fullWidth>
        <InputLabel id="user-roles-list">Rol de Usuario</InputLabel>
        <Select
          labelId='user-roles-list'
          value={selectedUserRole}
          onChange={(e) => setSelectedUserRole(e.target.value)}
          displayEmpty
        >
          {userRoles.map(userRole => (
            <MenuItem key={userRole.id} value={userRole}>
              {userRole.role}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <br />
      <FormControl fullWidth>
        <TextField
          id="name"
          label="Nombre de Usuario"
          variant='outlined'
          type="text"
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <br />
      <FormControl fullWidth>
        <TextField
          id="password1"
          label="Contraseña"
          variant='outlined'
          type="password"
          size="small"
          value={password1}
          onChange={(e) => setPassword1(e.target.value)}
        />
      </FormControl>
      <br />
      <FormControl fullWidth>
        <TextField
          id="password2"
          label="Confirmar Contraseña"
          variant='outlined'
          type="password"
          size="small"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
      </FormControl>
      <br />
      <FormControl>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          style={{ marginLeft: "0.5rem" }}
        >
          Registrarse
        </Button>
      </FormControl>

      {registerResult === null && name && password1 && password2 && selectedUserRole && pressed&&(
        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <CircularProgress />
        </Box>
      )}

      {registerResult && (
        <Card variant="outlined" style={{ padding: '16px', marginTop: '16px' }}>
          <CardContent>
            <Typography variant="body1" color={registerResult.error ? "error" : "textPrimary"}>
              {registerResult.error ? registerResult.error : "Registro exitoso"}
            </Typography>
          </CardContent>
        </Card>
      )}
      <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              sx={{ 
                '& .MuiSnackbarContent-root': {
                  minWidth: '400px', 
                  maxWidth: '600px',
                }
              }}
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity={snackbarSeverity}
                sx={{ 
                  width: '100%',
                  fontSize: '1.2rem',
                  padding: '16px 24px',
                  '& .MuiAlert-icon': {
                    fontSize: '2rem',
                  }
                }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
    </Box>
  );
};

export default UserRegister;