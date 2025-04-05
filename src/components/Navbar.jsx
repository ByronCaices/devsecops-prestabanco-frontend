import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Sidemenu from "./Sidemenu";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const toggleDrawer = (open) => (event) => {
    setOpen(open);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
            startIcon={<MenuIcon />}
          >
            Menú
          </Button>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h4" component="div" sx={{ display: 'inline', fontWeight: 'bold' }}>
              PrestaBanco
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {auth.isAuthenticated ? (
              <>
                <IconButton color="inherit">
                  <AccountCircleIcon />
                  <Typography variant="body1" sx={{ ml: 1, fontWeight: 'bold' }}>
                    {auth.user.name}
                  </Typography>
                </IconButton>
                <Button color="inherit" onClick={handleLogout}
                            sx={{ 
                              mr: 2, 
                              border: '2px solid', 
                              borderColor: 'white', 
                              backgroundColor: 'red', 
                              color: 'white',
                              fontWeight: 'bold'
                            }}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate('/login')} sx={{ fontWeight: 'bold' }}
                   sx={{ 
                    mr: 2, 
                    border: '2px solid', 
                    borderColor: 'black', 
                    backgroundColor: 'green', 
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                  Iniciar Sesión
                </Button>
                <Button color="inherit" onClick={() => navigate('/register')}
                              sx={{ 
                                mr: 2, 
                                border: '2px solid', 
                                borderColor: 'black', 
                                backgroundColor: 'blue', 
                                color: 'white',
                                fontWeight: 'bold'
                              }}>
                  Registrarse
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Sidemenu open={open} toggleDrawer={toggleDrawer}></Sidemenu>
    </Box>
  );
}