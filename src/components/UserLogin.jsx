import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/UserService';
import { useAuth } from '../context/AuthContext';

import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from "@mui/material/FormControl";
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

const UserLogin = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loginResult, setLoginResult] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [pressed, setPressed] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginData = {
      name: String(name),
      password: String(password)
    };

    try {
      setPressed(true);
      const response = await UserService.login(loginData);
      setLoginResult(response.data);
      console.log("Login exitoso", response.data);
      login(response.data); // Guardar el estado de autenticación
      setSnackbarMessage("Login exitoso");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate('/home'); // Redirigir a la página de inicio después del login
      }, 1500);
    } catch (error) {
      console.log("Error al iniciar sesión", error);
      if (error.response && error.response.status === 401) {
        setSnackbarMessage("Usuario o Contraseña incorrectas");
      } else if (error.response && error.response.data) {
        setSnackbarMessage(error.response.data);
      } else {
        setSnackbarMessage("Error al iniciar sesión");
      }
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      setLoginResult({ error: "Error al iniciar sesión" });
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
      onSubmit={handleLogin}
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
      <h3>Iniciar Sesión</h3>
      <hr />
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
          id="password"
          label="Contraseña"
          variant='outlined'
          type="password"
          size="small"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          Iniciar Sesión
        </Button>
      </FormControl>

      {loginResult === null && name && password && pressed &&(
        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <CircularProgress />
        </Box>
      )}

      {loginResult && (
        <Card variant="outlined" style={{ padding: '16px', marginTop: '16px' }}>
          <CardContent>
            <Typography variant="body1" color={loginResult.error ? "error" : "textPrimary"}>
              {loginResult.error ? loginResult.error : "Login exitoso"}
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

export default UserLogin;