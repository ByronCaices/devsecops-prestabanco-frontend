import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, CardActionArea, CardMedia, Divider, Button } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CalculateIcon from '@mui/icons-material/Calculate';
import PlagiarismIcon from '@mui/icons-material/Plagiarism';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; // Icono para el botón FAQ
import Logo from '../images/logo.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();

  // Herramientas según rol
  const menuItemsByRole = {
    guest: [
      { icon: <MonetizationOnIcon />, title: 'SSSimula tu Crédito', path: '/simulation', description: 'Obtén un cálculo estimado de tu crédito hipotecario.' },
      { 
        icon: <RequestQuoteIcon />, 
        title: 'Solicita tu Crédito', 
        path: '/mcapplication', 
        description: '¡Regístrate para solicitar un crédito!', 
        alert: true 
      },
    ],
    client: [
      { icon: <MonetizationOnIcon />, title: 'Simula tu Crédito', path: '/simulation', description: 'Obtén un cálculo estimado de tu crédito hipotecario.' },
      { icon: <RequestQuoteIcon />, title: 'Solicita tu Crédito', path: '/mcapplication', description: 'Inicia tu solicitud de crédito hipotecario.' },
      { icon: <ChecklistIcon />, title: 'Haz Seguimiento', path: '/tracking', description: 'Revisa el estado de tus solicitudes.' },
      { icon: <CalculateIcon />, title: 'Calcula Costos', path: '/calculateAnnualCosts', description: 'Obtén un análisis detallado de costos anuales.' }
    ],
    executive: [
      { icon: <MonetizationOnIcon />, title: 'Simula un Crédito', path: '/simulation', description: 'Realiza una simulación específica de un crédito.' },
      { icon: <PlagiarismIcon />, title: 'Evalúa Crédito', path: '/evaluation', description: 'Evalúa tus créditos asignados.' },
      { icon: <CalculateIcon />, title: 'Calcula Costos', path: '/calculateAnnualCosts', description: 'Obtén un análisis detallado de costos anuales.' }
    ]
  };

  // Determinar herramientas y título según el rol
  let tools = menuItemsByRole.guest;
  let headerTitle = "¡Explora Nuestras Herramientas!";

  if (auth.isAuthenticated) {
    if (auth.user.role === 1) {
      tools = menuItemsByRole.client;
    } else if (auth.user.role === 2) {
      tools = menuItemsByRole.executive;
      headerTitle = "Herramientas para Ejecutivos";
    }
  }

  return (
    <Container maxWidth="lg">
      {/* Encabezado Principal */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mt: 4, 
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={Logo} alt="Logo PrestaBanco" style={{ width: 100, marginRight: 16 }} />
          <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold' }}>
            PrestaBanco
          </Typography>
        </Box>

        {/* Contenedor de Registro */}
        {!auth.isAuthenticated && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 3,
              py: 1,
              borderRadius: 2,
              backgroundColor: '#FFD700',
              boxShadow: 3,
              border: '2px solid #FFA500',
              position: 'relative',
              marginRight: '-50px',
              marginTop: '15px'
            }}
          >
            {/* Flecha Indicadora */}
            <Box
              sx={{
                position: 'absolute',
                top: -12,
                right: '35%',
                transform: 'translateX(50%)',
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '10px solid #FFA500'
              }}
            />
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'pre-line', textAlign: 'center' }}>
              ¡Si no te has Registrado o no{'\n'}has Iniciado Sesión, hazlo aquí!
            </Typography>
          </Box>
        )}
      </Box>

      {/* Descripción */}
      <Typography variant="h6" sx={{ mt: 2, mb: 4, color: 'text.secondary' }}>
        Bienvenido a PrestaBanco, tu banco de confianza para créditos hipotecarios. Explora 
        nuestras herramientas para gestionar tus créditos de manera eficiente.
      </Typography>

      {/* Encabezado para los botones */}
      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
        {headerTitle}
      </Typography>

      {/* Llamados a la acción */}
      <Grid container spacing={4}>
        {tools.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                borderRadius: 4,
                textAlign: 'center',
                boxShadow: 3,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': { transform: 'scale(1.05)' }
              }}
            >
              <CardActionArea onClick={() => navigate(item.path)}>
                <CardMedia
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
                >
                  {item.icon}
                </CardMedia>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {item.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 1, 
                      color: item.alert ? 'red' : 'text.secondary', 
                      fontWeight: item.alert ? 'bold' : 'normal' 
                    }}
                  >
                    {item.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Contenedor de Preguntas Frecuentes */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 6, padding: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          ¿Tienes preguntas o necesitas ayuda?
        </Typography>
        <Button
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            borderColor: '#FFA500',
            color: '#FFA500',
            '&:hover': { borderColor: '#FF8C00', color: '#FF8C00' }
          }}
          onClick={() => navigate('/faq')}
        >
          Visita las Preguntas Frecuentes
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
