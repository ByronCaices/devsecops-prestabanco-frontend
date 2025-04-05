import React, { useEffect, useState } from 'react';
import MCSimulationService from '../services/MCSimulationService';
import MCTypesService from '../services/MCTypesService';
import { useAuth } from '../context/AuthContext';
import MCApplicationService from '../services/MCApplicationService';
import { useNavigate } from 'react-router-dom';

import TextField from "@mui/material/TextField";
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const MCApplication = () => {
  const { auth } = useAuth();
  const [selectedMCType, setSelectedMCType] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [annualInterestRate, setAnnualInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mcTypes, setMCTypes] = useState([]);
  const [annualInterestRateLimits, setAnnualInterestRateLimits] = useState({ min: 0, max: 0 });
  const [loanTermLimit, setLoanTermLimit] = useState(0);
  const isLoanAmountValid = loanAmount !== "" && parseInt(loanAmount.replace(/\./g, '')) > 0 && parseInt(loanAmount.replace(/\./g, '')) <= 2147483647;
  const isAnnualInterestRateValid = annualInterestRate >= annualInterestRateLimits.min && annualInterestRate <= annualInterestRateLimits.max && annualInterestRate !== 0;
  const isLoanTermValid = loanTerm >= 1 && loanTerm <= loanTermLimit;
  const [lienInsurance, setLienInsurance] = useState(0);
  const [fireInsurance, setFireInsurance] = useState(20000);
  const [administrationCommission, setAdministrationCommission] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const navigate = useNavigate();

  const [simulationParams, setSimulationParams] = useState({
      loanAmount: "",
      annualInterestRate: "",
      loanTerm: "",
    });

    useEffect(() => {
      const getMCTypes = async () => {
        try {
          setIsLoading(true);
          const response = await MCTypesService.getAll();
          setMCTypes(response.data);
        } catch (error) {
          console.log("Error al cargar los tipos", error);
        } finally {
          setIsLoading(false);
        }
      };
  
      getMCTypes();
    }, []);

    useEffect(() => {
      if (isLoanAmountValid && isAnnualInterestRateValid && isLoanTermValid && selectedMCType !== "") {
        simulateMC(new Event('submit')); // Simula el evento submit
        
        // Actualiza los valores de los estados
        setLienInsurance((parseInt(loanAmount.replace(/\./g, ''))) !=="" ? (simulationResult * 0.03).toFixed(2) : 0);
        setFireInsurance(20000); // Valor fijo, puedes modificar si es necesario
        setAdministrationCommission((parseInt(loanAmount.replace(/\./g, ''))) !== "" ? ((parseInt(loanAmount.replace(/\./g, ''))) * 0.01).toFixed(2) : 0); // Ejemplo, comisión del 1%
      }
    }, [
      loanAmount, 
      annualInterestRate, 
      loanTerm, 
      selectedMCType, 
      isLoanAmountValid, 
      isAnnualInterestRateValid, 
      isLoanTermValid
    ]);
    

    

  const handleTypeChange = (event) => {
    const selectedTypeId = event.target.value;
    setSelectedMCType(selectedTypeId);

    const selectedMCType = mcTypes.find(type => type.id === selectedTypeId);
    if (selectedMCType) {
      setAnnualInterestRateLimits({
        min: selectedMCType.min_interest_rate,
        max: selectedMCType.max_interest_rate,
      });
      setLoanTermLimit(selectedMCType.max_term);
    }
  };

  const simulateMC = (e) => {
    e.preventDefault();

    const mcSimulation = {
      loanAmount: parseInt(loanAmount.replace(/\./g, '')),
      annualInterestRate: parseFloat(annualInterestRate),
      loanTerm: parseInt(loanTerm),
    };

    setSimulationParams({
      loanAmount,
      annualInterestRate,
      loanTerm,
    });

    setIsLoading(true);
    MCSimulationService
      .simulate(mcSimulation)
      .then((response) => {
        setSimulationResult(response.data);
        console.log("Simulación exitosa", response.data);
      })
      .catch((error) => {
        console.log("Error al simular", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const applicationData = {
      status: 1,
      type: selectedMCType,
      client: auth.user.id,
      executive: 0,
      loanAmount:  parseInt(loanAmount.replace(/\./g, '')),
      loanTerm: loanTerm,
      annualInterestRate: annualInterestRate,
      lienInsurance: lienInsurance,
      fireInsurance: fireInsurance,
      administrationCommission: administrationCommission,
    };
    try {
      const response = await MCApplicationService.create(applicationData);
      console.log("Solicitud exitosa", response.data);
      setSnackbarMessage("Solicitud exitosa");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate('/tracking');
      }, 1500);
    } catch (error) {
      console.log("Error al realizar la solicitud", error);
      setSnackbarMessage("Error al realizar la solicitud");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const isButtonDisabled = !(isLoanAmountValid && isAnnualInterestRateValid && isLoanTermValid && selectedMCType !== "");

  const getValidationStyle = (isValid) => ({ color: isValid ? 'inherit' : 'red' });


  if (!auth.user || !auth.user.id) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" position="relative">
        <Typography variant="h6" color="error">
          Debe iniciar sesión para poder realizar una Solicitud de Crédito.
        </Typography>
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
              top: '-250px',
              left: '490px',
            }}
          >
            {/* Flecha Indicadora */}
            <Box
              sx={{
                position: 'absolute',
                top: -12,
                left: '60%',
                transform: 'translateX(-50%)',
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
    );
  }
 
  return (
    <Grid container spacing={2} sx={{ width: '90%', margin: 'auto', mt: 4 }}>
      {/* Título */}
      <Grid item xs={12}>
        <Typography variant="h3" align="center" gutterBottom>
          Realizar Solicitud de Crédito Hipotecario
        </Typography>
        <hr />
      </Grid>

      {/* FORMULARIO */}
      <Grid item xs={12} md={6}>
        <Box component="form" display="flex" flexDirection="column" gap={2}>
          <Typography variant="h5" gutterBottom>
            Datos básicos del Crédito a pedir:
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="mctypes-lists">Tipo de Crédito Hipotecario</InputLabel>
            <Select
              labelId='mctypes-lists'
              value={selectedMCType}
              onChange={handleTypeChange}
            >
              {mcTypes.map(mctype => (
                <MenuItem key={mctype.id} value={mctype.id}>
                  {mctype.type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Monto del préstamo"
            value={loanAmount}
            onChange={(e) => setLoanAmount((e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')))}
            fullWidth
            error={(loanAmount !== "" && selectedMCType === "") || loanAmount!== "" && !isLoanAmountValid}
            helperText={
              loanAmount === "" && selectedMCType !== ""  // Si está vacío pero se ha seleccionado un tipo
                ? <span style={getValidationStyle(true)}>Límite: $1 - $2.147.483.647</span>
                : loanAmount === ""  // Si está vacío
                  ? ""
                  : (loanAmount !== "" && selectedMCType === "")  // Si hay un valor pero no se ha seleccionado un tipo
                    ? "Por favor seleccione un tipo de Crédito Hipotecario"
                    : (loanAmount < 1 || loanAmount > 2147483647)  // Si está fuera del límite
                        ? <span style={getValidationStyle(false)}>Límite: $1 - $2.147.483.647</span>
                        : <span style={getValidationStyle(true)}>Límite: $1 - $2.147.483.647</span>
            }
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,  // Símbolo antes del campo
            }}
          />

          <TextField
            label="Interés Anual"
            value={annualInterestRate}
            onChange={(e) => {
              let value = e.target.value;
            
              // Permitir solo números enteros y decimales con "." o ","
              if (/^\d*([.,]?\d*)?$/.test(value)) {
                // Reemplazar "," por "." para asegurar compatibilidad numérica
                value = value.replace(',', '.');
                setAnnualInterestRate(value);
              }
            }}          
            fullWidth
            error={(annualInterestRate !== "" && selectedMCType === "") || annualInterestRate!== "" && !isAnnualInterestRateValid}
            helperText={
              annualInterestRate === "" && selectedMCType !== "" // Si está vacío pero se ha seleccionado un tipo
                ? <span style={getValidationStyle(true)}>
                    Límite: {annualInterestRateLimits.min}% - {annualInterestRateLimits.max}%
                  </span>
                : annualInterestRate === "" // Si está vacío
                  ? ""
                  : selectedMCType === "" // Si hay un valor pero no se ha seleccionado un tipo
                    ? "Por favor seleccione un tipo de Crédito Hipotecario"
                    : (annualInterestRate < annualInterestRateLimits.min || annualInterestRate > annualInterestRateLimits.max) // Si está fuera del límite
                      ? <span style={getValidationStyle(false)}>
                          Límite: {annualInterestRateLimits.min}% - {annualInterestRateLimits.max}%
                        </span>
                      : <span style={getValidationStyle(true)}>
                          Límite: {annualInterestRateLimits.min}% - {annualInterestRateLimits.max}%
                        </span>
            }            
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />

<TextField
  label="Plazo en Años"
  value={loanTerm}
  onChange={(e) => {
    let value = e.target.value;
    // Solo permitir números y no permitir puntos decimales
    if (/^\d*$/.test(value)) {
      setLoanTerm(value);
    }
  }}
  fullWidth
  error={(loanTerm !== "" && selectedMCType === "") || loanTerm!=="" && !isLoanTermValid} // Aquí se controla ambas condiciones
  helperText={
    loanTerm === "" && selectedMCType !== ""  // Si está vacío pero se ha seleccionado un tipo
      ? <span style={getValidationStyle(true)}>Límite: 1 - {loanTermLimit} años</span>
      : loanTerm === ""  // Si está vacío
        ? ""
        : (loanTerm !== "" && selectedMCType === "")  // Si hay un valor pero no se ha seleccionado un tipo
          ? "Por favor seleccione un tipo de Crédito Hipotecario"
          : (loanTerm < 1 || loanTerm > loanTermLimit)  // Si está fuera del límite
              ? <span style={getValidationStyle(false)}>Límite: 1 - {loanTermLimit} años</span>
              : <span style={getValidationStyle(true)}>Límite: 1 - {loanTermLimit} años</span>
  }
  InputProps={{
    endAdornment: <InputAdornment position="end">Años</InputAdornment>,
  }}
/>


        </Box>
      </Grid>

      {/* RESULTADO */}
      <Grid item xs={12} md={6}>

      <Grid container item xs={12} spacing={2}>
  {/* Fila 1 */}
  <Grid container item xs={12} spacing={2}>
    {/* Columna 1: Seguro de Desgravamen */}
    <Grid item xs={6} sm={6} md={6}>
      <Card sx={{ backgroundColor: '#e0e0e0' }}>
        <CardContent>
          <Typography sx={{ fontWeight: 'bold' }}>Seguro de Desgravamen</Typography>
          <br />
        </CardContent>
      </Card>
    </Grid>

    {/* Columna 2: Valor Seguro de Desgravamen */}
    <Grid item xs={6} sm={6} md={6}>
      <Card sx={{ backgroundColor: '#e0e0e0' }}>
        <CardContent>
        <Typography>
          {loanAmount!=="" && lienInsurance!==""
          ? `$${lienInsurance}`
          : '$ -'}
        </Typography>
        </CardContent>
        <FormHelperText sx={{ fontStyle: 'italic', paddingLeft: 1 }}>
          0.03% de la mensualidad
        </FormHelperText>
      </Card>
    </Grid>
  </Grid>

  {/* Fila 2 */}
  <Grid container item xs={12} spacing={2}>
    {/* Columna 1: Seguro de Incendios */}
    <Grid item xs={6} sm={6} md={6}>
      <Card sx={{ backgroundColor: '#e0e0e0' }}>
        <CardContent>
          <Typography sx={{ fontWeight: 'bold' }}>Seguro de Incendios</Typography>
          <br />
        </CardContent>
      </Card>
    </Grid>

    {/* Columna 2: Valor Seguro de Incendios */}
    <Grid item xs={6} sm={6} md={6}>
      <Card sx={{ backgroundColor: '#e0e0e0' }}>
        <CardContent>
          <Typography>${fireInsurance}</Typography>
        </CardContent>
        <FormHelperText sx={{ fontStyle: 'italic', paddingLeft: 1 }}>
          Valor fijo
        </FormHelperText>
      </Card>
    </Grid>
  </Grid>

  {/* Fila 3 */}
  <Grid container item xs={12} spacing={2}>
    {/* Columna 1: Comisión por Administración */}
    <Grid item xs={6} sm={6} md={6}>
      <Card sx={{ backgroundColor: '#e0e0e0' }}>
        <CardContent>
          <Typography sx={{ fontWeight: 'bold' }}>Comisión por Administración</Typography>
        </CardContent>
      </Card>
    </Grid>

    {/* Columna 2: Valor Comisión por Administración */}
    <Grid item xs={6} sm={6} md={6}>
      <Card sx={{ backgroundColor: '#e0e0e0' }}>
        <CardContent>
        <Typography>
          {loanAmount!=="" && administrationCommission!==""
          ? `$${administrationCommission}`
          : '$ -'}
        </Typography>
        </CardContent>
        <FormHelperText sx={{ fontStyle: 'italic', paddingLeft: 1 }}>
          1% del monto de préstamo
        </FormHelperText>
      </Card>
    </Grid>
  </Grid>
</Grid>





      </Grid>
      <Grid item xs={12} sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
  <Button
    variant="contained"
    color="info"
    onClick={handleSubmit}
    startIcon={<AttachMoneyIcon />}
    disabled={isButtonDisabled}
  >
    Solicitar Préstamo
  </Button>
</Grid>
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
    </Grid>
  );

};

export default MCApplication;
