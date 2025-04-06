import React, { useEffect, useState } from 'react';
import MCSimulationService from '../services/MCSimulationService';
import MCTypesService from '../services/MCTypesService';

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

const MCSimulation = () => {
  const [loanAmount, setLoanAmount] = useState("");
  const [annualInterestRate, setAnnualInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [mcTypes, setMCTypes] = useState([]);
  const [selectedMCType, setSelectedMCType] = useState("");
  const [simulationResult, setSimulationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [annualInterestRateLimits, setAnnualInterestRateLimits] = useState({ min: 0, max: 0 });
  const [loanTermLimit, setLoanTermLimit] = useState(0);
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
        setSimulationResult(response.data); // Almacena todos los valores devueltos
        console.log("Simulación exitosa", response.data);
      })
      .catch((error) => {
        console.log("Error al simular", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const isLoanAmountValid = loanAmount !== "" && parseInt(loanAmount.replace(/\./g, '')) > 0 && parseInt(loanAmount.replace(/\./g, '')) <= 9999999999;
  const isAnnualInterestRateValid = annualInterestRate >= annualInterestRateLimits.min && annualInterestRate <= annualInterestRateLimits.max && annualInterestRate !== 0;
  const isLoanTermValid = loanTerm >= 1 && loanTerm <= loanTermLimit;

  const isButtonDisabled = !(isLoanAmountValid && isAnnualInterestRateValid && isLoanTermValid && selectedMCType !== "");

  const getValidationStyle = (isValid) => ({ color: isValid ? 'inherit' : 'red' });

  return (
    <Grid container spacing={2} sx={{ width: '90%', margin: 'auto', mt: 4 }}>
      {/* FORMULARIO */}
      <Grid item xs={12} md={6}>
        <Box component="form" display="flex" flexDirection="column" gap={2}>
          <Typography variant="h4" align="center" gutterBottom>
            Simular Crédito Bancario
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
            onChange={(e) => setLoanAmount(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
            fullWidth
            error={(loanAmount !== "" && selectedMCType === "") || loanAmount!== "" && !isLoanAmountValid}
            helperText={
              loanAmount === "" && selectedMCType !== ""  // Si está vacío pero se ha seleccionado un tipo
                ? <span style={getValidationStyle(true)}>Límite: $1 - $9.999.999.999</span>
                : loanAmount === ""  // Si está vacío
                  ? ""
                  : (loanAmount !== "" && selectedMCType === "")  // Si hay un valor pero no se ha seleccionado un tipo
                    ? "Por favor seleccione un tipo de Crédito Hipotecario"
                    : (loanAmount < 1 || loanAmount > 9999999999)  // Si está fuera del límite
                        ? <span style={getValidationStyle(false)}>Límite: $1 - $9.999.999.999</span>
                        : <span style={getValidationStyle(true)}>Límite: $1 - $9.999.999.999</span>
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

          <Button
            variant="contained"
            color="info"
            onClick={simulateMC}
            startIcon={<MonetizationOnIcon />}
            disabled={isButtonDisabled}
          >
            Simular Crédito
          </Button>
        </Box>
      </Grid>

{/* RESULTADO */}
<Grid item xs={12} md={6}>
  <Card>
    <CardContent>
      <Typography variant="h5" gutterBottom>
        Resultado de la Simulación
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : simulationResult ? (
        <>
          <Typography>
            <strong>Monto del Préstamo:</strong> ${simulationParams.loanAmount}
          </Typography>
          <Typography>
            <strong>Interés Anual:</strong> {simulationParams.annualInterestRate.toLocaleString()}%
          </Typography>
          <Typography>
            <strong>Plazo:</strong> {simulationParams.loanTerm} años
          </Typography>
          <Typography>
            <strong>Pago Mensual Bruto:</strong> ${simulationResult[0].toLocaleString()}
          </Typography>
          <Typography>
            <strong>Seguro de Gravamen:</strong> ${simulationResult[1].toLocaleString()}
          </Typography>
          <Typography>
            <strong>Seguro contra Incendios:</strong> ${simulationResult[2].toLocaleString()}
          </Typography>
          <Typography>
            <strong>Comisión Administrativa:</strong> ${simulationResult[3].toLocaleString()}
          </Typography>
          <Typography>
            <strong>Costo Mensual Total:</strong> ${simulationResult[4].toLocaleString()}
          </Typography>
          <Typography variant="h6" mt={2}>
            <strong>Costo Total del Préstamo:</strong> ${simulationResult[5].toLocaleString()}
          </Typography>
        </>
      ) : (
        <Typography>
          Realiza una simulación para ver el resultado aquí.
        </Typography>
      )}
    </CardContent>
  </Card>
</Grid>


    </Grid>
  );
};

export default MCSimulation;
