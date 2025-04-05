import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Typography, Card, CardContent, MenuItem, Grid, FormControlLabel, Checkbox, Select, FormHelperText, FormControl, InputLabel } from '@mui/material';
import MCApplicationService from '../services/MCApplicationService';
import MCTypesService from '../services/MCTypesService';
import MCTrackingService from '../services/MCTrackingService';
import UserService from '../services/UserService';
import { useAuth } from '../context/AuthContext';
import snackbarMessage from '@mui/material/Snackbar';
import snackbarSeverity from '@mui/material/Snackbar';
import MCEvaluationService from '../services/MCEvaluationService';
import { useNavigate } from 'react-router-dom';

const MCEvaluation = () => {
    const { id } = useParams();
    const [application, setApplication] = useState(null);
    const [statuses, setStatuses] = useState([]);
    const [mcTypes, setMCTypes] = useState([]);
    const [clientName, setClientName] = useState('');
    const { auth } = useAuth();
    const [checkboxes, setCheckboxes] = useState(new Array(7).fill(false));
    const [selectedStatus, setSelectedStatus] = useState("");
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.user && auth.user.id) {
            const fetchApplication = async () => {
                try {
                    const response = await MCApplicationService.getById(id);
                    setApplication(response.data);
                    const clientResponse = await UserService.getNameById(response.data.client);
                    setClientName(clientResponse.data.name);
                } catch (error) {
                    console.log("Error al cargar la aplicación", error);
                }
            };

            const fetchStatuses = async () => {
                try {
                    const response = await MCTrackingService.getAllStatuses();
                    setStatuses(response.data.filter(status => [3, 4, 5, 6, 7, 8].includes(status.id)));
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

            fetchApplication();
            fetchStatuses();
            fetchMCTypes();
        }
    }, [auth.user, id]);

    const handleCheckboxChange = (index) => {
        const newCheckboxes = [...checkboxes];
        newCheckboxes[index] = !newCheckboxes[index];
        setCheckboxes(newCheckboxes);
    };

    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
    };

    const handleUpdateStatus = () => {
        try {
            MCEvaluationService.updateStatus(id, selectedStatus);
            setSnackbarMessage("Estado actualizado con éxito");
            setSnackbarSeverity("success");
            setOpenSnackbar(true);
            navigate("/evaluation");
        } catch (error) {
            console.log("Error al actualizar el estado", error);
            setSnackbarMessage("Error al actualizar el estado");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
        }
        console.log("Estado actualizado a:", selectedStatus);
    };

    const allCheckboxesChecked = checkboxes.every(Boolean);
    const isButtonDisabled = (!allCheckboxesChecked && ![3, 4, 5, 8].includes(selectedStatus)) || (allCheckboxesChecked && ![3, 4, 5, 6, 7, 8].includes(selectedStatus));

    if (!application) {
        return <Typography variant="h6" color="error">Aplicación no encontrada</Typography>;
    }

    const mcType = mcTypes.find(type => type.id === application.type);

    return (
        <Grid container spacing={2} sx={{ width: '90%', margin: 'auto', mt: 4 }}>
            <Grid item xs={12}>
                <Typography variant="h4" align="center" gutterBottom>
                    Evaluación de Solicitud de Crédito
                </Typography>
                <hr />
            </Grid>
            <Grid item xs={12} md={6}>
                <Box component="form" display="flex" flexDirection="column" gap={2}>
                    <Typography variant="h6" gutterBottom>
                        Revisión de Reglas
                    </Typography>
                    <Typography align="left" gutterBottom>
                        Marcar las reglas que se cumplen para la solicitud según los datos de los documentos entregados por el usuario:
                    </Typography>
                    {[
                        "1) Relación Cuota/Ingreso ",
                        "2) Historial Crediticio del Cliente",
                        "3) Antigüedad Laboral y Estabilidad",
                        "4) Relación Deuda/Ingreso",
                        "5) Monto Máximo de Financiamiento",
                        "6) Edad del Solicitante",
                        "7) Capacidad de Ahorro"
                    ].map((label, index) => (
                        <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                            <Checkbox
                                sx={{ p: 0, mr: 1 }}
                                checked={checkboxes[index]}
                                onChange={() => handleCheckboxChange(index)}
                            />
                            <Box>
                                <Box sx={{ textAlign: 'left', fontWeight: 'bold' }}>{label}</Box>
                                <FormHelperText sx={{ textAlign: 'left', textJustify: 'inter-word', mt: 0.5 }}>
                                    {index === 0 && "DOCUMENTOS REQUERIDOS: Liquidación de Sueldo o Declaración de Impuestos (SII). Para poder aprobar,  la relación Cuota/Ingreso no debe ser mayor a 35%."}
                                    {index === 1 && "DOCUMENTOS REQUERIDOS: Informe DICOM. Para poder aprobar, el cliente debe tener un buen historial, sin morosidades graves o muchas deudas pendientes."}
                                    {index === 2 && "DOCUMENTOS REQUERIDOS: Certificado de Antigüedad Laboral. Para poder aprobar, el cliente debe tener al menos de 1 a 2 años de antigüedad en su empleo actual.  Si el cliente es un trabajador independiente, se revisan sus ingresos de los últimos 2 o más años para evaluar su estabilidad financiera."}
                                    {index === 3 && "DOCUMENTOS REQUERIDOS: Informe DICOM y Liquidación de Sueldo o Declaración de Impuestos (SII). Para poder aprobar, la suma de todas las deudas del cliente (incluyendo la cuota proyectada del crédito hipotecario) no deben superar el 50% de los ingresos mensuales."}
                                    {index === 4 && "DOCUMENTOS REQUERIDOS: Tasación Bancaria o Promesa de Compraventa. Para poder aprobar, no se puede superar el monto máximo de Financiamiento (según el tipo de crédito)"}
                                    {index === 5 && "DOCUMENTOS REQUERIDOS: Fotocopia de Cédula de Identidad (Delante y Detrás). Para poder aprobar, el cliente debe tener mínimo 18 años, y un máximo de 75. Si está muy cercano a la edad máxima, se considera la aprobación o rechazo."}
                                    {index === 6 && "DOCUMENTOS REQUERIDOS: Estados de Cuentas Bancarias. Para poder aprobar, el cliente debe poder demostrar una buena capacidad de ahorro, a través del saldo actual de sus cuentas, historial de ahorros consistentes y periódicos, la relación saldo y años de antigüedad y los retiros recientes."}
                                </FormHelperText>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Grid>
            <Grid item xs={12} md={6}>
                <Box component="form" display="flex" flexDirection="column" gap={2}>
                    <Typography variant="h6" gutterBottom>
                        Datos de la solicitud
                    </Typography>
                </Box>
                <Grid container item xs={12} spacing={2}>
                    <Grid container item xs={12} spacing={2}>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Id de la Solicitud:</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '0.9rem' }}>
                                        {application.id}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} spacing={2}>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Cliente:</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '0.9rem' }}>
                                        {clientName}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} spacing={2}>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Tipo de Préstamo:</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '0.9rem' }}>
                                        {mcType ? mcType.type : "Desconocido"}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} spacing={2}>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Monto del Préstamo:</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '0.9rem' }}>
                                        ${application.loanAmount} (CLP)
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} spacing={2}>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Interés Anual:</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '0.9rem' }}>
                                        {application.annualInterestRate}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} spacing={2}>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Plazo en Años:</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '0.9rem' }}>
                                        {application.loanTerm} Años
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} spacing={2}>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Seguro de Gravamen:</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '0.9rem' }}>
                                        $ {application.lienInsurance}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} spacing={2}>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Seguro contra Incendios:</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '0.9rem' }}>
                                        $ {application.fireInsurance}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} spacing={2}>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Comisión de Administración:</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '0.9rem' }}>
                                        $ {application.administrationCommission}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} spacing={2}>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Estado:</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Card sx={{ backgroundColor: '#e0e0e0', height: '50px', minHeight: '50px' }}>
                                <CardContent>
                                    <Typography sx={{ fontSize: '0.9rem' }}>
                                        {statuses.find(status => status.id === application.status)?.status || "Desconocido"}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <FormControl sx={{ minWidth: 200, mr: 2 }}>
                    <InputLabel id="status-select-label">Cambiar Estado</InputLabel>
                    <Select
                        labelId="status-select-label"
                        value={selectedStatus}
                        onChange={handleStatusChange}
                    >
                        {statuses.map(status => (
                            <MenuItem key={status.id} value={status.id}>
                                {status.status}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateStatus}
                    disabled={isButtonDisabled}
                >
                    Actualizar Estado
                </Button>
            </Grid>
        </Grid>
    );
};

export default MCEvaluation;
